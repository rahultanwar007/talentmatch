"use server";

import { db } from "@/lib/db";
import {
  projectPlacements,
  projects,
  employers,
  employerSkills,
  projectSkills,
  courses,
} from "@/lib/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  calculateMatchAnalysis,
  ProjectInput,
  EmployerInput,
  CourseInput,
} from "@/lib/engine/matcher";
import { MatchAnalysis } from "@/lib/engine/types";
import { ProjectWithDetails } from "./projects";
import { EmployerWithDetails } from "./employers";

export type PlacementStage =
  | "Matched"
  | "Shortlisted"
  | "Interview"
  | "In Upskilling"
  | "Placed"
  | "Archived";

export interface PlacementWithDetails {
  id: string;
  projectId: string;
  employerId: string;
  stage: PlacementStage;
  matchScore: number;
  notes: string | null;
  assignedRole: string | null;
  createdAt: Date;
  updatedAt: Date;
  employer: EmployerWithDetails;
  matchAnalysis: MatchAnalysis;
}

export interface ProjectPipelineData {
  project: ProjectWithDetails;
  placements: PlacementWithDetails[];
  stageCounts: Record<PlacementStage, number>;
  totalCount: number;
  placedCount: number;
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // safely ignore when invoked outside Next.js request context
  }
}

/**
 * Retrieves the full ATS staffing pipeline for a given project.
 */
export async function getProjectPipeline(
  projectId: string
): Promise<ProjectPipelineData | null> {
  try {
    // 1. Fetch project with skills and company
    const projectRecord = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        company: true,
        skills: true,
      },
    });

    if (!projectRecord) return null;

    const project: ProjectWithDetails = {
      id: projectRecord.id,
      companyId: projectRecord.companyId,
      companyName: projectRecord.company.name,
      companyLogo: projectRecord.company.logoUrl,
      companyIndustry: projectRecord.company.industry,
      title: projectRecord.title,
      description: projectRecord.description,
      category: projectRecord.category,
      minExperienceYears: projectRecord.minExperienceYears,
      budget: projectRecord.budget,
      status: projectRecord.status,
      createdAt: projectRecord.createdAt,
      skills: projectRecord.skills,
    };

    // 2. Fetch available courses for gap analysis
    const coursesList = await db.query.courses.findMany();
    const courseInputs: CourseInput[] = coursesList.map((c) => ({
      id: c.id,
      title: c.title,
      provider: c.provider,
      url: c.url,
      skillTag: c.skillTag,
      difficulty: c.difficulty,
      duration: c.duration,
      rating: c.rating,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
    }));

    // 3. Fetch placements for this project
    const placementRecords = await db.query.projectPlacements.findMany({
      where: eq(projectPlacements.projectId, projectId),
      orderBy: [desc(projectPlacements.updatedAt)],
      with: {
        employer: {
          with: {
            skills: true,
          },
        },
      },
    });

    const projectInput: ProjectInput = {
      id: project.id,
      title: project.title,
      minExperienceYears: project.minExperienceYears,
      skills: project.skills.map((s) => ({
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    };

    const stageCounts: Record<PlacementStage, number> = {
      Matched: 0,
      Shortlisted: 0,
      Interview: 0,
      "In Upskilling": 0,
      Placed: 0,
      Archived: 0,
    };

    const placements: PlacementWithDetails[] = placementRecords.map((p) => {
      const employer = p.employer;
      const employerInput: EmployerInput = {
        id: employer.id,
        name: employer.name,
        yearsOfExperience: employer.yearsOfExperience,
        skills: employer.skills.map((s) => ({
          skillName: s.skillName,
          proficiencyLevel: s.proficiencyLevel,
          yearsExperience: s.yearsExperience,
        })),
      };

      const matchAnalysis = calculateMatchAnalysis(
        projectInput,
        employerInput,
        courseInputs
      );

      const stage = p.stage as PlacementStage;
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++;
      }

      return {
        id: p.id,
        projectId: p.projectId,
        employerId: p.employerId,
        stage,
        matchScore: matchAnalysis.overallScore,
        notes: p.notes,
        assignedRole: p.assignedRole,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        employer,
        matchAnalysis,
      };
    });

    return {
      project,
      placements,
      stageCounts,
      totalCount: placements.length,
      placedCount: stageCounts.Placed,
    };
  } catch (error) {
    console.error("Error in getProjectPipeline:", error);
    return null;
  }
}

/**
 * Transitions a candidate's pipeline stage and synchronizes availability upon placement.
 */
export async function updatePlacementStage(
  placementId: string,
  newStage: PlacementStage,
  notes?: string
) {
  try {
    const existing = await db.query.projectPlacements.findFirst({
      where: eq(projectPlacements.id, placementId),
    });

    if (!existing) {
      return { success: false, error: "Placement record not found" };
    }

    const previousStage = existing.stage as PlacementStage;

    // Update the placement record
    const [updated] = await db
      .update(projectPlacements)
      .set({
        stage: newStage,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(projectPlacements.id, placementId))
      .returning();

    // Availability Synchronization:
    // If placed, mark candidate as Assigned
    if (newStage === "Placed") {
      await db
        .update(employers)
        .set({
          availability: "Assigned",
          updatedAt: new Date(),
        })
        .where(eq(employers.id, existing.employerId));
    }
    // If demoted from Placed, check if candidate is placed in any other project
    else if (previousStage === "Placed") {
      const otherPlaced = await db.query.projectPlacements.findFirst({
        where: and(
          eq(projectPlacements.employerId, existing.employerId),
          eq(projectPlacements.stage, "Placed"),
          ne(projectPlacements.id, placementId)
        ),
      });

      if (!otherPlaced) {
        await db
          .update(employers)
          .set({
            availability: "Available",
            updatedAt: new Date(),
          })
          .where(eq(employers.id, existing.employerId));
      }
    }

    // Revalidate affected routes
    safeRevalidatePath(`/projects/${existing.projectId}/pipeline`);
    safeRevalidatePath(`/projects/${existing.projectId}`);
    safeRevalidatePath(`/employers/${existing.employerId}`);
    safeRevalidatePath("/employers");
    safeRevalidatePath("/projects");
    safeRevalidatePath("/");

    return {
      success: true,
      placement: updated,
      previousStage,
      newStage,
    };
  } catch (error: any) {
    console.error("Error updating placement stage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Adds a candidate to a project's ATS staffing pipeline.
 */
export async function addCandidateToPipeline(
  projectId: string,
  employerId: string,
  stage: PlacementStage = "Matched",
  notes?: string,
  assignedRole?: string
) {
  try {
    // Check if already in pipeline
    const existing = await db.query.projectPlacements.findFirst({
      where: and(
        eq(projectPlacements.projectId, projectId),
        eq(projectPlacements.employerId, employerId)
      ),
    });

    if (existing) {
      // If already in pipeline, optionally update stage if specified
      const [updated] = await db
        .update(projectPlacements)
        .set({
          stage,
          notes: notes !== undefined ? notes : existing.notes,
          assignedRole: assignedRole !== undefined ? assignedRole : existing.assignedRole,
          updatedAt: new Date(),
        })
        .where(eq(projectPlacements.id, existing.id))
        .returning();

      if (stage === "Placed") {
        await db
          .update(employers)
          .set({ availability: "Assigned", updatedAt: new Date() })
          .where(eq(employers.id, employerId));
      }

      safeRevalidatePath(`/projects/${projectId}/pipeline`);
      safeRevalidatePath(`/projects/${projectId}`);
      safeRevalidatePath(`/employers/${employerId}`);

      return { success: true, placement: updated, alreadyExisted: true };
    }

    // Insert new placement
    const [inserted] = await db
      .insert(projectPlacements)
      .values({
        projectId,
        employerId,
        stage,
        notes: notes || null,
        assignedRole: assignedRole || null,
      })
      .returning();

    if (stage === "Placed") {
      await db
        .update(employers)
        .set({ availability: "Assigned", updatedAt: new Date() })
        .where(eq(employers.id, employerId));
    }

    safeRevalidatePath(`/projects/${projectId}/pipeline`);
    safeRevalidatePath(`/projects/${projectId}`);
    safeRevalidatePath(`/employers/${employerId}`);
    safeRevalidatePath("/employers");

    return { success: true, placement: inserted, alreadyExisted: false };
  } catch (error: any) {
    console.error("Error adding candidate to pipeline:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Removes a candidate from a project's pipeline.
 */
export async function removeCandidateFromPipeline(placementId: string) {
  try {
    const existing = await db.query.projectPlacements.findFirst({
      where: eq(projectPlacements.id, placementId),
    });

    if (!existing) {
      return { success: false, error: "Placement not found" };
    }

    // If was Placed, check availability
    if (existing.stage === "Placed") {
      const otherPlaced = await db.query.projectPlacements.findFirst({
        where: and(
          eq(projectPlacements.employerId, existing.employerId),
          eq(projectPlacements.stage, "Placed"),
          ne(projectPlacements.id, placementId)
        ),
      });

      if (!otherPlaced) {
        await db
          .update(employers)
          .set({ availability: "Available", updatedAt: new Date() })
          .where(eq(employers.id, existing.employerId));
      }
    }

    await db
      .delete(projectPlacements)
      .where(eq(projectPlacements.id, placementId));

    safeRevalidatePath(`/projects/${existing.projectId}/pipeline`);
    safeRevalidatePath(`/projects/${existing.projectId}`);
    safeRevalidatePath(`/employers/${existing.employerId}`);
    safeRevalidatePath("/employers");

    return { success: true };
  } catch (error: any) {
    console.error("Error removing candidate from pipeline:", error);
    return { success: false, error: error.message };
  }
}

export interface CandidatePlacementItem {
  id: string;
  stage: PlacementStage;
  notes: string | null;
  assignedRole: string | null;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
    category: string;
    minExperienceYears: number;
    company: {
      id: string;
      name: string;
    };
  };
}

/**
 * Retrieves all active project staffing placements for a given candidate.
 */
export async function getCandidatePlacements(
  employerId: string
): Promise<CandidatePlacementItem[]> {
  try {
    const records = await db.query.projectPlacements.findMany({
      where: eq(projectPlacements.employerId, employerId),
      orderBy: [desc(projectPlacements.updatedAt)],
      with: {
        project: {
          with: {
            company: true,
          },
        },
      },
    });

    return records.map((r) => ({
      id: r.id,
      stage: r.stage as PlacementStage,
      notes: r.notes,
      assignedRole: r.assignedRole,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      project: r.project,
    }));
  } catch (error) {
    console.error("Error getting candidate placements:", error);
    return [];
  }
}

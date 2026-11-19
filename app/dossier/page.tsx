import React from "react";
import { notFound } from "next/navigation";
import { getProjectById, getProjects } from "@/lib/actions/projects";
import { getEmployerById, getEmployers } from "@/lib/actions/employers";
import { getCourses } from "@/lib/actions/courses";
import { db } from "@/lib/db";
import { projectPlacements } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { calculateMatchAnalysis, ProjectInput, EmployerInput, CourseInput } from "@/lib/engine/matcher";
import { ExecutiveDossierView } from "@/components/dossier/executive-dossier-view";
import { CandidatePlacementItem } from "@/lib/actions/pipeline";

interface PageProps {
  searchParams: Promise<{
    projectId?: string;
    employerId?: string;
  }>;
}

export default async function ExecutiveDossierPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  // If no params given, default to first project and employer
  let projectId = resolvedParams.projectId;
  let employerId = resolvedParams.employerId;

  if (!projectId || !employerId) {
    const [allProjects, allEmployers] = await Promise.all([
      getProjects(),
      getEmployers(),
    ]);

    if (!projectId && allProjects[0]) projectId = allProjects[0].id;
    if (!employerId && allEmployers[0]) employerId = allEmployers[0].id;
  }

  if (!projectId || !employerId) {
    notFound();
  }

  const [project, employer, courses] = await Promise.all([
    getProjectById(projectId),
    getEmployerById(employerId),
    getCourses(),
  ]);

  if (!project || !employer) {
    notFound();
  }

  // Calculate Match Analysis
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

  const courseInputs: CourseInput[] = courses.map((c) => ({
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

  const analysis = calculateMatchAnalysis(projectInput, employerInput, courseInputs);

  // Check if placement exists
  let placementItem: CandidatePlacementItem | null = null;
  const placementRecord = await db.query.projectPlacements.findFirst({
    where: and(
      eq(projectPlacements.projectId, projectId),
      eq(projectPlacements.employerId, employerId)
    ),
    with: {
      project: {
        with: {
          company: true,
        },
      },
    },
  });

  if (placementRecord) {
    placementItem = {
      id: placementRecord.id,
      stage: placementRecord.stage as any,
      notes: placementRecord.notes,
      assignedRole: placementRecord.assignedRole,
      createdAt: placementRecord.createdAt,
      updatedAt: placementRecord.updatedAt,
      project: placementRecord.project,
    };
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ExecutiveDossierView
        project={project}
        employer={employer}
        analysis={analysis}
        placement={placementItem}
      />
    </div>
  );
}

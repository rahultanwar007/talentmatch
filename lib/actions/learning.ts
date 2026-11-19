"use server";

import { db } from "@/lib/db";
import {
  candidateCourseProgress,
  courses,
  employers,
  employerSkills,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { areSkillsEquivalent } from "@/lib/engine/matcher";

export interface CandidateCourseEnrollment {
  id: string;
  employerId: string;
  courseId: string;
  status: "In Progress" | "Completed";
  enrolledAt: Date;
  completedAt: Date | null;
  course: {
    id: string;
    title: string;
    provider: string;
    url: string;
    skillTag: string;
    difficulty: string;
    duration: string;
    rating: string | null;
    description: string | null;
    thumbnailUrl: string | null;
  };
}

export async function getCandidateLearningProgress(
  employerId: string
): Promise<CandidateCourseEnrollment[]> {
  try {
    const records = await db.query.candidateCourseProgress.findMany({
      where: eq(candidateCourseProgress.employerId, employerId),
      orderBy: [desc(candidateCourseProgress.enrolledAt)],
      with: {
        course: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      employerId: r.employerId,
      courseId: r.courseId,
      status: r.status as "In Progress" | "Completed",
      enrolledAt: r.enrolledAt,
      completedAt: r.completedAt,
      course: r.course,
    }));
  } catch (error) {
    console.error("Error fetching candidate learning progress:", error);
    return [];
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // safely ignore when invoked outside Next.js request context (e.g. CLI/tests)
  }
}

export async function enrollInCourse(employerId: string, courseId: string) {
  try {
    // Check if already enrolled
    const existing = await db.query.candidateCourseProgress.findFirst({
      where: and(
        eq(candidateCourseProgress.employerId, employerId),
        eq(candidateCourseProgress.courseId, courseId)
      ),
    });

    if (existing) {
      return {
        success: true,
        alreadyEnrolled: true,
        status: existing.status,
      };
    }

    const [enrollment] = await db
      .insert(candidateCourseProgress)
      .values({
        employerId,
        courseId,
        status: "In Progress",
      })
      .returning();

    safeRevalidatePath(`/employers/${employerId}`);
    safeRevalidatePath("/employers");
    safeRevalidatePath("/match");

    return {
      success: true,
      alreadyEnrolled: false,
      enrollmentId: enrollment.id,
    };
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    return { success: false, error: error.message };
  }
}

export async function completeCourseAndPromoteSkill(
  employerId: string,
  courseId: string
) {
  try {
    // 1. Fetch course details
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // 2. Update or insert enrollment record
    const existingProgress =
      await db.query.candidateCourseProgress.findFirst({
        where: and(
          eq(candidateCourseProgress.employerId, employerId),
          eq(candidateCourseProgress.courseId, courseId)
        ),
      });

    if (existingProgress) {
      await db
        .update(candidateCourseProgress)
        .set({
          status: "Completed",
          completedAt: new Date(),
        })
        .where(eq(candidateCourseProgress.id, existingProgress.id));
    } else {
      await db.insert(candidateCourseProgress).values({
        employerId,
        courseId,
        status: "Completed",
        completedAt: new Date(),
      });
    }

    // 3. Automated Profile Skill Promotion:
    // Check if candidate already has this skill or equivalent
    const candidateSkills = await db.query.employerSkills.findMany({
      where: eq(employerSkills.employerId, employerId),
    });

    const matchingSkill = candidateSkills.find((s) =>
      areSkillsEquivalent(s.skillName, course.skillTag)
    );

    let oldProficiency = 0;
    let newProficiency = 2;
    let skillName = course.skillTag;

    if (matchingSkill) {
      oldProficiency = matchingSkill.proficiencyLevel;
      // Promote skill level by +1 (capped at Level 4 Expert)
      newProficiency = Math.min(4, matchingSkill.proficiencyLevel + 1);
      skillName = matchingSkill.skillName;

      await db
        .update(employerSkills)
        .set({
          proficiencyLevel: newProficiency,
          yearsExperience: matchingSkill.yearsExperience + 1,
        })
        .where(eq(employerSkills.id, matchingSkill.id));
    } else {
      // Candidate didn't have this skill before: add it as new verified competency
      oldProficiency = 0;
      newProficiency = course.difficulty === "Advanced" ? 3 : 2;

      await db.insert(employerSkills).values({
        employerId,
        skillName: course.skillTag,
        proficiencyLevel: newProficiency,
        yearsExperience: 1,
      });
    }

    // Revalidate all affected routes so match rankings refresh immediately
    safeRevalidatePath(`/employers/${employerId}`);
    safeRevalidatePath("/employers");
    safeRevalidatePath("/match");
    safeRevalidatePath("/projects");
    safeRevalidatePath("/");

    return {
      success: true,
      skillName,
      oldProficiency,
      newProficiency,
      courseTitle: course.title,
    };
  } catch (error: any) {
    console.error("Error completing course and promoting skill:", error);
    return { success: false, error: error.message };
  }
}

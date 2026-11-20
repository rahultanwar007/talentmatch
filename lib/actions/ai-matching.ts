"use server";

import { db } from "@/lib/db";
import { projects, employers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { evaluateAISemanticMatch, AIMatchAnalysis } from "@/lib/engine/ai-matcher";
import { MatchWeights } from "@/lib/engine/types";
import { DEFAULT_WEIGHTS } from "@/lib/engine/matcher";

export interface AISemanticMatchResponse {
  success: boolean;
  data?: AIMatchAnalysis;
  error?: string;
}

/**
 * Server action to evaluate a candidate against a project requisition
 * using the self-hosted Ollama / Llama AI Semantic engine.
 */
export async function getAISemanticMatch(
  projectId: string,
  employerId: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<AISemanticMatchResponse> {
  try {
    if (!projectId || !employerId) {
      return { success: false, error: "Project ID and Candidate ID are required." };
    }

    // 1. Fetch project with skills
    const projectRecord = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        skills: true,
        company: true,
      },
    });

    if (!projectRecord) {
      return { success: false, error: "Project requisition not found." };
    }

    // 2. Fetch candidate with skills
    const employerRecord = await db.query.employers.findFirst({
      where: eq(employers.id, employerId),
      with: {
        skills: true,
      },
    });

    if (!employerRecord) {
      return { success: false, error: "Candidate profile not found." };
    }

    // 3. Format inputs for AI evaluation
    const projectInput = {
      id: projectRecord.id,
      title: projectRecord.title,
      description: projectRecord.description,
      category: projectRecord.category,
      minExperienceYears: projectRecord.minExperienceYears,
      skills: projectRecord.skills.map((s) => ({
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    };

    const employerInput = {
      id: employerRecord.id,
      name: employerRecord.name,
      roleTitle: employerRecord.roleTitle,
      bio: employerRecord.bio || undefined,
      yearsOfExperience: employerRecord.yearsOfExperience,
      skills: employerRecord.skills.map((s) => ({
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel,
        yearsExperience: s.yearsExperience,
      })),
    };

    // 4. Run AI Semantic Matcher
    const analysis = await evaluateAISemanticMatch(projectInput, employerInput, weights);

    return {
      success: true,
      data: analysis,
    };
  } catch (error: any) {
    console.error("Error in getAISemanticMatch server action:", error);
    return {
      success: false,
      error: error?.message || "Failed to evaluate AI semantic match.",
    };
  }
}

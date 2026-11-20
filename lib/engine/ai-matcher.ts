import { ProjectInput, EmployerInput, calculateMatchAnalysis } from "./matcher";
import { MatchWeights } from "./types";

export interface AISemanticSkillMatch {
  projectSkill: string;
  candidateMatchedSkill: string | null;
  similarity: number; // 0.0 - 1.0
  transferabilityNote: string;
  status: "equivalent" | "transferable" | "partial" | "unmatched";
}

export interface AIMatchAnalysis {
  semanticScore: number; // 0 - 100
  standardScore: number; // baseline from mathematical matcher
  scoreDelta: number; // semanticScore - standardScore
  executiveSummary: string;
  semanticSkills: AISemanticSkillMatch[];
  keyStrengths: string[];
  potentialRisks: string[];
  onboardingVelocity: "Immediate (1-2 weeks)" | "Moderate (3-5 weeks)" | "Extensive (6+ weeks)";
  modelUsed: string;
  isFallback?: boolean;
  fallbackReason?: string;
}

interface RawLLMResponse {
  semanticScore?: number;
  executiveSummary?: string;
  semanticSkills?: Array<{
    projectSkill?: string;
    candidateMatchedSkill?: string | null;
    similarity?: number;
    transferabilityNote?: string;
    status?: string;
  }>;
  keyStrengths?: string[];
  potentialRisks?: string[];
  onboardingVelocity?: string;
}

/**
 * Strips markdown code blocks and extracts JSON cleanly.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  // Remove markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  return cleaned.trim();
}

/**
 * Evaluates semantic talent-to-project match using the self-hosted Ollama / Llama API.
 */
export async function evaluateAISemanticMatch(
  project: ProjectInput & { description?: string; category?: string },
  employer: EmployerInput & { roleTitle?: string; bio?: string },
  weights?: MatchWeights
): Promise<AIMatchAnalysis> {
  const standardAnalysis = calculateMatchAnalysis(project, employer, [], weights);
  const standardScore = standardAnalysis.overallScore;

  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL || "llama-3.1-8b";
  const apiKey = process.env.AI_API_KEY;

  // Fallback if no AI endpoint configured
  if (!baseUrl) {
    return {
      semanticScore: standardScore,
      standardScore,
      scoreDelta: 0,
      executiveSummary: "AI Semantic matching is currently unconfigured. Showing standard mathematical match.",
      semanticSkills: project.skills.map((s) => ({
        projectSkill: s.skillName,
        candidateMatchedSkill: employer.skills.find((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase())?.skillName || null,
        similarity: employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()) ? 1.0 : 0.0,
        transferabilityNote: "Exact keyword evaluation",
        status: employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()) ? "equivalent" : "unmatched",
      })),
      keyStrengths: employer.skills.slice(0, 3).map((s) => s.skillName),
      potentialRisks: project.skills.filter((s) => s.isRequired && !employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase())).map((s) => `Missing required: ${s.skillName}`),
      onboardingVelocity: standardScore >= 80 ? "Immediate (1-2 weeks)" : standardScore >= 60 ? "Moderate (3-5 weeks)" : "Extensive (6+ weeks)",
      modelUsed: "offline-baseline",
      isFallback: true,
      fallbackReason: "AI_BASE_URL environment variable is missing",
    };
  }

  const projectSkillsFormatted = project.skills
    .map((s) => `- ${s.skillName} (Min Proficiency: ${s.minProficiency}/4, ${s.isRequired ? "REQUIRED" : "Preferred"})`)
    .join("\n");

  const candidateSkillsFormatted = employer.skills
    .map((s) => `- ${s.skillName} (Proficiency: ${s.proficiencyLevel}/4, ${s.yearsExperience} yrs exp)`)
    .join("\n");

  const systemPrompt = `You are an elite enterprise technical talent assessor and AI talent matching engine.
Your mission is to evaluate SEMANTIC skill equivalence and conceptual transferability between project requirements and a candidate's actual skills.
Evaluate whether the candidate has adjacent, transferable, or equivalent technical knowledge (e.g. MySQL/CockroachDB knowledge transferable to PostgreSQL; GCP/Terraform knowledge transferable to AWS; React Native knowledge transferable to React, etc.).

CRITICAL: You must return ONLY a raw JSON object matching the schema below. Do not wrap in markdown or prose outside the JSON.
JSON Schema:
{
  "semanticScore": <integer between 0 and 100 representing overall calibrated fit>,
  "executiveSummary": "<2-3 concise sentences synthesizing candidate technical alignment and domain viability>",
  "semanticSkills": [
    {
      "projectSkill": "<name of required project skill>",
      "candidateMatchedSkill": "<name of candidate skill matched or null if none>",
      "similarity": <number between 0.0 and 1.0>,
      "transferabilityNote": "<concise 1-sentence explanation of why/how candidate skill satisfies or transfers to this requirement>",
      "status": "<one of: 'equivalent' | 'transferable' | 'partial' | 'unmatched'>"
    }
  ],
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "potentialRisks": ["<risk or skill gap 1>", "<risk 2>"],
  "onboardingVelocity": "<one of: 'Immediate (1-2 weeks)' | 'Moderate (3-5 weeks)' | 'Extensive (6+ weeks)'>"
}`;

  const userPrompt = `PROJECT REQUISITION:
Title: ${project.title || "Technical Project"}
Category: ${project.category || "General Engineering"}
Minimum Experience: ${project.minExperienceYears} years
Description: ${project.description || "Enterprise engineering project"}
Required Skills:
${projectSkillsFormatted}

CANDIDATE PROFILE:
Name: ${employer.name || "Candidate"}
Role: ${employer.roleTitle || "Software Engineer"}
Experience: ${employer.yearsOfExperience} years
Bio: ${employer.bio || "Experienced technical engineer"}
Candidate Verified Skills:
${candidateSkillsFormatted}

Baseline Mathematical Score: ${standardScore}%

Assess the candidate against every project skill listed above. Return the exact JSON schema requested.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18-second timeout for local/hosted LLM

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    const cleanedJson = cleanJsonOutput(rawContent);
    const parsed: RawLLMResponse = JSON.parse(cleanedJson);

    // Validate and sanitize parsed response
    const semanticScore = typeof parsed.semanticScore === "number" && !isNaN(parsed.semanticScore)
      ? Math.max(0, Math.min(100, Math.round(parsed.semanticScore)))
      : standardScore;

    const semanticSkills: AISemanticSkillMatch[] = Array.isArray(parsed.semanticSkills)
      ? parsed.semanticSkills.map((s) => ({
          projectSkill: s.projectSkill || "Technical Competency",
          candidateMatchedSkill: s.candidateMatchedSkill || null,
          similarity: typeof s.similarity === "number" ? Math.max(0, Math.min(1, s.similarity)) : 0,
          transferabilityNote: s.transferabilityNote || "Direct or adjacent skill alignment",
          status: (["equivalent", "transferable", "partial", "unmatched"].includes(s.status || "")
            ? s.status
            : (s.similarity || 0) >= 0.85
            ? "equivalent"
            : (s.similarity || 0) >= 0.6
            ? "transferable"
            : (s.similarity || 0) > 0.2
            ? "partial"
            : "unmatched") as AISemanticSkillMatch["status"],
        }))
      : project.skills.map((s) => ({
          projectSkill: s.skillName,
          candidateMatchedSkill: employer.skills.find((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase())?.skillName || null,
          similarity: employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()) ? 1.0 : 0.0,
          transferabilityNote: "Evaluated skill alignment",
          status: employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()) ? "equivalent" : "unmatched",
        }));

    const validVelocities: AIMatchAnalysis["onboardingVelocity"][] = [
      "Immediate (1-2 weeks)",
      "Moderate (3-5 weeks)",
      "Extensive (6+ weeks)",
    ];

    const onboardingVelocity: AIMatchAnalysis["onboardingVelocity"] = validVelocities.includes(
      parsed.onboardingVelocity as any
    )
      ? (parsed.onboardingVelocity as AIMatchAnalysis["onboardingVelocity"])
      : semanticScore >= 80
      ? "Immediate (1-2 weeks)"
      : semanticScore >= 60
      ? "Moderate (3-5 weeks)"
      : "Extensive (6+ weeks)";

    return {
      semanticScore,
      standardScore,
      scoreDelta: semanticScore - standardScore,
      executiveSummary:
        parsed.executiveSummary ||
        `Candidate possesses a ${semanticScore}% semantic match alignment with technical requirements.`,
      semanticSkills,
      keyStrengths: Array.isArray(parsed.keyStrengths) && parsed.keyStrengths.length > 0
        ? parsed.keyStrengths
        : employer.skills.slice(0, 3).map((s) => s.skillName),
      potentialRisks: Array.isArray(parsed.potentialRisks) && parsed.potentialRisks.length > 0
        ? parsed.potentialRisks
        : project.skills.filter((s) => s.isRequired && !employer.skills.some((es) => es.skillName.toLowerCase() === s.skillName.toLowerCase())).map((s) => `Missing required: ${s.skillName}`),
      onboardingVelocity,
      modelUsed: model,
      isFallback: false,
    };
  } catch (error: any) {
    console.error("AI Semantic Match fallback triggered:", error?.message || error);
    return {
      semanticScore: standardScore,
      standardScore,
      scoreDelta: 0,
      executiveSummary: `AI Semantic analysis fell back to standard mathematical matching (${standardScore}%). Reason: ${error?.message || "Service unavailable"}`,
      semanticSkills: project.skills.map((s) => {
        const exactMatch = employer.skills.find(
          (es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()
        );
        return {
          projectSkill: s.skillName,
          candidateMatchedSkill: exactMatch ? exactMatch.skillName : null,
          similarity: exactMatch ? 1.0 : 0.0,
          transferabilityNote: exactMatch
            ? `Exact verified match (Level ${exactMatch.proficiencyLevel}/4)`
            : "No verified direct skill in candidate profile",
          status: exactMatch ? "equivalent" : "unmatched",
        };
      }),
      keyStrengths: employer.skills.slice(0, 3).map((s) => s.skillName),
      potentialRisks: project.skills
        .filter(
          (s) =>
            s.isRequired &&
            !employer.skills.some(
              (es) => es.skillName.toLowerCase() === s.skillName.toLowerCase()
            )
        )
        .map((s) => `Missing required: ${s.skillName}`),
      onboardingVelocity:
        standardScore >= 80
          ? "Immediate (1-2 weeks)"
          : standardScore >= 60
          ? "Moderate (3-5 weeks)"
          : "Extensive (6+ weeks)",
      modelUsed: model,
      isFallback: true,
      fallbackReason: error?.message || "Timeout or unreachable endpoint",
    };
  }
}

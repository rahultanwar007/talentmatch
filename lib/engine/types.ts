export type SkillStatus = "matched" | "under_proficient" | "missing";

export interface SkillMatchResult {
  skillName: string;
  isRequired: boolean;
  requiredProficiency: number; // 1-4
  candidateProficiency: number; // 0 if missing, 1-4
  candidateYears: number;
  status: SkillStatus;
  ratio: number; // 0.0 - 1.0
  weight: number;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillTag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  reason: string; // e.g. "Missing required skill for project" or "Level 2 required, current level is 1"
}

export interface MatchWeights {
  requiredSkillsWeight: number; // e.g. 0.70
  preferredSkillsWeight: number; // e.g. 0.15
  experienceWeight: number; // e.g. 0.15
}

export interface MatchAnalysis {
  overallScore: number; // 0 - 100
  requiredSkillsScore: number; // 0 - 100
  preferredSkillsScore: number; // 0 - 100
  experienceScore: number; // 0 - 100
  requiredMatchedCount: number;
  requiredTotalCount: number;
  allSkillBreakdown: SkillMatchResult[];
  matchedSkills: SkillMatchResult[];
  underProficientSkills: SkillMatchResult[];
  missingSkills: SkillMatchResult[];
  recommendedCourses: RecommendedCourse[];
}

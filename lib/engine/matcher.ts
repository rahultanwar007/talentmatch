import {
  MatchAnalysis,
  MatchWeights,
  RecommendedCourse,
  SkillMatchResult,
} from "./types";

export const DEFAULT_WEIGHTS: MatchWeights = {
  requiredSkillsWeight: 0.7,
  preferredSkillsWeight: 0.15,
  experienceWeight: 0.15,
};

// Skill Taxonomy & Alias Dictionary for flexible semantic matching
export const SKILL_ALIASES: Record<string, string> = {
  // JavaScript / TypeScript ecosystem
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  react: "react",
  reactjs: "react",
  "react.js": "react",
  "react native": "react native",
  reactnative: "react native",
  next: "next.js",
  nextjs: "next.js",
  "next.js": "next.js",
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",
  vue: "vue.js",
  vuejs: "vue.js",
  "vue.js": "vue.js",
  tailwind: "tailwind css",
  tailwindcss: "tailwind css",
  "tailwind css": "tailwind css",

  // Databases & Backend
  postgres: "postgresql",
  postgresql: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",
  redis: "redis",
  kafka: "kafka",
  "apache kafka": "kafka",
  go: "go",
  golang: "go",
  py: "python",
  python: "python",
  graphql: "graphql",
  gql: "graphql",

  // Cloud & DevOps
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  docker: "docker",
  aws: "aws",
  "amazon web services": "aws",
  gcp: "gcp",
  "google cloud": "gcp",
  "google cloud platform": "gcp",
  azure: "azure",
  tf: "terraform",
  terraform: "terraform",

  // AI & Systems
  ai: "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  ml: "machine learning",
  "machine learning": "machine learning",
  dl: "deep learning",
  "deep learning": "deep learning",
  rag: "rag",
  "retrieval augmented generation": "rag",
  "vector db": "vector databases",
  "vector database": "vector databases",
  "vector databases": "vector databases",
  webrtc: "webrtc",
  "web rtc": "webrtc",
};

/**
 * Normalizes a skill name to its canonical identifier.
 */
export function canonicalizeSkill(skill: string): string {
  if (!skill) return "";
  const cleaned = skill.trim().toLowerCase();

  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  const stripped = cleaned.replace(/[^a-z0-9]/g, "");
  if (SKILL_ALIASES[stripped]) {
    return SKILL_ALIASES[stripped];
  }

  return cleaned
    .replace(/[._\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if two skill names refer to the same technical skill.
 */
export function areSkillsEquivalent(skillA: string, skillB: string): boolean {
  const canonA = canonicalizeSkill(skillA);
  const canonB = canonicalizeSkill(skillB);

  if (canonA === canonB) return true;

  if (canonA.length > 2 && canonB.length > 2) {
    if (canonA.includes(canonB) || canonB.includes(canonA)) {
      return true;
    }
  }

  return false;
}

export interface ProjectSkillInput {
  skillName: string;
  minProficiency: number;
  isRequired: boolean;
  weight: number;
}

export interface ProjectInput {
  id?: string;
  title?: string;
  minExperienceYears: number;
  skills: ProjectSkillInput[];
}

export interface EmployerSkillInput {
  skillName: string;
  proficiencyLevel: number;
  yearsExperience: number;
}

export interface EmployerInput {
  id?: string;
  name?: string;
  yearsOfExperience: number;
  skills: EmployerSkillInput[];
}

export interface CourseInput {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillTag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  rating: string | null;
  description: string | null;
  thumbnailUrl: string | null;
}

export function calculateMatchAnalysis(
  project: ProjectInput,
  employer: EmployerInput,
  availableCourses: CourseInput[] = [],
  weights: MatchWeights = DEFAULT_WEIGHTS
): MatchAnalysis {
  const empSkillsList = employer.skills;

  const allSkillBreakdown: SkillMatchResult[] = [];
  const matchedSkills: SkillMatchResult[] = [];
  const underProficientSkills: SkillMatchResult[] = [];
  const missingSkills: SkillMatchResult[] = [];

  let requiredWeightedRatioSum = 0;
  let requiredWeightSum = 0;
  let requiredMatchedCount = 0;
  let requiredTotalCount = 0;

  let preferredWeightedRatioSum = 0;
  let preferredWeightSum = 0;

  for (const pSkill of project.skills) {
    const candidateSkill = empSkillsList.find((es) =>
      areSkillsEquivalent(es.skillName, pSkill.skillName)
    );

    const weight = Math.max(1, pSkill.weight || 1);

    if (pSkill.isRequired) {
      requiredTotalCount++;
    }

    if (!candidateSkill || candidateSkill.proficiencyLevel <= 0) {
      const result: SkillMatchResult = {
        skillName: pSkill.skillName,
        isRequired: pSkill.isRequired,
        requiredProficiency: pSkill.minProficiency,
        candidateProficiency: 0,
        candidateYears: 0,
        status: "missing",
        ratio: 0,
        weight,
      };
      allSkillBreakdown.push(result);
      missingSkills.push(result);

      if (pSkill.isRequired) {
        requiredWeightSum += weight;
      } else {
        preferredWeightSum += weight;
      }
    } else if (candidateSkill.proficiencyLevel < pSkill.minProficiency) {
      const ratio = Math.min(
        1.0,
        candidateSkill.proficiencyLevel / pSkill.minProficiency
      );
      const result: SkillMatchResult = {
        skillName: pSkill.skillName,
        isRequired: pSkill.isRequired,
        requiredProficiency: pSkill.minProficiency,
        candidateProficiency: candidateSkill.proficiencyLevel,
        candidateYears: candidateSkill.yearsExperience,
        status: "under_proficient",
        ratio,
        weight,
      };
      allSkillBreakdown.push(result);
      underProficientSkills.push(result);

      if (pSkill.isRequired) {
        requiredWeightedRatioSum += ratio * weight;
        requiredWeightSum += weight;
      } else {
        preferredWeightedRatioSum += ratio * weight;
        preferredWeightSum += weight;
      }
    } else {
      const result: SkillMatchResult = {
        skillName: pSkill.skillName,
        isRequired: pSkill.isRequired,
        requiredProficiency: pSkill.minProficiency,
        candidateProficiency: candidateSkill.proficiencyLevel,
        candidateYears: candidateSkill.yearsExperience,
        status: "matched",
        ratio: 1.0,
        weight,
      };
      allSkillBreakdown.push(result);
      matchedSkills.push(result);

      if (pSkill.isRequired) {
        requiredMatchedCount++;
        requiredWeightedRatioSum += 1.0 * weight;
        requiredWeightSum += weight;
      } else {
        preferredWeightedRatioSum += 1.0 * weight;
        preferredWeightSum += weight;
      }
    }
  }

  const requiredSkillsScore =
    requiredWeightSum > 0
      ? Math.round((requiredWeightedRatioSum / requiredWeightSum) * 100)
      : 100;

  const preferredSkillsScore =
    preferredWeightSum > 0
      ? Math.round((preferredWeightedRatioSum / preferredWeightSum) * 100)
      : 100;

  const expRatio = Math.min(
    1.0,
    employer.yearsOfExperience / Math.max(1, project.minExperienceYears)
  );
  const experienceScore = Math.round(expRatio * 100);

  const totalWeight =
    weights.requiredSkillsWeight +
    weights.preferredSkillsWeight +
    weights.experienceWeight;
  const normalizedReqWeight = weights.requiredSkillsWeight / totalWeight;
  const normalizedPrefWeight = weights.preferredSkillsWeight / totalWeight;
  const normalizedExpWeight = weights.experienceWeight / totalWeight;

  const overallScore = Math.round(
    requiredSkillsScore * normalizedReqWeight +
      preferredSkillsScore * normalizedPrefWeight +
      experienceScore * normalizedExpWeight
  );

  const gapsToRecommend = [...missingSkills, ...underProficientSkills];
  const recommendedCourses: RecommendedCourse[] = [];
  const addedCourseIds = new Set<string>();

  for (const gap of gapsToRecommend) {
    const matchingCourses = availableCourses.filter((c) =>
      areSkillsEquivalent(c.skillTag, gap.skillName)
    );

    matchingCourses.sort((a, b) => {
      const rA = parseFloat(a.rating || "0");
      const rB = parseFloat(b.rating || "0");
      return rB - rA;
    });

    for (const c of matchingCourses) {
      if (addedCourseIds.has(c.id)) continue;
      addedCourseIds.add(c.id);

      let reason = "";
      if (gap.status === "missing") {
        reason = gap.isRequired
          ? `Essential: Project requires ${gap.skillName} (Level ${gap.requiredProficiency}/4)`
          : `Bonus: Learn ${gap.skillName} to strengthen your profile`;
      } else {
        reason = `Level Up: Advance ${gap.skillName} from Level ${gap.candidateProficiency} to Level ${gap.requiredProficiency}`;
      }

      recommendedCourses.push({
        id: c.id,
        title: c.title,
        provider: c.provider,
        url: c.url,
        skillTag: c.skillTag,
        difficulty: (c.difficulty as any) || "Intermediate",
        duration: c.duration,
        rating: c.rating,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        reason,
      });

      if (
        recommendedCourses.filter((rc) =>
          areSkillsEquivalent(rc.skillTag, gap.skillName)
        ).length >= 2
      ) {
        break;
      }
    }
  }

  return {
    overallScore,
    requiredSkillsScore,
    preferredSkillsScore,
    experienceScore,
    requiredMatchedCount,
    requiredTotalCount,
    allSkillBreakdown,
    matchedSkills,
    underProficientSkills,
    missingSkills,
    recommendedCourses,
  };
}

/**
 * Phase 1 Upskilling Simulation Engine:
 * Simulates the candidate completing a specified set of courses and calculates
 * the projected score boost, new skill proficiencies, and hours required.
 */
export interface SimulatedUpskillingResult {
  baselineAnalysis: MatchAnalysis;
  projectedAnalysis: MatchAnalysis;
  scoreDelta: number;
  simulatedSkills: {
    skillName: string;
    oldProficiency: number;
    newProficiency: number;
    targetRequired: number;
  }[];
  totalSimulatedHours: number;
}

export function simulateUpskillingMatch(
  project: ProjectInput,
  employer: EmployerInput,
  availableCourses: CourseInput[],
  simulatedCourseIds: string[],
  weights: MatchWeights = DEFAULT_WEIGHTS
): SimulatedUpskillingResult {
  const baselineAnalysis = calculateMatchAnalysis(
    project,
    employer,
    availableCourses,
    weights
  );

  if (!simulatedCourseIds || simulatedCourseIds.length === 0) {
    return {
      baselineAnalysis,
      projectedAnalysis: baselineAnalysis,
      scoreDelta: 0,
      simulatedSkills: [],
      totalSimulatedHours: 0,
    };
  }

  // Find all simulated courses
  const simulatedCourses = availableCourses.filter((c) =>
    simulatedCourseIds.includes(c.id)
  );

  // Extract total hours (e.g. "14 hours", "4 weeks" -> 16h/wk or hours)
  let totalHours = 0;
  for (const c of simulatedCourses) {
    const match = c.duration.match(/(\d+)\s*(hour|hr|week|wk)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      if (unit.startsWith("week") || unit.startsWith("wk")) {
        totalHours += num * 10; // ~10 hrs/week
      } else {
        totalHours += num;
      }
    } else {
      totalHours += 12; // default avg
    }
  }

  // Clone employer skills and elevate competencies taught by simulated courses
  const simulatedSkillsMap = new Map<string, EmployerSkillInput>();
  for (const s of employer.skills) {
    simulatedSkillsMap.set(canonicalizeSkill(s.skillName), { ...s });
  }

  const simulatedSkillChanges: {
    skillName: string;
    oldProficiency: number;
    newProficiency: number;
    targetRequired: number;
  }[] = [];

  for (const course of simulatedCourses) {
    const canonTag = canonicalizeSkill(course.skillTag);
    // Find what the project asks for this skill
    const targetProjectSkill = project.skills.find((ps) =>
      areSkillsEquivalent(ps.skillName, course.skillTag)
    );
    const targetRequired = targetProjectSkill?.minProficiency || 2;

    const existing = simulatedSkillsMap.get(canonTag);
    const oldProf = existing?.proficiencyLevel || 0;

    // By completing the course, elevate proficiency to meet requirement (min 2, or level 3 if advanced)
    const courseBoost = course.difficulty === "Advanced" ? 3 : 2;
    const newProf = Math.max(oldProf, targetRequired, courseBoost);

    simulatedSkillsMap.set(canonTag, {
      skillName: targetProjectSkill?.skillName || course.skillTag,
      proficiencyLevel: newProf,
      yearsExperience: (existing?.yearsExperience || 0) + 1,
    });

    if (newProf > oldProf) {
      simulatedSkillChanges.push({
        skillName: targetProjectSkill?.skillName || course.skillTag,
        oldProficiency: oldProf,
        newProficiency: newProf,
        targetRequired,
      });
    }
  }

  // Create simulated employer profile
  const simulatedEmployer: EmployerInput = {
    ...employer,
    skills: Array.from(simulatedSkillsMap.values()),
  };

  const projectedAnalysis = calculateMatchAnalysis(
    project,
    simulatedEmployer,
    availableCourses,
    weights
  );

  const scoreDelta = Math.max(
    0,
    projectedAnalysis.overallScore - baselineAnalysis.overallScore
  );

  return {
    baselineAnalysis,
    projectedAnalysis,
    scoreDelta,
    simulatedSkills: simulatedSkillChanges,
    totalSimulatedHours: totalHours,
  };
}

import {
  ProjectInput,
  EmployerInput,
  CourseInput,
  areSkillsEquivalent,
  DEFAULT_WEIGHTS,
} from "./matcher";
import { MatchWeights, RecommendedCourse } from "./types";

export interface SquadMemberContribution {
  employerId: string;
  employerName: string;
  roleTitle: string;
  avatarUrl: string | null;
  proficiencyLevel: number;
  yearsExperience: number;
  isPrimary: boolean;
}

export interface SquadSkillCoverageItem {
  skillName: string;
  isRequired: boolean;
  requiredProficiency: number;
  weight: number;
  squadMaxProficiency: number;
  status: "covered" | "under_proficient" | "uncovered";
  ratio: number;
  primaryOwner: SquadMemberContribution | null;
  backupContributors: SquadMemberContribution[];
}

export interface SquadAnalysis {
  squadCoverageScore: number; // 0 - 100
  requiredCoverageScore: number; // 0 - 100
  satisfiedRequiredCount: number;
  totalRequiredCount: number;
  totalSkillCount: number;
  skillMatrix: SquadSkillCoverageItem[];
  coveredSkills: SquadSkillCoverageItem[];
  underProficientSkills: SquadSkillCoverageItem[];
  uncoveredSkills: SquadSkillCoverageItem[];
  redundantSkillsCount: number; // Skills with >=2 capable members
  combinedExperienceYears: number;
  averageExperienceYears: number;
  recommendedCourses: RecommendedCourse[];
}

export function calculateSquadAnalysis(
  project: ProjectInput,
  squadMembers: (EmployerInput & {
    id: string;
    roleTitle?: string;
    avatarUrl?: string | null;
  })[],
  availableCourses: CourseInput[] = [],
  weights: MatchWeights = DEFAULT_WEIGHTS
): SquadAnalysis {
  const members = squadMembers || [];
  const skillMatrix: SquadSkillCoverageItem[] = [];
  const coveredSkills: SquadSkillCoverageItem[] = [];
  const underProficientSkills: SquadSkillCoverageItem[] = [];
  const uncoveredSkills: SquadSkillCoverageItem[] = [];

  let requiredWeightedSum = 0;
  let requiredWeightSum = 0;
  let satisfiedRequiredCount = 0;
  let totalRequiredCount = 0;

  let preferredWeightedSum = 0;
  let preferredWeightSum = 0;
  let redundantSkillsCount = 0;

  for (const pSkill of project.skills) {
    const weight = Math.max(1, pSkill.weight || 1);
    if (pSkill.isRequired) {
      totalRequiredCount++;
    }

    // Collect contributions from all squad members for this skill
    const contributors: SquadMemberContribution[] = [];

    for (const member of members) {
      const match = member.skills.find((s) =>
        areSkillsEquivalent(s.skillName, pSkill.skillName)
      );

      if (match && match.proficiencyLevel > 0) {
        contributors.push({
          employerId: member.id,
          employerName: member.name || "Member",
          roleTitle: member.roleTitle || "Engineer",
          avatarUrl: member.avatarUrl || null,
          proficiencyLevel: match.proficiencyLevel,
          yearsExperience: match.yearsExperience || 1,
          isPrimary: false,
        });
      }
    }

    // Sort contributors descending by proficiency, then years of experience
    contributors.sort((a, b) => {
      if (b.proficiencyLevel !== a.proficiencyLevel) {
        return b.proficiencyLevel - a.proficiencyLevel;
      }
      return b.yearsExperience - a.yearsExperience;
    });

    const squadMaxProficiency =
      contributors.length > 0 ? contributors[0].proficiencyLevel : 0;

    let primaryOwner: SquadMemberContribution | null = null;
    let backupContributors: SquadMemberContribution[] = [];

    if (contributors.length > 0) {
      contributors[0].isPrimary = true;
      primaryOwner = contributors[0];
      backupContributors = contributors.slice(1);
    }

    if (contributors.length >= 2) {
      redundantSkillsCount++;
    }

    // Determine coverage status
    let status: "covered" | "under_proficient" | "uncovered";
    let ratio = 0;

    if (squadMaxProficiency >= pSkill.minProficiency) {
      status = "covered";
      ratio = 1.0;
      if (pSkill.isRequired) satisfiedRequiredCount++;
    } else if (squadMaxProficiency > 0) {
      status = "under_proficient";
      ratio = squadMaxProficiency / pSkill.minProficiency;
    } else {
      status = "uncovered";
      ratio = 0;
    }

    if (pSkill.isRequired) {
      requiredWeightedSum += ratio * weight;
      requiredWeightSum += weight;
    } else {
      preferredWeightedSum += ratio * weight;
      preferredWeightSum += weight;
    }

    const item: SquadSkillCoverageItem = {
      skillName: pSkill.skillName,
      isRequired: pSkill.isRequired,
      requiredProficiency: pSkill.minProficiency,
      weight,
      squadMaxProficiency,
      status,
      ratio,
      primaryOwner,
      backupContributors,
    };

    skillMatrix.push(item);
    if (status === "covered") coveredSkills.push(item);
    else if (status === "under_proficient") underProficientSkills.push(item);
    else uncoveredSkills.push(item);
  }

  const requiredCoverageScore =
    members.length === 0
      ? 0
      : requiredWeightSum > 0
      ? Math.round((requiredWeightedSum / requiredWeightSum) * 100)
      : 100;

  const preferredCoverageScore =
    members.length === 0
      ? 0
      : preferredWeightSum > 0
      ? Math.round((preferredWeightedSum / preferredWeightSum) * 100)
      : 100;

  // Combined and average experience
  const combinedExperienceYears = members.reduce(
    (sum, m) => sum + (m.yearsOfExperience || 0),
    0
  );
  const averageExperienceYears =
    members.length > 0
      ? Math.round((combinedExperienceYears / members.length) * 10) / 10
      : 0;

  // Experience ratio compared to project min experience
  const expRatio =
    members.length === 0
      ? 0
      : Math.min(
          1.0,
          averageExperienceYears / Math.max(1, project.minExperienceYears)
        );
  const experienceScore = Math.round(expRatio * 100);

  // Squad composite score
  const totalWeight =
    weights.requiredSkillsWeight +
    weights.preferredSkillsWeight +
    weights.experienceWeight;
  const squadCoverageScore =
    members.length === 0
      ? 0
      : Math.round(
          (requiredCoverageScore * weights.requiredSkillsWeight +
            preferredCoverageScore * weights.preferredSkillsWeight +
            experienceScore * weights.experienceWeight) /
            totalWeight
        );

  // Recommendations for any remaining squad gaps
  const squadGaps = [...uncoveredSkills, ...underProficientSkills];
  const recommendedCourses: RecommendedCourse[] = [];
  const addedIds = new Set<string>();

  for (const gap of squadGaps) {
    const matchingCourses = availableCourses.filter((c) =>
      areSkillsEquivalent(c.skillTag, gap.skillName)
    );

    for (const c of matchingCourses) {
      if (addedIds.has(c.id)) continue;
      addedIds.add(c.id);

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
        reason:
          gap.status === "uncovered"
            ? `Squad Uncovered: Entire team lacks ${gap.skillName}`
            : `Squad Upgrade: Team needs Level ${gap.requiredProficiency} for ${gap.skillName}`,
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
    squadCoverageScore,
    requiredCoverageScore,
    satisfiedRequiredCount,
    totalRequiredCount,
    totalSkillCount: project.skills.length,
    skillMatrix,
    coveredSkills,
    underProficientSkills,
    uncoveredSkills,
    redundantSkillsCount,
    combinedExperienceYears,
    averageExperienceYears,
    recommendedCourses,
  };
}

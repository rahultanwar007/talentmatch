import { ProjectInput, EmployerInput, CourseInput, areSkillsEquivalent, canonicalizeSkill } from "./matcher";

export interface SkillMarketStat {
  skillName: string;
  canonicalName: string;
  demandCount: number; // How many projects need it
  requiredDemandCount: number; // Required must-have count
  avgRequiredProficiency: number;
  supplyCount: number; // How many employers have it
  avgSupplyProficiency: number;
  avgExperienceYears: number;
  netGap: number; // demandCount - supplyCount (positive = shortage)
  shortageIndex: number; // 0 - 100 shortage severity
  status: "critical_shortage" | "moderate_shortage" | "balanced" | "surplus";
}

export interface MarketIntelligenceReport {
  macroStats: {
    totalProjects: number;
    totalEmployers: number;
    totalSkillsTracked: number;
    marketHealthScore: number; // 0 - 100
    topDeficitCategory: string;
    criticalShortageCount: number;
    surplusCount: number;
  };
  skillStats: SkillMarketStat[];
  topShortages: SkillMarketStat[];
  topSurpluses: SkillMarketStat[];
  institutionalUpskillingRecommendations: {
    course: CourseInput;
    targetSkill: string;
    unmetProjectDemand: number;
    estimatedTalentImpact: number;
    priority: "High" | "Medium" | "Urgent";
  }[];
}

export function computeMarketIntelligence(
  projects: (ProjectInput & { category?: string })[],
  employers: EmployerInput[],
  courses: CourseInput[] = []
): MarketIntelligenceReport {
  const skillDemandMap = new Map<
    string,
    {
      displayName: string;
      totalDemand: number;
      requiredDemand: number;
      sumProficiency: number;
    }
  >();

  const skillSupplyMap = new Map<
    string,
    {
      displayName: string;
      totalSupply: number;
      sumProficiency: number;
      sumExperience: number;
    }
  >();

  const allCanonicalSkills = new Set<string>();

  // 1. Aggregate Project Demand
  for (const project of projects) {
    for (const pSkill of project.skills) {
      const canon = canonicalizeSkill(pSkill.skillName);
      allCanonicalSkills.add(canon);

      const existing = skillDemandMap.get(canon) || {
        displayName: pSkill.skillName,
        totalDemand: 0,
        requiredDemand: 0,
        sumProficiency: 0,
      };

      existing.totalDemand++;
      if (pSkill.isRequired) existing.requiredDemand++;
      existing.sumProficiency += pSkill.minProficiency;
      skillDemandMap.set(canon, existing);
    }
  }

  // 2. Aggregate Talent Pool Supply
  for (const employer of employers) {
    for (const eSkill of employer.skills) {
      const canon = canonicalizeSkill(eSkill.skillName);
      allCanonicalSkills.add(canon);

      const existing = skillSupplyMap.get(canon) || {
        displayName: eSkill.skillName,
        totalSupply: 0,
        sumProficiency: 0,
        sumExperience: 0,
      };

      existing.totalSupply++;
      existing.sumProficiency += eSkill.proficiencyLevel;
      existing.sumExperience += eSkill.yearsExperience || 1;
      skillSupplyMap.set(canon, existing);
    }
  }

  // 3. Compute Comparative Stats per Skill
  const skillStats: SkillMarketStat[] = [];

  for (const canon of allCanonicalSkills) {
    const demand = skillDemandMap.get(canon);
    const supply = skillSupplyMap.get(canon);

    const displayName = demand?.displayName || supply?.displayName || canon;
    const demandCount = demand?.totalDemand || 0;
    const requiredDemandCount = demand?.requiredDemand || 0;
    const avgRequiredProficiency =
      demandCount > 0 ? Math.round((demand!.sumProficiency / demandCount) * 10) / 10 : 0;

    const supplyCount = supply?.totalSupply || 0;
    const avgSupplyProficiency =
      supplyCount > 0 ? Math.round((supply!.sumProficiency / supplyCount) * 10) / 10 : 0;
    const avgExperienceYears =
      supplyCount > 0 ? Math.round((supply!.sumExperience / supplyCount) * 10) / 10 : 0;

    const netGap = demandCount - supplyCount;

    // Shortage formula: weight required demand higher
    let shortageIndex = 0;
    if (demandCount > 0) {
      const demandPressure = requiredDemandCount * 1.5 + (demandCount - requiredDemandCount);
      const ratio = supplyCount === 0 ? 1 : Math.max(0, 1 - supplyCount / demandPressure);
      shortageIndex = Math.min(100, Math.round(ratio * 100));
    }

    let status: "critical_shortage" | "moderate_shortage" | "balanced" | "surplus";
    if (demandCount > 0 && supplyCount === 0) {
      status = "critical_shortage";
    } else if (netGap >= 2 || shortageIndex >= 60) {
      status = "critical_shortage";
    } else if (netGap > 0) {
      status = "moderate_shortage";
    } else if (netGap < 0) {
      status = "surplus";
    } else {
      status = "balanced";
    }

    skillStats.push({
      skillName: displayName,
      canonicalName: canon,
      demandCount,
      requiredDemandCount,
      avgRequiredProficiency,
      supplyCount,
      avgSupplyProficiency,
      avgExperienceYears,
      netGap,
      shortageIndex,
      status,
    });
  }

  // Sort stats: highest shortages first
  skillStats.sort((a, b) => {
    if (b.shortageIndex !== a.shortageIndex) return b.shortageIndex - a.shortageIndex;
    return b.netGap - a.netGap;
  });

  const topShortages = skillStats
    .filter((s) => s.demandCount > 0 && s.netGap > 0)
    .slice(0, 6);

  const topSurpluses = skillStats
    .filter((s) => s.supplyCount > s.demandCount)
    .sort((a, b) => b.supplyCount - a.supplyCount)
    .slice(0, 5);

  // 4. Institutional Upskilling Recommendations
  const institutionalUpskillingRecommendations: MarketIntelligenceReport["institutionalUpskillingRecommendations"] = [];
  const addedCourseIds = new Set<string>();

  for (const shortage of topShortages) {
    const matchingCourses = courses.filter((c) =>
      areSkillsEquivalent(c.skillTag, shortage.skillName)
    );

    for (const course of matchingCourses) {
      if (addedCourseIds.has(course.id)) continue;
      addedCourseIds.add(course.id);

      institutionalUpskillingRecommendations.push({
        course,
        targetSkill: shortage.skillName,
        unmetProjectDemand: shortage.demandCount,
        estimatedTalentImpact: Math.max(1, shortage.netGap),
        priority:
          shortage.status === "critical_shortage"
            ? "Urgent"
            : shortage.shortageIndex >= 50
            ? "High"
            : "Medium",
      });

      if (institutionalUpskillingRecommendations.length >= 6) break;
    }
  }

  // 5. Macro Health Score
  const totalTracked = skillStats.length;
  const criticalCount = skillStats.filter((s) => s.status === "critical_shortage").length;
  const balancedOrSurplusCount = skillStats.filter(
    (s) => s.status === "balanced" || s.status === "surplus"
  ).length;

  const marketHealthScore =
    totalTracked > 0
      ? Math.max(30, Math.min(100, Math.round((balancedOrSurplusCount / totalTracked) * 100)))
      : 80;

  return {
    macroStats: {
      totalProjects: projects.length,
      totalEmployers: employers.length,
      totalSkillsTracked: totalTracked,
      marketHealthScore,
      topDeficitCategory: "Cloud Native & AI Systems",
      criticalShortageCount: criticalCount,
      surplusCount: topSurpluses.length,
    },
    skillStats,
    topShortages,
    topSurpluses,
    institutionalUpskillingRecommendations,
  };
}

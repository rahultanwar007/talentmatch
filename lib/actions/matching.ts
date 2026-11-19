"use server";

import { getProjects, getProjectById, ProjectWithDetails } from "./projects";
import { getEmployers, getEmployerById, EmployerWithDetails } from "./employers";
import { getCourses, CourseItem } from "./courses";
import {
  calculateMatchAnalysis,
  DEFAULT_WEIGHTS,
} from "@/lib/engine/matcher";
import { MatchAnalysis, MatchWeights } from "@/lib/engine/types";

export interface RankedEmployerMatch {
  employer: EmployerWithDetails;
  analysis: MatchAnalysis;
}

export interface RankedProjectMatch {
  project: ProjectWithDetails;
  analysis: MatchAnalysis;
}

export interface DetailedMatchResponse {
  project: ProjectWithDetails;
  employer: EmployerWithDetails;
  analysis: MatchAnalysis;
}

export async function getSingleMatchAnalysis(
  projectId: string,
  employerId: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<DetailedMatchResponse | null> {
  const [project, employer, courses] = await Promise.all([
    getProjectById(projectId),
    getEmployerById(employerId),
    getCourses(),
  ]);

  if (!project || !employer) return null;

  const analysis = calculateMatchAnalysis(project, employer, courses, weights);

  return {
    project,
    employer,
    analysis,
  };
}

export async function getProjectRankings(
  projectId: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<{ project: ProjectWithDetails; rankings: RankedEmployerMatch[] } | null> {
  const [project, allEmployers, courses] = await Promise.all([
    getProjectById(projectId),
    getEmployers(),
    getCourses(),
  ]);

  if (!project) return null;

  const rankings: RankedEmployerMatch[] = allEmployers.map((emp) => {
    const analysis = calculateMatchAnalysis(project, emp, courses, weights);
    return {
      employer: emp,
      analysis,
    };
  });

  // Sort descending by overallScore, then requiredSkillsScore
  rankings.sort((a, b) => {
    if (b.analysis.overallScore !== a.analysis.overallScore) {
      return b.analysis.overallScore - a.analysis.overallScore;
    }
    return b.analysis.requiredSkillsScore - a.analysis.requiredSkillsScore;
  });

  return {
    project,
    rankings,
  };
}

export async function getEmployerRankings(
  employerId: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<{ employer: EmployerWithDetails; rankings: RankedProjectMatch[] } | null> {
  const [employer, allProjects, courses] = await Promise.all([
    getEmployerById(employerId),
    getProjects(),
    getCourses(),
  ]);

  if (!employer) return null;

  const rankings: RankedProjectMatch[] = allProjects.map((proj) => {
    const analysis = calculateMatchAnalysis(proj, employer, courses, weights);
    return {
      project: proj,
      analysis,
    };
  });

  // Sort descending by overallScore
  rankings.sort((a, b) => {
    if (b.analysis.overallScore !== a.analysis.overallScore) {
      return b.analysis.overallScore - a.analysis.overallScore;
    }
    return b.analysis.requiredSkillsScore - a.analysis.requiredSkillsScore;
  });

  return {
    employer,
    rankings,
  };
}

export async function getPlatformOverviewStats() {
  const [projectsList, employersList, coursesList] = await Promise.all([
    getProjects(),
    getEmployers(),
    getCourses(),
  ]);

  let totalScoreSum = 0;
  let totalPairsCount = 0;
  let topMatches: {
    project: ProjectWithDetails;
    employer: EmployerWithDetails;
    score: number;
    skillsCount: number;
  }[] = [];

  for (const p of projectsList) {
    for (const e of employersList) {
      const analysis = calculateMatchAnalysis(p, e, coursesList);
      totalScoreSum += analysis.overallScore;
      totalPairsCount++;

      topMatches.push({
        project: p,
        employer: e,
        score: analysis.overallScore,
        skillsCount: analysis.matchedSkills.length,
      });
    }
  }

  topMatches.sort((a, b) => b.score - a.score);

  const averageMatchRate =
    totalPairsCount > 0 ? Math.round(totalScoreSum / totalPairsCount) : 0;

  // Aggregate in-demand skills
  const skillCountMap = new Map<string, number>();
  for (const p of projectsList) {
    for (const s of p.skills) {
      const name = s.skillName;
      skillCountMap.set(name, (skillCountMap.get(name) || 0) + 1);
    }
  }

  const topDemandedSkills = Array.from(skillCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalProjects: projectsList.length,
    totalEmployers: employersList.length,
    totalCourses: coursesList.length,
    averageMatchRate,
    topDemandedSkills,
    topPairings: topMatches.slice(0, 5),
  };
}

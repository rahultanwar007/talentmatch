import React from "react";
import { getProjects } from "@/lib/actions/projects";
import { getEmployers } from "@/lib/actions/employers";
import { getCourses } from "@/lib/actions/courses";
import { computeMarketIntelligence } from "@/lib/engine/analytics";
import { MarketIntelligenceDashboard } from "@/components/analytics/market-intelligence-dashboard";
import { BarChart3 } from "lucide-react";

export default async function MarketAnalyticsPage() {
  const [projects, employers, courses] = await Promise.all([
    getProjects(),
    getEmployers(),
    getCourses(),
  ]);

  // Transform projects to matcher format
  const projectInputs = projects.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    minExperienceYears: p.minExperienceYears,
    skills: p.skills.map((s) => ({
      skillName: s.skillName,
      minProficiency: s.minProficiency,
      isRequired: s.isRequired,
      weight: s.weight,
    })),
  }));

  // Transform employers to matcher format
  const employerInputs = employers.map((e) => ({
    id: e.id,
    name: e.name,
    yearsOfExperience: e.yearsOfExperience,
    skills: e.skills.map((s) => ({
      skillName: s.skillName,
      proficiencyLevel: s.proficiencyLevel,
      yearsExperience: s.yearsExperience,
    })),
  }));

  // Transform courses
  const courseInputs = courses.map((c) => ({
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

  const report = computeMarketIntelligence(projectInputs, employerInputs, courseInputs);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          Platform Talent Economics & AI Ingestion
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Market Intelligence & Skill Extractor
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Analyze macro project demand versus candidate skill supply, uncover critical talent deficits, and leverage AI extraction on raw job specifications and candidate resumes.
        </p>
      </div>

      {/* Analytics Dashboard Client Component */}
      <MarketIntelligenceDashboard
        initialReport={report}
        projects={projects}
        employers={employers}
      />
    </div>
  );
}

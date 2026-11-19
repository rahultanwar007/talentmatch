import React from "react";
import { getProjects } from "@/lib/actions/projects";
import { getEmployers } from "@/lib/actions/employers";
import { getCourses } from "@/lib/actions/courses";
import { InteractiveMatchStudio } from "@/components/match/interactive-match-studio";
import { Sparkles } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    projectId?: string;
    employerId?: string;
  }>;
}

export default async function MatchStudioPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const [projects, employers, courses] = await Promise.all([
    getProjects(),
    getEmployers(),
    getCourses(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Interactive Deep-Dive Studio
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Match Analysis & Course Suggester
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Select any Company Project and any Employer/Talent profile to evaluate compatibility, identify technical skill gaps, and explore targeted upskilling recommendations.
        </p>
      </div>

      {/* Interactive Studio Client Component */}
      <InteractiveMatchStudio
        projects={projects}
        employers={employers}
        courses={courses}
        initialProjectId={resolvedSearchParams.projectId}
        initialEmployerId={resolvedSearchParams.employerId}
      />
    </div>
  );
}

import React from "react";
import { getProjects } from "@/lib/actions/projects";
import { getEmployers } from "@/lib/actions/employers";
import { getCourses } from "@/lib/actions/courses";
import { SquadBuilderStudio } from "@/components/squad/squad-builder-studio";
import { Users } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    projectId?: string;
  }>;
}

export default async function SquadBuilderPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const [projects, employers, courses] = await Promise.all([
    getProjects(),
    getEmployers(),
    getCourses(),
  ]);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <Users className="h-3.5 w-3.5" />
          Multi-Candidate Team Matching Engine
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Project Squad Builder Studio
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Assemble high-performing cross-functional squads for complex projects. Combine complementary talent profiles to reach 100% skill coverage, inspect primary leads and backup redundancies, and uncover residual gaps.
        </p>
      </div>

      {/* Squad Studio Client Component */}
      <SquadBuilderStudio
        projects={projects}
        employers={employers}
        courses={courses}
        initialProjectId={resolvedSearchParams.projectId}
      />
    </div>
  );
}

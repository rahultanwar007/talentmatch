import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectRankings } from "@/lib/actions/matching";
import { MatchScoreBadge } from "@/components/match/match-score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Calendar,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Layers,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getProjectRankings(id);

  if (!data) {
    notFound();
  }

  const { project, rankings } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all projects
      </Link>

      {/* Project Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Building2 className="h-4 w-4" />
                {project.companyName}
              </span>
              <span className="text-slate-300">•</span>
              <Badge variant="outline" className="text-xs">
                {project.category}
              </Badge>
              <Badge variant="success" className="text-xs">
                {project.status}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {project.title}
            </h1>

            <p className="text-sm leading-relaxed text-slate-600">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Min Experience: {project.minExperienceYears}+ years
              </span>
              <span>•</span>
              <span>Budget: {project.budget || "Competitive"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/projects/${project.id}/pipeline`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="secondary"
                size="lg"
                className="w-full border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
              >
                <UserCheck className="h-4 w-4 mr-1.5 text-indigo-600" />
                Staffing Pipeline (ATS)
              </Button>
            </Link>
            <Link
              href={`/squad?projectId=${project.id}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="secondary"
                size="lg"
                className="w-full border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
              >
                <Users className="h-4 w-4 mr-1.5 text-indigo-600" />
                Assemble Squad
              </Button>
            </Link>
            <Link
              href={`/match?projectId=${project.id}`}
              className="w-full sm:w-auto"
            >
              <Button variant="default" size="lg" className="w-full">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Open in Match Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Technical Requirements Breakdown */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            Specified Technical Skills & Competency Matrix:
          </h3>

          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <div
                key={skill.id}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs ${
                  skill.isRequired
                    ? "border border-indigo-200 bg-indigo-50 text-indigo-800 font-medium"
                    : "border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                }`}
              >
                <span className="font-semibold">{skill.skillName}</span>
                <span className="text-[10px] text-slate-500">
                  Min Level {skill.minProficiency}/4
                </span>
                {skill.isRequired && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0">
                    Must-Have
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranked Candidate Match Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Ranked Talent Compatibility ({rankings.length})
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by composite match score (Required Skills 70%, Bonus 15%, Experience 15%).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rankings.map((item, index) => {
            const emp = item.employer;
            const analysis = item.analysis;

            return (
              <div
                key={emp.id}
                className="group flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm"
              >
                {/* Candidate Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                    #{index + 1}
                  </span>

                  <Avatar size="md">
                    <AvatarImage
                      src={emp.avatarUrl || ""}
                      alt={emp.name}
                    />
                    <AvatarFallback>
                      {emp.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/employers/${emp.id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {emp.name}
                      </Link>
                      <Badge variant="secondary" className="text-[10px]">
                        {emp.yearsOfExperience} yrs exp
                      </Badge>
                      <span className="text-xs text-indigo-600 font-medium">
                        {emp.roleTitle}
                      </span>
                    </div>

                    {/* Skill matching stats */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="text-emerald-700 font-medium">
                        ✓ {analysis.matchedSkills.length} matched
                      </span>

                      {analysis.underProficientSkills.length > 0 && (
                        <span className="text-amber-700 font-medium">
                          • {analysis.underProficientSkills.length} need level up
                        </span>
                      )}

                      {analysis.missingSkills.length > 0 && (
                        <span className="text-rose-600 font-medium">
                          • {analysis.missingSkills.length} missing
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Deep Match CTA */}
                <div className="flex items-center justify-between lg:justify-end gap-4 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                  <MatchScoreBadge score={analysis.overallScore} size="default" />

                  <Link
                    href={`/match?projectId=${project.id}&employerId=${emp.id}`}
                  >
                    <Button variant="default" size="sm" className="text-xs">
                      Analyze & Courses
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

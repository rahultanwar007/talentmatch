import React from "react";
import Link from "next/link";
import { getPlatformOverviewStats } from "@/lib/actions/matching";
import { getProjects } from "@/lib/actions/projects";
import { getEmployers } from "@/lib/actions/employers";
import { MatchScoreBadge } from "@/components/match/match-score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  GraduationCap,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Layers,
  BarChart3,
} from "lucide-react";

export default async function DashboardPage() {
  const [stats, projectsList, employersList] = await Promise.all([
    getPlatformOverviewStats(),
    getProjects(),
    getEmployers(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 p-8 sm:p-12 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            AI-Driven Skill Gap, Squad Building & Placement Engine
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
            Match Top Engineering Talent with Enterprise Projects
          </h1>

          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Evaluate multidimensional fit across technical skills, proficiency levels, and experience. Pinpoint critical gaps, simulate upskilling ROI, build complementary squads, and manage your ATS staffing pipeline.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/match">
              <Button variant="gradient" size="lg">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Launch Match Studio
              </Button>
            </Link>

            <Link href="/squad">
              <Button variant="secondary" size="lg">
                <Layers className="h-4 w-4 mr-1.5 text-indigo-600" />
                Squad Builder
              </Button>
            </Link>

            <Link href="/analytics">
              <Button variant="outline" size="lg">
                <BarChart3 className="h-4 w-4 mr-1.5 text-slate-600" />
                Market Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalProjects}
            </span>
            <span className="text-xs text-slate-500">company requisitions</span>
          </div>
        </div>

        {/* Employer / Talent Profiles */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Talent Profiles
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalEmployers}
            </span>
            <span className="text-xs text-slate-500">verified engineers</span>
          </div>
        </div>

        {/* Curated Courses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upskilling Courses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalCourses}
            </span>
            <span className="text-xs text-slate-500">curated modules</span>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Match Fit
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats.averageMatchRate}%
            </span>
            <span className="text-xs text-slate-500">across all pairings</span>
          </div>
        </div>
      </div>

      {/* In-Demand Skills Ribbon */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Most In-Demand Project Skills:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topDemandedSkills.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800"
              >
                <span className="font-semibold">{s.name}</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.2 rounded">
                  {s.count} projects
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Compatibility Leaderboard */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Highest Compatibility Pairings
            </h2>
            <p className="text-xs text-slate-500">
              Top candidate and project pairings calculated across all active requirements.
            </p>
          </div>
          <Link href="/match">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">
              Open Match Studio <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.topPairings.map((pair, index) => (
            <div
              key={`${pair.project.id}-${pair.employer.id}`}
              className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 group hover:bg-slate-50/80 px-3 rounded-xl transition-colors"
            >
              {/* Left: Project & Employer info */}
              <div className="flex items-start sm:items-center gap-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-600 border border-slate-200">
                  #{index + 1}
                </span>

                <img
                  src={
                    pair.employer.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={pair.employer.name}
                  className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-2xs"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {pair.employer.name}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">
                      ({pair.employer.roleTitle})
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Project:</span>
                    <span className="font-semibold text-slate-800">
                      {pair.project.title}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{pair.project.companyName}</span>
                  </div>
                </div>
              </div>

              {/* Right: Score & Match Studio CTA */}
              <div className="flex items-center gap-4 justify-between md:justify-end">
                <MatchScoreBadge score={pair.score} size="default" />

                <Link
                  href={`/match?projectId=${pair.project.id}&employerId=${pair.employer.id}`}
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    View Analysis
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Projects & Employers */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Projects Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Company Projects ({projectsList.length})
            </h3>
            <Link href="/projects">
              <span className="text-xs font-semibold text-indigo-600 hover:underline">
                View All
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {projectsList.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700">
                    {p.companyName}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {p.category}
                  </Badge>
                </div>
                <h4 className="mt-1 font-bold text-slate-900 text-sm">
                  {p.title}
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 font-medium"
                    >
                      {s.skillName} {s.isRequired ? "*" : ""}
                    </span>
                  ))}
                  {p.skills.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{p.skills.length - 4} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Employers Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-purple-600" />
              Candidate Profiles ({employersList.length})
            </h3>
            <Link href="/employers">
              <span className="text-xs font-semibold text-purple-600 hover:underline">
                View All
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {employersList.slice(0, 3).map((emp) => (
              <Link
                key={emp.id}
                href={`/employers/${emp.id}`}
                className="block rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition-all hover:border-purple-300 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        emp.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={emp.name}
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {emp.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-none">
                        {emp.roleTitle}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {emp.yearsOfExperience} yrs exp
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {emp.skills.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 font-medium"
                    >
                      {s.skillName} (L{s.proficiencyLevel})
                    </span>
                  ))}
                  {emp.skills.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{emp.skills.length - 4} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

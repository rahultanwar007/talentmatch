import React from "react";
import Link from "next/link";
import { getPlatformOverviewStats } from "@/lib/actions/matching";
import { getProjects } from "@/lib/actions/projects";
import { getEmployers } from "@/lib/actions/employers";
import { MatchScoreBadge } from "@/components/match/match-score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
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
  HelpCircle,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const [stats, projectsList, employersList] = await Promise.all([
    getPlatformOverviewStats(),
    getProjects(),
    getEmployers(),
  ]);

  const topPair = stats.topPairings[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/50 p-8 sm:p-12 shadow-sm">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            AI-Powered Talent Matching & Squad Assembly
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
            Effortlessly Match Top Talent with Enterprise Projects
          </h1>

          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Welcome to <strong>TalentMatch Pro</strong>. Designed for recruiters, hiring managers, and team leads to quickly discover candidate fit, close missing skill gaps through simulated courses, and build high-performance engineering squads.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/match">
              <Button variant="gradient" size="lg" className="shadow-md shadow-indigo-600/20">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Analyze Candidate Fit
              </Button>
            </Link>

            <Link href="/squad">
              <Button variant="secondary" size="lg">
                <Layers className="h-4 w-4 mr-1.5 text-indigo-600" />
                Assemble a Squad
              </Button>
            </Link>

            <Link href="/projects">
              <Button variant="outline" size="lg">
                <Briefcase className="h-4 w-4 mr-1.5 text-slate-600" />
                View Open Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step Guided Workflow for Non-Technical Users */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              ?
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              How It Works — Simple 3-Step Guide
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Zero technical background needed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <Link
            href="/projects"
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Pick a Project
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore open company positions (like FinTech core or Cloud APIs) with clear requirements and budget info.
            </p>
          </Link>

          {/* Step 2 */}
          <Link
            href="/match"
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                AI Evaluates Fit
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly see a 0-100% readiness score with plain-English verdicts: Ready to Deploy, Bridge Training, or Gaps.
            </p>
          </Link>

          {/* Step 3 */}
          <Link
            href="/match"
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Close Gaps & Place
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click <em>"Simulate Closing Gaps"</em> to watch fit scores jump with courses, then add the candidate to the hiring pipeline.
            </p>
          </Link>
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
            <span className="text-xs text-slate-500">company positions</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Open requisitions ready for staffing
          </p>
        </div>

        {/* Employer / Talent Profiles */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Talent on Bench
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
          <p className="mt-1 text-[11px] text-slate-400">
            Available across Fullstack, Cloud & AI
          </p>
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
            <span className="text-xs text-slate-500">training modules</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Targeted skill bridge curricula
          </p>
        </div>

        {/* Average Match Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bench Readiness
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats.averageMatchRate}%
            </span>
            <span className="text-xs text-slate-500">average match</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            High average compatibility
          </p>
        </div>
      </div>

      {/* Top Instant Match Spotlight (If available) */}
      {topPair && (
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/40 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                Featured AI Recommendation
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Highest Candidate Fit Right Now
              </h3>
              <p className="text-xs text-slate-600">
                <strong>{topPair.employer.name}</strong> ({topPair.employer.roleTitle}) has an outstanding <strong>{topPair.score}% compatibility</strong> for <strong>{topPair.project.title}</strong> at {topPair.project.companyName}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white border border-emerald-200 px-3.5 py-2 shadow-2xs">
                <span className="text-2xl font-black text-emerald-600">
                  {topPair.score}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Fit Score
                </span>
              </div>

              <Link
                href={`/match?project=${topPair.project.id}&employer=${topPair.employer.id}`}
              >
                <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                  Inspect Fit Details
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

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

                <Avatar size="md">
                  <AvatarImage
                    src={pair.employer.avatarUrl || ""}
                    alt={pair.employer.name}
                  />
                  <AvatarFallback>
                    {pair.employer.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {pair.employer.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({pair.employer.roleTitle})
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {pair.employer.yearsOfExperience} yrs exp
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                    <span className="font-medium text-indigo-600">
                      {pair.project.companyName}
                    </span>
                    <span>•</span>
                    <span>{pair.project.title}</span>
                    <span>•</span>
                    <span className="text-slate-400">
                      Min {pair.project.minExperienceYears} yrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Score badge & Action */}
              <div className="flex items-center gap-4 ml-11 md:ml-0">
                <MatchScoreBadge score={pair.score} size="default" />

                <Link
                  href={`/match?project=${pair.project.id}&employer=${pair.employer.id}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors"
                  >
                    View Match
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

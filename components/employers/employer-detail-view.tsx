"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RankedProjectMatch } from "@/lib/actions/matching";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { CandidateCourseEnrollment } from "@/lib/actions/learning";
import { CandidatePlacementItem } from "@/lib/actions/pipeline";
import { CourseItem } from "@/lib/actions/courses";
import { MatchScoreBadge } from "@/components/match/match-score-badge";
import { CandidateLearningDashboard } from "./candidate-learning-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";

interface EmployerDetailViewProps {
  employer: EmployerWithDetails;
  rankings: RankedProjectMatch[];
  enrollments: CandidateCourseEnrollment[];
  allCourses: CourseItem[];
  missingSkillTags: string[];
  placements?: CandidatePlacementItem[];
}

export function EmployerDetailView({
  employer,
  rankings,
  enrollments,
  allCourses,
  missingSkillTags,
  placements = [],
}: EmployerDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "learning" | "pipeline">("projects");

  const placedCount = placements.filter((p) => p.stage === "Placed").length;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1.5 gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
            activeTab === "projects"
              ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Ranked Project Compatibility ({rankings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
            activeTab === "learning"
              ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>My Learning Journey ({enrollments.length} Enrolled)</span>
          {enrollments.some((e) => e.status === "Completed") && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
              +{enrollments.filter((e) => e.status === "Completed").length} Levels
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
            activeTab === "pipeline"
              ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Staffing Pipeline ({placements.length})</span>
          {placedCount > 0 && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
              {placedCount} Placed
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Ranked Project Compatibility */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Ranked Project Opportunities ({rankings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Company projects ranked by compatibility with {employer.name}&apos;s verified skill matrix.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("learning")}
              className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              View Learning Journey
            </Button>
          </div>

          <div className="space-y-3">
            {rankings.map((item, index) => {
              const project = item.project;
              const analysis = item.analysis;

              return (
                <div
                  key={project.id}
                  className="group flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm"
                >
                  {/* Project Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                      #{index + 1}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {project.title}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">
                          {project.category}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">
                          ({project.companyName})
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="text-emerald-700 font-medium">
                          ✓ {analysis.matchedSkills.length} skills matched
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

                  {/* Score & Match CTA */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                    <MatchScoreBadge score={analysis.overallScore} size="default" />

                    <Link
                      href={`/match?projectId=${project.id}&employerId=${employer.id}`}
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
      )}

      {/* Tab 2: Candidate Learning Journey */}
      {activeTab === "learning" && (
        <CandidateLearningDashboard
          employerId={employer.id}
          employerName={employer.name}
          initialEnrollments={enrollments}
          availableCourses={allCourses}
          missingSkillTags={missingSkillTags}
        />
      )}

      {/* Tab 3: Staffing Pipeline & Placements */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Active Staffing Placements ({placements.length})
            </h2>
            <p className="text-xs text-slate-500">
              Company projects where {employer.name} is currently engaged across ATS pipeline stages.
            </p>
          </div>

          {placements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-2xs">
              <UserCheck className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                No active project placements
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This candidate has not yet been added to any project staffing pipelines.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {placements.map((p) => {
                const isPlaced = p.stage === "Placed";
                const isInterview = p.stage === "Interview";
                const isUpskilling = p.stage === "In Upskilling";

                const stageBadgeColor = isPlaced
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isInterview
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : isUpskilling
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-blue-50 text-blue-800 border-blue-200";

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-2xs transition-all bg-white ${
                      isPlaced
                        ? "border-emerald-300 ring-1 ring-emerald-200 hover:border-emerald-400"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {p.project.title}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stageBadgeColor}`}
                        >
                          Stage: {p.stage}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                          {p.project.company.name}
                        </span>
                        <span>•</span>
                        <span>Category: {p.project.category}</span>
                        {p.assignedRole && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">
                              Role: {p.assignedRole}
                            </span>
                          </>
                        )}
                      </div>

                      {p.notes && (
                        <p className="text-xs text-slate-700 italic bg-slate-50 rounded-lg p-2.5 border border-slate-200 mt-1 max-w-xl">
                          &ldquo;{p.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${p.project.id}/pipeline`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                          View Project ATS
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

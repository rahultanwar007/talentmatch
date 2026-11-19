"use client";

import React from "react";
import Link from "next/link";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { MatchAnalysis } from "@/lib/engine/types";
import { CandidatePlacementItem } from "@/lib/actions/pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Award,
  Layers,
  Clock,
} from "lucide-react";

interface ExecutiveDossierViewProps {
  project: ProjectWithDetails;
  employer: EmployerWithDetails;
  analysis: MatchAnalysis;
  placement?: CandidatePlacementItem | null;
}

export function ExecutiveDossierView({
  project,
  employer,
  analysis,
  placement,
}: ExecutiveDossierViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const isRecommended = analysis.overallScore >= 75;
  const isConditional = analysis.overallScore >= 55 && analysis.overallScore < 75;

  const recommendationTier = isRecommended
    ? {
        label: "STRONG FIT — RECOMMENDED FOR IMMEDIATE PLACEMENT",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        desc: "Candidate exceeds core technical requisites with minimal onboarding friction.",
      }
    : isConditional
    ? {
        label: "CONDITIONAL FIT — QUALIFIED WITH TARGETED UPSKILLING",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        desc: "Candidate possesses strong foundational competencies but requires bridge training in highlighted gaps.",
      }
    : {
        label: "DEVELOPMENTAL CANDIDATE — EXTENSIVE UPSKILLING REQUIRED",
        badge: "bg-rose-50 text-rose-800 border-rose-200",
        desc: "Significant variance from project requirements; recommended only with structured mentorship.",
      };

  return (
    <div className="space-y-6">
      {/* Top Interactive Controls (Hidden during window.print()) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <Link
          href={`/match?projectId=${project.id}&employerId=${employer.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Match Studio
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print / Save Executive PDF
          </Button>

          <Link href={`/projects/${project.id}/pipeline`}>
            <Button variant="secondary" size="sm" className="text-xs border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium">
              <UserCheck className="h-4 w-4 mr-1.5 text-indigo-600" />
              View ATS Pipeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Printable Dossier Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:p-0 print:shadow-none">
        {/* Memo Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                TalentMatch Pro • Verified Executive Assessment
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Candidate Evaluation & Placement Dossier
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Document Ref: TMP-DOSSIER-{project.id.slice(0, 8)}-{employer.id.slice(0, 8)} • Generated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Executive Readiness
              </span>
              <span className="text-3xl font-extrabold font-mono text-emerald-700">
                {analysis.overallScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Primary Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
          {/* Candidate Summary */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              Candidate Profile
            </p>
            <p className="text-base font-bold text-slate-900">
              {employer.name}
            </p>
            <p className="text-slate-700 font-medium">
              {employer.roleTitle}
            </p>
            <div className="space-y-1 text-slate-600">
              <p>Experience: {employer.yearsOfExperience} verified years</p>
              <p>Email: {employer.email}</p>
              <p>Status: {employer.availability}</p>
              <p>Location: {employer.location || "Remote"}</p>
            </div>
          </div>

          {/* Target Project Summary */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              Target Engagement
            </p>
            <p className="text-base font-bold text-slate-900">
              {project.title}
            </p>
            <p className="text-slate-700 font-medium">
              Client: {project.companyName}
            </p>
            <div className="space-y-1 text-slate-600">
              <p>Domain: {project.category}</p>
              <p>Minimum Experience: {project.minExperienceYears}+ years</p>
              <p>Budget: {project.budget || "Competitive"}</p>
              <p>
                Current ATS Stage:{" "}
                <span className="font-semibold text-slate-900">
                  {placement ? placement.stage : "Not in active pipeline"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Executive Recommendation Banner */}
        <div className={`p-4 rounded-xl border ${recommendationTier.badge}`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            <Award className="h-4 w-4" />
            <span>{recommendationTier.label}</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            {recommendationTier.desc}
          </p>
        </div>

        {/* Score Breakdown Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
            <Layers className="h-4 w-4 text-indigo-600" />
            Compatibility Scoring Breakdown
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-3 bg-white text-center shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Must-Have Skills (70%)</p>
              <p className="text-xl font-bold font-mono text-indigo-700 mt-1">
                {analysis.requiredSkillsScore}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {analysis.requiredMatchedCount}/{analysis.requiredTotalCount} requirements met
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white text-center shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Bonus Skills (15%)</p>
              <p className="text-xl font-bold font-mono text-purple-700 mt-1">
                {analysis.preferredSkillsScore}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Specialized domain coverage
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white text-center shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Experience (15%)</p>
              <p className="text-xl font-bold font-mono text-sky-700 mt-1">
                {analysis.experienceScore}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {employer.yearsOfExperience} yrs vs {project.minExperienceYears} yrs req
              </p>
            </div>
          </div>
        </div>

        {/* Competency vs Requirements Matrix Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Verified Competency vs Requirement Audit
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Technical Requirement</th>
                  <th className="p-3">Requirement Priority</th>
                  <th className="p-3">Target Level</th>
                  <th className="p-3">Candidate Level</th>
                  <th className="p-3">Audit Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {analysis.allSkillBreakdown.map((item) => (
                  <tr key={item.skillName} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {item.skillName}
                    </td>
                    <td className="p-3">
                      {item.isRequired ? (
                        <span className="font-semibold text-indigo-700">
                          Critical Must-Have
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Preferred Bonus
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700">Level {item.requiredProficiency}</td>
                    <td className="p-3 font-mono text-slate-700">
                      {item.candidateProficiency > 0
                        ? `Level ${item.candidateProficiency} (${item.candidateYears} yrs)`
                        : "—"}
                    </td>
                    <td className="p-3">
                      {item.status === "matched" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Meets / Exceeds Target
                        </span>
                      ) : item.status === "under_proficient" ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Proficiency Upgrade Needed (+{item.requiredProficiency - item.candidateProficiency} Level)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Missing Competency
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Mitigation & Prescribed Upskilling Curriculum */}
        {analysis.recommendedCourses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-medium">
              <GraduationCap className="h-4 w-4 text-amber-600" />
              Prescribed Upskilling Roadmap & Risk Mitigation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.recommendedCourses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/70 text-xs space-y-1 shadow-2xs"
                >
                  <p className="font-bold text-slate-900">{course.title}</p>
                  <p className="text-slate-500">
                    Provider: {course.provider} • Duration: {course.duration}
                  </p>
                  <p className="text-amber-800 text-[11px] font-medium">
                    Purpose: {course.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Sign-off & Placement Authorization */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Placement Authorization & Sign-Off
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 text-xs">
            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-slate-800">
                Staffing Director Signature
              </p>
              <p className="text-[10px] text-slate-400 mt-4">Date: ____________________</p>
            </div>

            <div className="border-t border-slate-300 pt-2">
              <p className="font-semibold text-slate-800">
                Hiring Manager Approval
              </p>
              <p className="text-[10px] text-slate-400 mt-4">Date: ____________________</p>
            </div>

            <div className="border-t border-slate-300 pt-2 col-span-2 sm:col-span-1">
              <p className="font-semibold text-slate-800">
                Candidate Acknowledgment
              </p>
              <p className="text-[10px] text-slate-400 mt-4">Date: ____________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

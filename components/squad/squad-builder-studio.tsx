"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { CourseItem } from "@/lib/actions/courses";
import { calculateSquadAnalysis } from "@/lib/engine/squad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Users,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Building2,
  GraduationCap,
  Zap,
  RotateCcw,
} from "lucide-react";

interface SquadBuilderStudioProps {
  projects: ProjectWithDetails[];
  employers: EmployerWithDetails[];
  courses: CourseItem[];
  initialProjectId?: string;
}

export function SquadBuilderStudio({
  projects,
  employers,
  courses,
  initialProjectId,
}: SquadBuilderStudioProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ""
  );

  // Multi-selected candidate IDs (default first 2 candidates)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() => {
    return employers.slice(0, 2).map((e) => e.id);
  });

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const squadMembers = useMemo(
    () => employers.filter((e) => selectedMemberIds.includes(e.id)),
    [employers, selectedMemberIds]
  );

  const availableCandidates = useMemo(
    () => employers.filter((e) => !selectedMemberIds.includes(e.id)),
    [employers, selectedMemberIds]
  );

  // Calculate Cumulative Squad Coverage
  const squadAnalysis = useMemo(() => {
    if (!selectedProject) return null;
    return calculateSquadAnalysis(selectedProject, squadMembers, courses);
  }, [selectedProject, squadMembers, courses]);

  const handleAddMember = (id: string) => {
    if (selectedMemberIds.length >= 6) return;
    setSelectedMemberIds((prev) => [...prev, id]);
  };

  const handleRemoveMember = (id: string) => {
    setSelectedMemberIds((prev) => prev.filter((mId) => mId !== id));
  };

  // Presets
  const handleApplyPreset = (count: number) => {
    if (!selectedProject || employers.length === 0) return;
    // Rank candidates by their individual match to the project
    const ranked = [...employers].sort((a, b) => {
      const aMatches = a.skills.filter((s) =>
        selectedProject.skills.some((ps) => ps.skillName.toLowerCase() === s.skillName.toLowerCase())
      ).length;
      const bMatches = b.skills.filter((s) =>
        selectedProject.skills.some((ps) => ps.skillName.toLowerCase() === s.skillName.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });
    setSelectedMemberIds(ranked.slice(0, count).map((e) => e.id));
  };

  if (projects.length === 0 || employers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        <p className="text-lg font-bold text-slate-800">No projects or talent profiles available.</p>
        <p className="text-xs text-slate-500 mt-1">Please seed the database to assemble squads.</p>
      </div>
    );
  }

  const isFullCoverage =
    squadAnalysis &&
    squadAnalysis.satisfiedRequiredCount === squadAnalysis.totalRequiredCount;

  return (
    <div className="space-y-8">
      {/* Non-Technical Explainer Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/40 p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Complementary Team Assembler
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Build a High-Performance Engineering Squad
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              When one engineer cannot fulfill every skill requirement alone, the Squad Builder combines complementary specialists so that <strong>100% of the project's technical needs are covered</strong> seamlessly.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <span className="text-[11px] font-bold uppercase text-slate-400 block sm:inline">
              1-Click Presets:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(2)}
              className="text-xs bg-white hover:bg-slate-50 border-slate-300"
            >
              <Zap className="h-3 w-3 mr-1 text-indigo-600" />
              Fast Duo (2)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(3)}
              className="text-xs bg-white hover:bg-slate-50 border-slate-300"
            >
              <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
              Balanced Trio (3)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMemberIds([])}
              className="text-xs text-slate-500 hover:text-slate-800"
              title="Clear all squad members"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Target Project Selector Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Select Target Project Requisition
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.companyName}) — {p.category}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-0">
              <div className="text-xs text-slate-500">
                <span className="block text-[11px] text-slate-400 uppercase font-medium">
                  Required Competencies:
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedProject.skills.length} skills ({selectedProject.skills.filter(s => s.isRequired).length} must-have)
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Min: {selectedProject.minExperienceYears}+ yrs exp
              </Badge>
            </div>
          )}
        </div>
      </div>

      {selectedProject && squadAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Team Squad Summary & Member Deck (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Squad Cumulative Coverage Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Team Skill Coverage
                </span>
                <Badge
                  variant={
                    isFullCoverage
                      ? "success"
                      : squadAnalysis.squadCoverageScore >= 70
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs font-bold"
                >
                  {isFullCoverage ? "🟢 100% Full Team Coverage" : `🟡 ${squadAnalysis.squadCoverageScore}% Partial Coverage`}
                </Badge>
              </div>

              {/* Big Score Display */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-900">
                  {squadAnalysis.squadCoverageScore}
                </span>
                <span className="text-2xl font-bold text-slate-400">%</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Must-Have Requirements Fulfilled:</span>
                  <strong className="font-mono text-emerald-700 font-bold">
                    {squadAnalysis.satisfiedRequiredCount} of{" "}
                    {squadAnalysis.totalRequiredCount}
                  </strong>
                </div>

                <div className="h-3 w-full rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFullCoverage
                        ? "bg-emerald-500"
                        : squadAnalysis.squadCoverageScore >= 70
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${squadAnalysis.squadCoverageScore}%`,
                    }}
                  />
                </div>
              </div>

              {/* Key Squad Metrics */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Team Depth / Backup:
                  </span>
                  <strong className="text-slate-800 font-mono flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    {squadAnalysis.redundantSkillsCount} skills backed up
                  </strong>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Combined Experience:
                  </span>
                  <strong className="text-slate-800 font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    {squadAnalysis.combinedExperienceYears} years total
                  </strong>
                </div>
              </div>
            </div>

            {/* Assembled Squad Roster */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Assembled Squad Roster ({squadMembers.length}/6)
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Max 6 members
                </span>
              </div>

              {squadMembers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center text-xs text-slate-500">
                  No members added to the squad yet. Click candidates below or select a 1-click preset!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {squadMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage
                            src={member.avatarUrl || ""}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h5 className="font-semibold text-slate-900 text-xs">
                            {member.name}
                          </h5>
                          <p className="text-[11px] text-indigo-600 font-medium">
                            {member.roleTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {member.yearsOfExperience}y exp
                        </Badge>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove from squad"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Pool Add Row */}
            {availableCandidates.length > 0 && selectedMemberIds.length < 6 && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Add Candidates from Bench:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {availableCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => handleAddMember(cand.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                    >
                      <Plus className="h-3 w-3 text-indigo-600" />
                      <span>{cand.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({cand.roleTitle.split(" ")[0]})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Squad Competency Matrix Table (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    Squad Competency & Responsibility Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Maps each required skill to its primary lead and redundancy depth across the team.
                  </p>
                </div>

                <Badge variant="outline" className="text-xs">
                  {squadAnalysis.coveredSkills.length} of{" "}
                  {squadAnalysis.totalSkillCount} Skills Covered
                </Badge>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-2.5">
                {squadAnalysis.skillMatrix.map((item) => (
                  <div
                    key={item.skillName}
                    className="rounded-xl border border-slate-200/90 bg-white p-3 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.skillName}
                        </span>
                        {item.isRequired && (
                          <span className="text-rose-600 font-bold" title="Must-Have">
                            *
                          </span>
                        )}
                      </div>
                      {item.status === "covered" ? (
                        <Badge variant="success" className="text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Covered
                        </Badge>
                      ) : item.status === "under_proficient" ? (
                        <Badge variant="warning" className="text-[10px]">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs +L{item.requiredProficiency - item.squadMaxProficiency}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          <XCircle className="h-3 w-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Target: <strong className="font-mono text-slate-700">L{item.requiredProficiency}</strong></span>
                      <span>Squad Max: <strong className="font-mono text-slate-900 font-bold">L{item.squadMaxProficiency}</strong></span>
                      <span>Lead: <strong className="text-indigo-600">{item.primaryOwner ? item.primaryOwner.employerName : "None"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Coverage Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50/60">
                      <th className="py-3 px-3">Project Skill</th>
                      <th className="py-3 px-2">Target</th>
                      <th className="py-3 px-2">Squad Max</th>
                      <th className="py-3 px-3">Primary Lead</th>
                      <th className="py-3 px-2">Team Depth</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {squadAnalysis.skillMatrix.map((item) => (
                      <tr
                        key={item.skillName}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900">
                            {item.skillName}
                          </span>
                          {item.isRequired && (
                            <span className="text-rose-600 ml-1 font-bold" title="Must-Have Skill">
                              *
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-600">
                          L{item.requiredProficiency}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">
                          L{item.squadMaxProficiency}
                        </td>
                        <td className="py-3 px-3">
                          {item.primaryOwner ? (
                            <span className="font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">
                              {item.primaryOwner.employerName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-slate-600">
                            {(item.primaryOwner ? 1 : 0) + item.backupContributors.length} member{((item.primaryOwner ? 1 : 0) + item.backupContributors.length) !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {item.status === "covered" ? (
                            <Badge variant="success" className="text-[10px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Covered
                            </Badge>
                          ) : item.status === "under_proficient" ? (
                            <Badge variant="warning" className="text-[10px]">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs +L{item.requiredProficiency - item.squadMaxProficiency}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              <XCircle className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

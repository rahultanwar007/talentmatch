"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { CourseItem } from "@/lib/actions/courses";
import { calculateSquadAnalysis } from "@/lib/engine/squad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Multi-selected candidate IDs
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() => {
    // Default pick first 2 candidates
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

  if (projects.length === 0 || employers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        <p className="text-lg">No projects or talent profiles available.</p>
      </div>
    );
  }

  const isFullCoverage =
    squadAnalysis &&
    squadAnalysis.satisfiedRequiredCount === squadAnalysis.totalRequiredCount;

  return (
    <div className="space-y-8">
      {/* Target Project Selector Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              Target Project Requisition
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
                  Required Skills:
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedProject.skills.length} technical competencies
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
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cumulative Squad Fit
                </span>
                <Badge
                  variant={
                    isFullCoverage
                      ? "success"
                      : squadAnalysis.squadCoverageScore >= 70
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs font-medium"
                >
                  {isFullCoverage ? "100% Full Team Coverage" : "Partial Coverage"}
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
                  <span>Mandatory Requirements Covered:</span>
                  <strong className="font-mono text-emerald-700 font-bold">
                    {squadAnalysis.satisfiedRequiredCount} of{" "}
                    {squadAnalysis.totalRequiredCount}
                  </strong>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden">
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
                    Team Depth / Redundancy:
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
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
                  No members added to the squad yet. Pick candidates below!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {squadMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.avatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          }
                          alt={member.name}
                          className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                        />
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
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Add Candidates from Talent Pool:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {availableCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => handleAddMember(cand.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
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

              {/* Coverage Table */}
              <div className="overflow-x-auto">
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
                            <span className="text-rose-600 ml-1 font-bold">
                              *
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-slate-600 font-mono">
                          L{item.requiredProficiency}
                        </td>

                        <td className="py-3 px-2 font-mono">
                          <span
                            className={
                              item.status === "covered"
                                ? "text-emerald-700 font-bold"
                                : item.status === "under_proficient"
                                ? "text-amber-700 font-bold"
                                : "text-rose-600 font-bold"
                            }
                          >
                            L{item.squadMaxProficiency}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {item.primaryOwner ? (
                            <span className="font-medium text-slate-800">
                              {item.primaryOwner.employerName}{" "}
                              <span className="text-[10px] text-indigo-600 font-semibold">
                                (L{item.primaryOwner.proficiencyLevel})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          {item.backupContributors.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                              <ShieldCheck className="h-3 w-3 text-indigo-600" />
                              +{item.backupContributors.length} backup
                            </span>
                          ) : item.primaryOwner ? (
                            <span className="text-[10px] text-amber-700 font-medium">
                              Single Point
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-medium">
                              No Depth
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Badge
                            variant={
                              item.status === "covered"
                                ? "success"
                                : item.status === "under_proficient"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {item.status === "covered"
                              ? "Covered"
                              : item.status === "under_proficient"
                              ? "Partial"
                              : "Missing"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Residual Squad Gaps & Upskilling Suggestions */}
            {squadAnalysis.recommendedCourses.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-rose-600" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">
                      Remaining Squad Skill Deficits ({squadAnalysis.recommendedCourses.length})
                    </h4>
                    <p className="text-xs text-slate-600">
                      Even with all selected members, the squad still lacks these requirements. Assign these courses to bridge the remaining gaps.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {squadAnalysis.recommendedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <Badge variant="default" className="text-[10px] font-mono">
                            {c.skillTag}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {c.provider}
                          </span>
                        </div>
                        <h5 className="font-semibold text-slate-900 line-clamp-1">
                          {c.title}
                        </h5>
                        <p className="text-[10px] text-rose-600 mt-1 line-clamp-1">
                          {c.reason}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>View Course</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

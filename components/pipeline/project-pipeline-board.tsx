"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlacementStage,
  PlacementWithDetails,
  ProjectPipelineData,
  updatePlacementStage,
  addCandidateToPipeline,
  removeCandidateFromPipeline,
} from "@/lib/actions/pipeline";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { MatchScoreBadge } from "@/components/match/match-score-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Users,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  MessageSquare,
  Plus,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  UserCheck,
} from "lucide-react";

const STAGES: {
  key: PlacementStage;
  label: string;
  shortDesc: string;
  headerBorder: string;
  headerBg: string;
  headerText: string;
  countBg: string;
}[] = [
  {
    key: "Matched",
    label: "Matched Pool",
    shortDesc: "Algorithmic recommendations",
    headerBorder: "border-blue-200",
    headerBg: "bg-blue-50/80",
    headerText: "text-blue-900",
    countBg: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    key: "Shortlisted",
    label: "Shortlisted",
    shortDesc: "Approved for review",
    headerBorder: "border-indigo-200",
    headerBg: "bg-indigo-50/80",
    headerText: "text-indigo-900",
    countBg: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  {
    key: "Interview",
    label: "In Evaluation",
    shortDesc: "Technical interviews & screens",
    headerBorder: "border-purple-200",
    headerBg: "bg-purple-50/80",
    headerText: "text-purple-900",
    countBg: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    key: "In Upskilling",
    label: "In Upskilling",
    shortDesc: "Bridging skill prerequisites",
    headerBorder: "border-amber-200",
    headerBg: "bg-amber-50/80",
    headerText: "text-amber-900",
    countBg: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    key: "Placed",
    label: "Placed / Staffed",
    shortDesc: "Hired & availability locked",
    headerBorder: "border-emerald-200",
    headerBg: "bg-emerald-50/80",
    headerText: "text-emerald-900",
    countBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
];

interface ProjectPipelineBoardProps {
  initialData: ProjectPipelineData;
  allEmployers: EmployerWithDetails[];
}

export function ProjectPipelineBoard({
  initialData,
  allEmployers,
}: ProjectPipelineBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for optimistic updates
  const [placements, setPlacements] = useState<PlacementWithDetails[]>(
    initialData.placements
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Note editing state: { placementId, text }
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Add Candidate Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [modalStage, setModalStage] = useState<PlacementStage>("Matched");
  const [modalNotes, setModalNotes] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [candidateModalSearch, setCandidateModalSearch] = useState("");

  const project = initialData.project;

  // Filter candidates already in pipeline for the modal picker
  const candidateIdsInPipeline = new Set(placements.map((p) => p.employerId));
  const availableCandidates = allEmployers.filter(
    (e) => !candidateIdsInPipeline.has(e.id)
  );

  const filteredModalCandidates = availableCandidates.filter(
    (e) =>
      e.name.toLowerCase().includes(candidateModalSearch.toLowerCase()) ||
      e.roleTitle.toLowerCase().includes(candidateModalSearch.toLowerCase()) ||
      e.skills.some((s) =>
        s.skillName.toLowerCase().includes(candidateModalSearch.toLowerCase())
      )
  );

  // Filter placements on the board
  const filteredPlacements = placements.filter((p) => {
    if (minScoreFilter > 0 && p.matchScore < minScoreFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.employer.name.toLowerCase().includes(query) ||
      p.employer.roleTitle.toLowerCase().includes(query) ||
      (p.notes && p.notes.toLowerCase().includes(query)) ||
      (p.assignedRole && p.assignedRole.toLowerCase().includes(query)) ||
      p.employer.skills.some((s) => s.skillName.toLowerCase().includes(query))
    );
  });

  // Stage change handler
  const handleStageChange = async (
    placementId: string,
    newStage: PlacementStage
  ) => {
    // Optimistic update
    setPlacements((prev) =>
      prev.map((p) => {
        if (p.id === placementId) {
          return {
            ...p,
            stage: newStage,
            employer: {
              ...p.employer,
              availability: newStage === "Placed" ? "Assigned" : p.employer.availability,
            },
          };
        }
        return p;
      })
    );

    startTransition(async () => {
      const res = await updatePlacementStage(placementId, newStage);
      if (!res.success) {
        // Rollback if needed
        router.refresh();
      }
    });
  };

  // Move one stage left/right
  const handleShiftStage = (placementId: string, currentStage: PlacementStage, direction: -1 | 1) => {
    const stageKeys = STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < stageKeys.length) {
      handleStageChange(placementId, stageKeys[nextIndex]);
    }
  };

  // Note save handler
  const handleSaveNote = async (placementId: string) => {
    const textToSave = noteDraft.trim();
    setPlacements((prev) =>
      prev.map((p) => (p.id === placementId ? { ...p, notes: textToSave } : p))
    );
    setEditingNoteId(null);
    setNoteDraft("");

    startTransition(async () => {
      const p = placements.find((item) => item.id === placementId);
      if (p) {
        await updatePlacementStage(placementId, p.stage, textToSave);
      }
    });
  };

  // Remove candidate handler
  const handleRemove = async (placementId: string) => {
    if (!confirm("Are you sure you want to remove this candidate from the staffing pipeline?")) {
      return;
    }
    setPlacements((prev) => prev.filter((p) => p.id !== placementId));
    startTransition(async () => {
      await removeCandidateFromPipeline(placementId);
      router.refresh();
    });
  };

  // Add Candidate to Pipeline submit handler
  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return;

    startTransition(async () => {
      await addCandidateToPipeline(
        project.id,
        selectedCandidateId,
        modalStage,
        modalNotes.trim() || undefined,
        modalRole.trim() || undefined
      );
      setShowAddModal(false);
      setSelectedCandidateId("");
      setModalNotes("");
      setModalRole("");
      router.refresh();
    });
  };

  // Placed count calculation
  const placedCount = placements.filter((p) => p.stage === "Placed").length;
  const inInterviewCount = placements.filter((p) => p.stage === "Interview").length;
  const inUpskillingCount = placements.filter((p) => p.stage === "In Upskilling").length;

  return (
    <div className="space-y-6">
      {/* Project Banner & Fast Actions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50">
                <Building2 className="h-3 w-3 mr-1 text-indigo-600" />
                {project.companyName}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {project.category}
              </Badge>
              <Badge variant="success" className="text-xs">
                Status: {project.status}
              </Badge>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Min Experience: {project.minExperienceYears}+ years
              </span>
              <span>•</span>
              <span>Budget: {project.budget || "Competitive"}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                {placedCount} Candidate{placedCount === 1 ? "" : "s"} Placed
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="default"
              onClick={() => setShowAddModal(true)}
              className="shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Candidate to Pipeline
            </Button>

            <Link href={`/squad?projectId=${project.id}`}>
              <Button variant="secondary" size="sm" className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200">
                <Layers className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                Squad Builder
              </Button>
            </Link>

            <Link href={`/match?projectId=${project.id}`}>
              <Button variant="secondary" size="sm" className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                Match Studio
              </Button>
            </Link>

            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                View Project
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline Summary Metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total in ATS</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{placements.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Placed / Staffed</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{placedCount}</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3">
            <p className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">In Evaluation</p>
            <p className="text-xl font-bold text-purple-700 mt-1">{inInterviewCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">In Upskilling</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{inUpskillingCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidates by name, role, notes, or technical skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-slate-300 text-sm h-9 text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap font-medium">
            <Filter className="h-3 w-3" />
            Min Match:
          </span>
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="0">All Match Scores</option>
            <option value="50">≥ 50% Match</option>
            <option value="70">≥ 70% Match</option>
            <option value="85">≥ 85% High Match</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((stageInfo) => {
          const stagePlacements = filteredPlacements.filter(
            (p) => p.stage === stageInfo.key
          );

          return (
            <div
              key={stageInfo.key}
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3 min-h-[500px] shadow-2xs"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between rounded-xl border ${stageInfo.headerBorder} ${stageInfo.headerBg} p-2.5 mb-3`}
              >
                <div>
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${stageInfo.headerText}`}
                  >
                    {stageInfo.label}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5 font-medium">
                    {stageInfo.shortDesc}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-mono font-bold ${stageInfo.countBg}`}
                >
                  {stagePlacements.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3">
                {stagePlacements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-400">
                    <p className="text-xs">No candidates in {stageInfo.label.toLowerCase()}</p>
                    {stageInfo.key === "Matched" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalStage(stageInfo.key);
                          setShowAddModal(true);
                        }}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Candidate
                      </Button>
                    )}
                  </div>
                ) : (
                  stagePlacements.map((placement) => {
                    const candidate = placement.employer;
                    const isPlaced = placement.stage === "Placed";
                    const isUpskilling = placement.stage === "In Upskilling";
                    const isEditingNote = editingNoteId === placement.id;

                    return (
                      <div
                        key={placement.id}
                        className={`group rounded-xl border transition-all duration-200 p-3.5 bg-white hover:border-slate-300 shadow-2xs hover:shadow-sm ${
                          isPlaced
                            ? "border-emerald-300 ring-1 ring-emerald-200"
                            : isUpskilling
                            ? "border-amber-300 ring-1 ring-amber-200"
                            : "border-slate-200"
                        }`}
                      >
                        {/* Candidate Top Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 font-bold text-xs text-white">
                              {candidate.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/employers/${candidate.id}`}
                                className="block font-semibold text-xs text-slate-900 hover:text-indigo-600 truncate"
                              >
                                {candidate.name}
                              </Link>
                              <p className="text-[10px] text-slate-500 truncate font-medium">
                                {placement.assignedRole || candidate.roleTitle}
                              </p>
                            </div>
                          </div>

                          <MatchScoreBadge
                            score={placement.matchScore}
                            size="sm"
                            showIcon={false}
                          />
                        </div>

                        {/* Availability Pill & Experience */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium border ${
                              candidate.availability === "Assigned" || isPlaced
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                candidate.availability === "Assigned" || isPlaced
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            {isPlaced ? "Locked / Assigned" : candidate.availability}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {candidate.yearsOfExperience} yrs exp
                          </span>
                        </div>

                        {/* Top Skills Chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.skills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="rounded bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 text-[9px] text-slate-700 font-medium"
                            >
                              {s.skillName} (L{s.proficiencyLevel})
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-[9px] text-slate-400 self-center">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Notes Section */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          {isEditingNote ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Add hiring notes, interview feedback, or prerequisites..."
                                className="w-full rounded-md border border-slate-300 bg-white p-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingNoteId(null)}
                                  className="h-6 px-1.5 text-[10px] text-slate-500"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSaveNote(placement.id)}
                                  className="h-6 px-2 text-[10px]"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNoteId(placement.id);
                                setNoteDraft(placement.notes || "");
                              }}
                              className="cursor-pointer group/note rounded p-1 hover:bg-slate-50 transition-colors"
                            >
                              {placement.notes ? (
                                <p className="text-[10px] text-slate-600 italic line-clamp-2">
                                  &ldquo;{placement.notes}&rdquo;
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400 group-hover/note:text-slate-600 flex items-center gap-1 font-medium">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  + Click to add notes
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions & Stage Shift */}
                        <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-slate-100">
                          {/* Shift Left */}
                          <button
                            onClick={() => handleShiftStage(placement.id, placement.stage, -1)}
                            disabled={stageInfo.key === "Matched" || isPending}
                            title="Move to previous stage"
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>

                          {/* Quick Stage Dropdown */}
                          <select
                            value={placement.stage}
                            onChange={(e) =>
                              handleStageChange(
                                placement.id,
                                e.target.value as PlacementStage
                              )
                            }
                            disabled={isPending}
                            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-800 focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          {/* Shift Right */}
                          <button
                            onClick={() => handleShiftStage(placement.id, placement.stage, 1)}
                            disabled={stageInfo.key === "Placed" || isPending}
                            title="Advance to next stage"
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemove(placement.id)}
                            disabled={isPending}
                            title="Remove candidate from pipeline"
                            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Add Candidate to Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Select a talent profile to track in this project&apos;s ATS pipeline.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidateSubmit} className="space-y-4">
              {/* Candidate Search & Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Talent Profile:
                </label>
                <Input
                  placeholder="Filter candidate by name or skill..."
                  value={candidateModalSearch}
                  onChange={(e) => setCandidateModalSearch(e.target.value)}
                  className="bg-white border-slate-300 text-xs h-8 text-slate-900 mb-2"
                />

                <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1.5">
                  {filteredModalCandidates.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      {availableCandidates.length === 0
                        ? "All available candidates are already in this pipeline!"
                        : "No matching candidates found"}
                    </p>
                  ) : (
                    filteredModalCandidates.map((candidate) => {
                      const isSelected = selectedCandidateId === candidate.id;
                      return (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedCandidateId(candidate.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? "bg-indigo-600 text-white font-medium"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            <p
                              className={`text-[10px] ${
                                isSelected ? "text-indigo-100" : "text-slate-500"
                              }`}
                            >
                              {candidate.roleTitle} • {candidate.yearsOfExperience} yrs
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Stage Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Initial ATS Stage:
                </label>
                <select
                  value={modalStage}
                  onChange={(e) => setModalStage(e.target.value as PlacementStage)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} ({s.shortDesc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Assigned Project Role Title (Optional):
                </label>
                <Input
                  placeholder="e.g. Lead Frontend Architect, Backend Specialist"
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  className="bg-white border-slate-300 text-xs h-8 text-slate-900"
                />
              </div>

              {/* Initial Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Initial Notes / Evaluation Feedback (Optional):
                </label>
                <textarea
                  placeholder="Enter initial recruiter or technical review feedback..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={!selectedCandidateId || isPending}
                >
                  {isPending ? "Adding..." : "Add to Pipeline"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

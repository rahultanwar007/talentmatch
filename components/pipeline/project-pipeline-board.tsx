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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    countBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "Shortlisted",
    label: "Shortlisted",
    shortDesc: "Recruiter reviewed & pre-qualified",
    headerBorder: "border-indigo-200",
    headerBg: "bg-indigo-50/80",
    headerText: "text-indigo-900",
    countBg: "bg-indigo-100 text-indigo-700",
  },
  {
    key: "In Upskilling",
    label: "In Upskilling",
    shortDesc: "Bridging skill gaps via courses",
    headerBorder: "border-amber-200",
    headerBg: "bg-amber-50/80",
    headerText: "text-amber-900",
    countBg: "bg-amber-100 text-amber-700",
  },
  {
    key: "Interview",
    label: "Interview & Review",
    shortDesc: "Client & technical evaluations",
    headerBorder: "border-purple-200",
    headerBg: "bg-purple-50/80",
    headerText: "text-purple-900",
    countBg: "bg-purple-100 text-purple-700",
  },
  {
    key: "Placed",
    label: "Placed & Active",
    shortDesc: "Successfully onboarded & staffing",
    headerBorder: "border-emerald-200",
    headerBg: "bg-emerald-50/80",
    headerText: "text-emerald-900",
    countBg: "bg-emerald-100 text-emerald-700",
  },
];

interface ProjectPipelineBoardProps {
  initialData: ProjectPipelineData;
  allEmployers?: EmployerWithDetails[];
  availableCandidates?: EmployerWithDetails[];
}

export function ProjectPipelineBoard({
  initialData,
  allEmployers,
  availableCandidates: providedCandidates,
}: ProjectPipelineBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const availableCandidates = allEmployers || providedCandidates || [];
  const { project, placements } = initialData;

  // Filter / Search inside the board
  const [searchFilter, setSearchFilter] = useState("");
  const [mobileActiveStage, setMobileActiveStage] = useState<PlacementStage>("Matched");

  // Notes editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Add Candidate to Pipeline modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [modalStage, setModalStage] = useState<PlacementStage>("Matched");
  const [modalNotes, setModalNotes] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [candidateModalSearch, setCandidateModalSearch] = useState("");

  const filteredModalCandidates = availableCandidates.filter(
    (c) =>
      c.name.toLowerCase().includes(candidateModalSearch.toLowerCase()) ||
      c.roleTitle.toLowerCase().includes(candidateModalSearch.toLowerCase()) ||
      c.skills.some((s) =>
        s.skillName.toLowerCase().includes(candidateModalSearch.toLowerCase())
      )
  );

  // Group placements by stage
  const placementsByStage = React.useMemo(() => {
    const map: Record<PlacementStage, PlacementWithDetails[]> = {
      Matched: [],
      Shortlisted: [],
      "In Upskilling": [],
      Interview: [],
      Placed: [],
      Archived: [],
    };

    placements.forEach((p) => {
      if (
        !searchFilter.trim() ||
        p.employer.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.employer.roleTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.employer.skills.some((s) =>
          s.skillName.toLowerCase().includes(searchFilter.toLowerCase())
        )
      ) {
        if (map[p.stage]) {
          map[p.stage].push(p);
        }
      }
    });

    return map;
  }, [placements, searchFilter]);

  // Stage transition handler
  const handleStageChange = async (
    placementId: string,
    newStage: PlacementStage
  ) => {
    startTransition(async () => {
      await updatePlacementStage(placementId, newStage);
      router.refresh();
    });
  };

  // Move forward / backward
  const handleShiftStage = async (
    placementId: string,
    currentStage: PlacementStage,
    direction: 1 | -1
  ) => {
    const stageKeys = STAGES.map((s) => s.key);
    const currentIndex = stageKeys.indexOf(currentStage);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < stageKeys.length) {
      const nextStage = stageKeys[nextIndex];
      await handleStageChange(placementId, nextStage);
    }
  };

  // Remove candidate from pipeline
  const handleRemove = async (placementId: string) => {
    if (!confirm("Are you sure you want to remove this candidate from the pipeline?")) {
      return;
    }
    startTransition(async () => {
      await removeCandidateFromPipeline(placementId);
      router.refresh();
    });
  };

  // Save updated notes
  const handleSaveNote = async (placementId: string) => {
    startTransition(async () => {
      const current = placements.find((p) => p.id === placementId);
      if (current) {
        await updatePlacementStage(placementId, current.stage, noteDraft.trim());
      }
      setEditingNoteId(null);
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

  const renderStageColumn = (stageInfo: typeof STAGES[number], isMobile = false) => {
    const stagePlacements = placementsByStage[stageInfo.key] || [];

    return (
      <div
        key={stageInfo.key}
        className={`flex flex-col rounded-2xl border ${stageInfo.headerBorder} bg-white shadow-2xs overflow-hidden ${
          isMobile ? "min-h-0" : "min-h-[460px]"
        }`}
      >
        {/* Column Header */}
        <div className={`p-3.5 border-b ${stageInfo.headerBorder} ${stageInfo.headerBg}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${stageInfo.headerText}`}>
              {stageInfo.label}
            </h4>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stageInfo.countBg}`}>
              {stagePlacements.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
            {stageInfo.shortDesc}
          </p>
        </div>

        {/* Column Cards */}
        <div className="p-3 space-y-3 flex-1 bg-slate-50/30 overflow-y-auto max-h-[600px]">
          {stagePlacements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              No candidates in this stage
            </div>
          ) : (
            stagePlacements.map((placement) => {
              const emp = placement.employer;
              const isEditingNote = editingNoteId === placement.id;

              return (
                <div
                  key={placement.id}
                  className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all space-y-2.5"
                >
                  {/* Header: Candidate Info & Avatar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarImage
                          src={emp.avatarUrl || ""}
                          alt={emp.name}
                        />
                        <AvatarFallback>
                          {emp.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/employers/${emp.id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {emp.name}
                        </Link>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {placement.assignedRole || emp.roleTitle}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="shrink-0">
                      <MatchScoreBadge score={placement.matchScore} size="sm" />
                    </div>
                  </div>

                  {/* Top Skills Tags */}
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.2 text-[9px] font-medium text-slate-600"
                      >
                        {s.skillName} (L{s.proficiencyLevel})
                      </span>
                    ))}
                  </div>

                  {/* Notes Preview / Inline Edit */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs">
                    {isEditingNote ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          className="w-full rounded border border-slate-300 bg-white p-1.5 text-[11px] text-slate-900 focus:outline-none"
                          rows={2}
                          placeholder="Add recruiter feedback or notes..."
                        />
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNoteId(null)}
                            className="h-6 px-2 text-[10px]"
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
                        className="cursor-pointer group/note rounded p-0.5 hover:bg-slate-100/70 transition-colors"
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
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
                    {/* Shift Left */}
                    <button
                      onClick={() => handleShiftStage(placement.id, placement.stage, -1)}
                      disabled={stageInfo.key === "Matched" || isPending}
                      title="Move to previous stage"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
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
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-800 focus:outline-none cursor-pointer"
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
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(placement.id)}
                      disabled={isPending}
                      title="Remove candidate from pipeline"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Banner & Fast Actions */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm">
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
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Min Experience: {project.minExperienceYears}+ years
              </span>
              <span>•</span>
              <span className="font-medium">Budget: {project.budget || "Competitive"}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
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
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total in ATS</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{placements.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Placed / Staffed</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{placedCount}</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3">
            <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">In Evaluation</p>
            <p className="text-xl font-bold text-purple-700 mt-1">{inInterviewCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">In Upskilling</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{inUpskillingCount}</p>
          </div>
        </div>
      </div>

      {/* Search Candidates in Board */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidates in this pipeline..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-slate-300"
          />
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Use the arrows or stage selector to advance candidates through stages.
        </p>
      </div>

      {/* Mobile Kanban View: Single-stage view with smooth tab switcher */}
      <div className="block md:hidden space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STAGES.map((s) => {
            const count = (placementsByStage[s.key] || []).length;
            const isActive = mobileActiveStage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setMobileActiveStage(s.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-2xs font-bold"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {(() => {
          const activeStageInfo =
            STAGES.find((s) => s.key === mobileActiveStage) || STAGES[0];
          return renderStageColumn(activeStageInfo, true);
        })()}
      </div>

      {/* Desktop Kanban View: 5-column Kanban Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {STAGES.map((stageInfo) => renderStageColumn(stageInfo, false))}
      </div>

      {/* Add Candidate Modal via Shadcn Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Add Candidate to ATS Pipeline
            </DialogTitle>
            <DialogDescription>
              Select a talent profile to track in this project&apos;s staffing pipeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCandidateSubmit} className="space-y-4 my-2">
            {/* Candidate Search & Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Talent Profile:
              </label>
              <Input
                placeholder="Filter candidate by name or skill..."
                value={candidateModalSearch}
                onChange={(e) => setCandidateModalSearch(e.target.value)}
                className="bg-white border-slate-300 text-xs h-9 text-slate-900 mb-2"
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
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
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
                className="bg-white border-slate-300 text-xs h-9 text-slate-900"
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { CourseItem } from "@/lib/actions/courses";
import { addCandidateToPipeline } from "@/lib/actions/pipeline";
import { getAISemanticMatch } from "@/lib/actions/ai-matching";
import { AIMatchAnalysis } from "@/lib/engine/ai-matcher";
import { AISemanticBreakdown } from "./ai-semantic-breakdown";
import {
  calculateMatchAnalysis,
  simulateUpskillingMatch,
  DEFAULT_WEIGHTS,
} from "@/lib/engine/matcher";
import { MatchWeights } from "@/lib/engine/types";
import { MatchScoreGauge } from "./match-score-gauge";
import { SkillGapList } from "./skill-gap-list";
import { SkillRadarChart } from "./skill-radar-chart";
import { PhasedLearningRoadmap } from "./phased-learning-roadmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
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
  User,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  Calendar,
  Building2,
  Target,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Zap,
  Loader2,
  Bot,
  RefreshCw,
} from "lucide-react";

interface InteractiveMatchStudioProps {
  projects: ProjectWithDetails[];
  employers: EmployerWithDetails[];
  courses: CourseItem[];
  initialProjectId?: string;
  initialEmployerId?: string;
}

export function InteractiveMatchStudio({
  projects,
  employers,
  courses,
  initialProjectId,
  initialEmployerId,
}: InteractiveMatchStudioProps) {
  // Selection states
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ""
  );
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>(
    initialEmployerId || employers[0]?.id || ""
  );

  // Dynamic weight settings
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [weights, setWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);

  // Dual-Mode Matching: "standard" (deterministic math) vs "ai" (Ollama / Llama 3.1 semantic)
  const [matchingMode, setMatchingMode] = useState<"standard" | "ai">("standard");
  const [aiCache, setAiCache] = useState<Record<string, AIMatchAnalysis>>({});
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Phase 1: Upskilling Simulation State
  const [simulatedCourseIds, setSimulatedCourseIds] = useState<string[]>([]);
  const [pipelineAdded, setPipelineAdded] = useState(false);
  const [isAddingPipeline, setIsAddingPipeline] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>("analysis");

  const currentCacheKey = `${selectedProjectId}:${selectedEmployerId}`;
  const currentAiAnalysis = aiCache[currentCacheKey] || null;

  // Trigger AI analysis for a project + candidate pair
  const triggerAIAnalysis = async (projectId: string, employerId: string) => {
    const key = `${projectId}:${employerId}`;
    if (aiCache[key]) return; // already in cache

    setIsLoadingAI(true);
    setAiError(null);
    try {
      const res = await getAISemanticMatch(projectId, employerId, weights);
      if (res.success && res.data) {
        setAiCache((prev) => ({ ...prev, [key]: res.data! }));
      } else {
        setAiError(res.error || "Failed to reach AI matching service.");
      }
    } catch (err: any) {
      setAiError(err?.message || "Unexpected error connecting to AI engine.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectMatchingMode = (mode: "standard" | "ai") => {
    setMatchingMode(mode);
    if (mode === "ai") {
      setActiveTab("ai_semantic");
      if (!currentAiAnalysis && !isLoadingAI) {
        triggerAIAnalysis(selectedProjectId, selectedEmployerId);
      }
    } else {
      if (activeTab === "ai_semantic") {
        setActiveTab("analysis");
      }
    }
  };

  // Reset simulation when project or candidate selection changes
  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    setSimulatedCourseIds([]);
    setPipelineAdded(false);
    if (matchingMode === "ai" && !aiCache[`${id}:${selectedEmployerId}`]) {
      triggerAIAnalysis(id, selectedEmployerId);
    }
  };

  const handleEmployerChange = (id: string) => {
    setSelectedEmployerId(id);
    setSimulatedCourseIds([]);
    setPipelineAdded(false);
    if (matchingMode === "ai" && !aiCache[`${selectedProjectId}:${id}`]) {
      triggerAIAnalysis(selectedProjectId, id);
    }
  };

  // Lookup selected entities
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const selectedEmployer = useMemo(
    () => employers.find((e) => e.id === selectedEmployerId),
    [employers, selectedEmployerId]
  );

  // Match Analysis calculation
  const matchResult = useMemo(() => {
    if (!selectedProject || !selectedEmployer) return null;

    const projectInput = {
      id: selectedProject.id,
      title: selectedProject.title,
      minExperienceYears: selectedProject.minExperienceYears,
      skills: selectedProject.skills.map((s) => ({
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    };

    const employerInput = {
      id: selectedEmployer.id,
      name: selectedEmployer.name,
      yearsOfExperience: selectedEmployer.yearsOfExperience,
      skills: selectedEmployer.skills.map((s) => ({
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel,
        yearsExperience: s.yearsExperience,
      })),
    };

    const courseInputs = courses.map((c) => ({
      id: c.id,
      title: c.title,
      provider: c.provider,
      url: c.url,
      skillTag: c.skillTag,
      difficulty: c.difficulty,
      duration: c.duration,
      rating: c.rating,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
    }));

    return calculateMatchAnalysis(projectInput, employerInput, courseInputs, weights);
  }, [selectedProject, selectedEmployer, courses, weights]);

  // Phase 1 Upskilling Simulation calculation
  const simulationResult = useMemo(() => {
    if (!selectedProject || !selectedEmployer) return null;

    const projectInput = {
      id: selectedProject.id,
      title: selectedProject.title,
      minExperienceYears: selectedProject.minExperienceYears,
      skills: selectedProject.skills.map((s) => ({
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    };

    const employerInput = {
      id: selectedEmployer.id,
      name: selectedEmployer.name,
      yearsOfExperience: selectedEmployer.yearsOfExperience,
      skills: selectedEmployer.skills.map((s) => ({
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel,
        yearsExperience: s.yearsExperience,
      })),
    };

    const courseInputs = courses.map((c) => ({
      id: c.id,
      title: c.title,
      provider: c.provider,
      url: c.url,
      skillTag: c.skillTag,
      difficulty: c.difficulty,
      duration: c.duration,
      rating: c.rating,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
    }));

    return simulateUpskillingMatch(
      projectInput,
      employerInput,
      courseInputs,
      simulatedCourseIds,
      weights
    );
  }, [selectedProject, selectedEmployer, courses, simulatedCourseIds, weights]);

  // Toggle simulation course checkbox
  const handleToggleCourse = (courseId: string) => {
    setSimulatedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Simulate all recommended courses
  const handleSimulateAll = () => {
    if (!matchResult) return;
    const allIds = matchResult.recommendedCourses.map((c) => c.id);
    setSimulatedCourseIds(allIds);
  };

  // Clear simulation
  const handleClearSimulation = () => {
    setSimulatedCourseIds([]);
  };

  // Extract map of simulated skill levels for Radar Chart
  const simulatedSkillLevelsMap = useMemo(() => {
    if (!simulationResult) return {};
    const map: Record<string, number> = {};
    for (const s of simulationResult.simulatedSkills) {
      map[s.skillName] = s.newProficiency;
    }
    return map;
  }, [simulationResult]);

  if (projects.length === 0 || employers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
        <p className="text-lg font-bold text-slate-800">No projects or talent profiles available yet.</p>
        <p className="text-sm text-slate-500 mt-2">
          Run seed or add records to start matching.
        </p>
      </div>
    );
  }

  const isSimulating = simulatedCourseIds.length > 0 && simulationResult !== null;
  const currentOverallScore = isSimulating
    ? simulationResult.projectedAnalysis.overallScore
    : matchResult?.overallScore || 0;

  // Effective score reflecting AI mode when selected
  const effectiveScore = matchingMode === "ai" && currentAiAnalysis
    ? currentAiAnalysis.semanticScore
    : currentOverallScore;

  // Plain-English Verdict Generator
  const plainEnglishVerdict = useMemo(() => {
    if (!matchResult) return null;

    if (matchingMode === "ai" && currentAiAnalysis) {
      const score = currentAiAnalysis.semanticScore;
      return {
        tier: score >= 75 ? "exceptional" : score >= 55 ? "strong" : "moderate",
        badge: `🤖 AI Fit (${score}%)`,
        badgeVariant: (score >= 75 ? "success" : score >= 55 ? "warning" : "destructive") as any,
        headline: "AI Semantic Assessment (Llama 3.1)",
        summary: currentAiAnalysis.executiveSummary,
        actionHint: `Onboarding velocity: ${currentAiAnalysis.onboardingVelocity}. ${currentAiAnalysis.scoreDelta !== 0 ? `(${currentAiAnalysis.scoreDelta > 0 ? `+${currentAiAnalysis.scoreDelta}%` : `${currentAiAnalysis.scoreDelta}%`} vs keyword baseline)` : ""}`,
      };
    }

    const score = currentOverallScore;
    if (score >= 85) {
      return {
        tier: "exceptional",
        badge: "🟢 Ready for Immediate Placement",
        badgeVariant: "success" as const,
        headline: "Exceptional Match — Zero Friction Onboarding",
        summary: `${selectedEmployer?.name} satisfies ${matchResult.requiredMatchedCount} of ${matchResult.requiredTotalCount} core technical requirements and comfortably satisfies experience expectations for ${selectedProject?.companyName}.`,
        actionHint: "Ideal candidate to advance directly into final interviews or project placement.",
      };
    } else if (score >= 70) {
      return {
        tier: "strong",
        badge: "🟡 Strong Fit — Quick Bridge Training",
        badgeVariant: "warning" as const,
        headline: "High Potential with Minor Bridge Training Needed",
        summary: `${selectedEmployer?.name} meets core fundamentals (${matchResult.requiredMatchedCount}/${matchResult.requiredTotalCount} required skills). Completing 1 or 2 targeted bridge courses will make them fully project-ready.`,
        actionHint: "Simulate closing gaps below to see projected score jump.",
      };
    } else {
      return {
        tier: "moderate",
        badge: "🔴 Significant Skill Gaps",
        badgeVariant: "destructive" as const,
        headline: "Requires Substantial Upskilling or Senior Pairing",
        summary: `${selectedEmployer?.name} is missing key competencies required by ${selectedProject?.title}. They could succeed if paired with a complementary engineer in Squad Builder.`,
        actionHint: "Explore Squad Builder to combine them with a complementary teammate.",
      };
    }
  }, [matchResult, currentOverallScore, matchingMode, currentAiAnalysis, selectedEmployer, selectedProject]);

  return (
    <div className="space-y-8">
      {/* Control Panel: Dual-Engine Switcher, Project & Employer Pickers */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
        {/* Dual-Mode Matching Switcher Header */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-purple-50/40 p-4 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Matching Engine Architecture
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold bg-white text-indigo-700 border-indigo-200">
                Active: {matchingMode === "standard" ? "Deterministic Formula" : "Self-Hosted Llama 3.1"}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {matchingMode === "standard"
                ? "Standard Mode: Instant mathematical matching using alias dictionaries and weighted formula ratios."
                : "AI Semantic Mode: Evaluates conceptual skill transferability, cross-framework analogies, and domain fit using your self-hosted Llama 3.1."}
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 shadow-inner self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleSelectMatchingMode("standard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                matchingMode === "standard"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>⚡ Standard Match</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectMatchingMode("ai")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                matchingMode === "ai"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isLoadingAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              )}
              <span>🤖 AI Semantic Match</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Project Selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                Target Project
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {projects.length} available
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.companyName}) — {p.category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Central Exchange Icon */}
          <div className="hidden lg:flex items-center justify-center pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {/* Employer / Talent Selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                <User className="h-4 w-4 text-purple-600" />
                Talent Candidate
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {employers.length} on bench
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedEmployerId}
                onChange={(e) => handleEmployerChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                {employers.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.roleTitle} ({emp.yearsOfExperience} yrs exp)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Algorithm Weights Toggle */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Scoring Criteria:</span>
            <span className="font-mono text-slate-500 text-[11px]">
              Must-Have Skills: {Math.round(weights.requiredSkillsWeight * 100)}% • Preferred:{" "}
              {Math.round(weights.preferredSkillsWeight * 100)}% • Experience:{" "}
              {Math.round(weights.experienceWeight * 100)}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-slate-500" />
            {showWeightSliders ? "Hide Criteria Sliders" : "Customize Criteria"}
          </Button>
        </div>

        {/* Sliders Accordion */}
        {showWeightSliders && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs animate-in fade-in-50 duration-150">
            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Must-Have Skills</span>
                <span className="font-mono font-bold text-indigo-700">
                  {Math.round(weights.requiredSkillsWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={weights.requiredSkillsWeight}
                onChange={(e) =>
                  setWeights((w) => ({
                    ...w,
                    requiredSkillsWeight: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Preferred Bonus Skills</span>
                <span className="font-mono font-bold text-purple-700">
                  {Math.round(weights.preferredSkillsWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.preferredSkillsWeight}
                onChange={(e) =>
                  setWeights((w) => ({
                    ...w,
                    preferredSkillsWeight: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1">
                <span>Experience Threshold</span>
                <span className="font-mono font-bold text-sky-700">
                  {Math.round(weights.experienceWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.experienceWeight}
                onChange={(e) =>
                  setWeights((w) => ({
                    ...w,
                    experienceWeight: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Display */}
      {selectedProject && selectedEmployer && matchResult && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Match Gauge & Entity Cards (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Visual Circular Gauge with Simulation Overlay */}
            <MatchScoreGauge
              overallScore={effectiveScore}
              requiredSkillsScore={
                isSimulating
                  ? simulationResult.projectedAnalysis.requiredSkillsScore
                  : matchResult.requiredSkillsScore
              }
              preferredSkillsScore={
                isSimulating
                  ? simulationResult.projectedAnalysis.preferredSkillsScore
                  : matchResult.preferredSkillsScore
              }
              experienceScore={matchResult.experienceScore}
              requiredMatchedCount={
                isSimulating
                  ? simulationResult.projectedAnalysis.requiredMatchedCount
                  : matchResult.requiredMatchedCount
              }
              requiredTotalCount={matchResult.requiredTotalCount}
              projectedScore={
                matchingMode === "ai" && currentAiAnalysis
                  ? currentAiAnalysis.semanticScore
                  : isSimulating
                  ? simulationResult.projectedAnalysis.overallScore
                  : undefined
              }
              scoreDelta={
                matchingMode === "ai" && currentAiAnalysis
                  ? currentAiAnalysis.scoreDelta
                  : isSimulating
                  ? simulationResult.scoreDelta
                  : 0
              }
              simulatedSkillsCount={simulatedCourseIds.length}
            />

            {/* Plain-English Verdict Box */}
            {plainEnglishVerdict && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Plain-English Assessment
                  </span>
                  <Badge variant={plainEnglishVerdict.badgeVariant} className="text-xs">
                    {plainEnglishVerdict.badge}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {plainEnglishVerdict.headline}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {plainEnglishVerdict.summary}
                </p>

                {/* 1-Click Upskilling Shortcut button if gaps exist */}
                {matchResult.recommendedCourses.length > 0 && (
                  <div className="pt-2">
                    {isSimulating ? (
                      <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 text-xs text-sky-900">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-sky-600" />
                          Simulating {simulatedCourseIds.length} bridge courses (+{simulationResult?.scoreDelta}%)
                        </span>
                        <button
                          onClick={handleClearSimulation}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulateAll}
                        className="w-full text-xs text-indigo-700 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                        1-Click: Simulate Closing All Skill Gaps
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Candidate Profile Overview Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <Avatar size="lg">
                  <AvatarImage
                    src={selectedEmployer.avatarUrl || ""}
                    alt={selectedEmployer.name}
                  />
                  <AvatarFallback>
                    {selectedEmployer.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedEmployer.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600">
                    {selectedEmployer.roleTitle}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {selectedEmployer.yearsOfExperience} yrs exp
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {selectedEmployer.location || "Remote"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEmployer.bio && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {selectedEmployer.bio}
                </p>
              )}

              {/* Skills pills */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Verified Skills ({selectedEmployer.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployer.skills.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-700 font-medium"
                    >
                      {s.skillName} (L{s.proficiencyLevel})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Project Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <Building2 className="h-4 w-4" />
                {selectedProject.companyName}
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedProject.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Category: {selectedProject.category} • Required Exp:{" "}
                {selectedProject.minExperienceYears}+ yrs
              </p>
              {selectedProject.budget && (
                <Badge variant="outline" className="mt-2.5 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50">
                  {selectedProject.budget}
                </Badge>
              )}
            </div>

            {/* Staffing Pipeline (ATS) Action */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-purple-600" />
                  Staffing Pipeline (ATS)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Track {selectedEmployer.name} for this project.
                </p>
              </div>

              {pipelineAdded ? (
                <Link href={`/projects/${selectedProject.id}/pipeline`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto text-xs text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    View in Pipeline
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={isAddingPipeline}
                  onClick={async () => {
                    if (!selectedProject || !selectedEmployer) return;
                    setIsAddingPipeline(true);
                    await addCandidateToPipeline(
                      selectedProject.id,
                      selectedEmployer.id,
                      "Shortlisted",
                      `Added from Match Studio (${matchResult.overallScore}% score)`
                    );
                    setPipelineAdded(true);
                    setIsAddingPipeline(false);
                    setShowPipelineModal(true);
                  }}
                  className="w-full sm:w-auto text-xs shadow-sm"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  {isAddingPipeline ? "Adding..." : "Add to Pipeline"}
                </Button>
              )}
            </div>

            {/* Executive Placement Dossier Action */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  Executive Placement Dossier
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Printer-ready evaluation memo for hiring directors.
                </p>
              </div>

              <Link
                href={`/dossier?projectId=${selectedProject.id}&employerId=${selectedEmployer.id}`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  View Dossier
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Tabbed View (7 cols) using Shadcn Tabs */}
          <div className="space-y-6 lg:col-span-7">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${matchingMode === "ai" ? "grid-cols-4" : "grid-cols-3"}`}>
                {matchingMode === "ai" && (
                  <TabsTrigger
                    value="ai_semantic"
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">AI Insights</span>
                    <span className="sm:hidden">AI</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="analysis">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Skill Breakdown</span>
                  <span className="sm:hidden">Skills</span>
                </TabsTrigger>
                <TabsTrigger value="roadmap">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    Upskilling Hub ({matchResult.recommendedCourses.length})
                  </span>
                  <span className="sm:hidden">
                    Courses ({matchResult.recommendedCourses.length})
                  </span>
                  {isSimulating && (
                    <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-800 border border-sky-200">
                      +{simulationResult.scoreDelta}%
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="radar">
                  <Target className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Skill Radar</span>
                  <span className="sm:hidden">Radar</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 0: AI Semantic Breakdown (when AI mode active) */}
              {matchingMode === "ai" && (
                <TabsContent value="ai_semantic" className="space-y-6">
                  {isLoadingAI ? (
                    <div className="rounded-2xl border border-indigo-200 bg-white p-12 text-center shadow-sm space-y-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs animate-pulse">
                        <Bot className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          Evaluating Semantic Transferability...
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Connecting to your self-hosted Llama 3.1 model to analyze conceptual skill overlap, adjacent frameworks, and domain competence.
                        </p>
                      </div>
                    </div>
                  ) : aiError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-rose-900">AI Evaluation Unavailable</h4>
                        <p className="text-xs text-rose-700 mt-1">{aiError}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerAIAnalysis(selectedProjectId, selectedEmployerId)}
                        className="text-xs bg-white text-rose-800 border-rose-300 hover:bg-rose-100"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Retry AI Evaluation
                      </Button>
                    </div>
                  ) : currentAiAnalysis ? (
                    <AISemanticBreakdown analysis={currentAiAnalysis} />
                  ) : null}
                </TabsContent>
              )}

              {/* Tab 1: Detailed Skill Breakdown */}
              <TabsContent value="analysis" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Skill Compatibility Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparing project requirements against profile capabilities.
                    </p>
                  </div>

                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setActiveTab("roadmap")}
                    className="text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Simulate Upskilling
                  </Button>
                </div>

                <SkillGapList
                  allSkillBreakdown={matchResult.allSkillBreakdown}
                  matchedSkills={matchResult.matchedSkills}
                  underProficientSkills={matchResult.underProficientSkills}
                  missingSkills={matchResult.missingSkills}
                />
              </TabsContent>

              {/* Tab 2: Phased Learning Roadmap & Upskilling Simulator */}
              <TabsContent value="roadmap" className="space-y-6">
                <PhasedLearningRoadmap
                  courses={matchResult.recommendedCourses}
                  simulatedCourseIds={simulatedCourseIds}
                  onToggleCourse={handleToggleCourse}
                  onSimulateAll={handleSimulateAll}
                  onClearSimulation={handleClearSimulation}
                  baselineScore={matchResult.overallScore}
                  projectedScore={
                    simulationResult?.projectedAnalysis.overallScore ||
                    matchResult.overallScore
                  }
                  scoreDelta={simulationResult?.scoreDelta || 0}
                  totalSimulatedHours={simulationResult?.totalSimulatedHours || 0}
                  employerId={selectedEmployer.id}
                />
              </TabsContent>

              {/* Tab 3: Interactive Skill Radar Chart */}
              <TabsContent value="radar" className="space-y-6">
                <SkillRadarChart
                  skills={matchResult.allSkillBreakdown}
                  candidateName={selectedEmployer.name}
                  projectName={selectedProject.title}
                  simulatedSkillLevels={simulatedSkillLevelsMap}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Confirmation Modal when added to ATS Pipeline */}
      <Dialog open={showPipelineModal} onOpenChange={setShowPipelineModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <DialogTitle>Candidate Shortlisted!</DialogTitle>
            </div>
            <DialogDescription>
              <strong>{selectedEmployer?.name}</strong> has been added to the ATS Hiring Pipeline for <strong>{selectedProject?.title}</strong> at stage <em>Shortlisted</em>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5 my-2">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Compatibility Score:</span>
              <span className="font-bold text-slate-900">{matchResult?.overallScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Project:</span>
              <span className="font-bold text-slate-900">{selectedProject?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Company:</span>
              <span className="font-bold text-slate-900">{selectedProject?.companyName}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPipelineModal(false)}
            >
              Continue Matching
            </Button>
            <Link href={`/projects/${selectedProject?.id}/pipeline`}>
              <Button variant="default" size="sm">
                Open Project Pipeline
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

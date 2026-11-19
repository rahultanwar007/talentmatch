"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { CourseItem } from "@/lib/actions/courses";
import { addCandidateToPipeline } from "@/lib/actions/pipeline";
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

  // Phase 1: Upskilling Simulation State
  const [simulatedCourseIds, setSimulatedCourseIds] = useState<string[]>([]);
  const [pipelineAdded, setPipelineAdded] = useState(false);
  const [isAddingPipeline, setIsAddingPipeline] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"analysis" | "radar" | "roadmap">(
    "analysis"
  );

  // Reset simulation when project or candidate selection changes
  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    setSimulatedCourseIds([]);
    setPipelineAdded(false);
  };

  const handleEmployerChange = (id: string) => {
    setSelectedEmployerId(id);
    setSimulatedCourseIds([]);
    setPipelineAdded(false);
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
        <p className="text-lg font-bold text-slate-800">No projects or employer profiles available yet.</p>
        <p className="text-sm text-slate-500 mt-2">
          Run seed or add records to start matching.
        </p>
      </div>
    );
  }

  const isSimulating = simulatedCourseIds.length > 0 && simulationResult !== null;

  return (
    <div className="space-y-8">
      {/* Control Panel: Project & Employer Pickers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Project Selector */}
          <div className="flex-1 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Briefcase className="h-4 w-4" />
              Select Target Project
            </label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
              <ArrowRight className="h-5 w-5 text-indigo-600" />
            </div>
          </div>

          {/* Employer / Talent Selector */}
          <div className="flex-1 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
              <User className="h-4 w-4" />
              Select Candidate Profile
            </label>
            <div className="relative">
              <select
                value={selectedEmployerId}
                onChange={(e) => handleEmployerChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
            <span className="font-semibold text-slate-700">Algorithm Weights:</span>
            <span className="font-mono text-slate-500">
              Required: {Math.round(weights.requiredSkillsWeight * 100)}% | Preferred:{" "}
              {Math.round(weights.preferredSkillsWeight * 100)}% | Exp:{" "}
              {Math.round(weights.experienceWeight * 100)}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            {showWeightSliders ? "Hide Weight Controls" : "Adjust Weights"}
          </Button>
        </div>

        {/* Sliders Accordion */}
        {showWeightSliders && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
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
                <span>Experience Level</span>
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
              overallScore={matchResult.overallScore}
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
                isSimulating
                  ? simulationResult.projectedAnalysis.overallScore
                  : undefined
              }
              scoreDelta={isSimulating ? simulationResult.scoreDelta : 0}
              simulatedSkillsCount={simulatedCourseIds.length}
            />

            {/* Profile Overview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <img
                  src={
                    selectedEmployer.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={selectedEmployer.name}
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-slate-900">
                    {selectedEmployer.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600">
                    {selectedEmployer.roleTitle}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                  Verified Profile Skills ({selectedEmployer.skills.length})
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
                <Building2 className="h-4 w-4" />
                {selectedProject.companyName}
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedProject.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Domain: {selectedProject.category} • Required Exp:{" "}
                {selectedProject.minExperienceYears}+ yrs
              </p>
              {selectedProject.budget && (
                <Badge variant="outline" className="mt-2.5 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50">
                  {selectedProject.budget}
                </Badge>
              )}
            </div>

            {/* ATS Staffing Pipeline Quick Action */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    View in ATS Pipeline
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
                  }}
                  className="w-full sm:w-auto text-xs"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  {isAddingPipeline ? "Adding..." : "Add to Pipeline"}
                </Button>
              )}
            </div>

            {/* Executive Placement Dossier Action */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  Executive Placement Dossier
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Generate printer-ready evaluation memo for hiring directors.
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

          {/* Right Column: Three View Tabs (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* View Tabs Bar */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1.5 gap-1.5 shadow-2xs">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === "analysis"
                    ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Gaps ({matchResult.allSkillBreakdown.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("radar")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === "radar"
                    ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                <span>Skill Radar Chart</span>
              </button>

              <button
                onClick={() => setActiveTab("roadmap")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === "roadmap"
                    ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>
                  Upskilling Simulator ({matchResult.recommendedCourses.length})
                </span>
                {isSimulating && (
                  <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] font-bold text-sky-800 border border-sky-200">
                    +{simulationResult.scoreDelta}%
                  </span>
                )}
              </button>
            </div>

            {/* Tab 1: Detailed Skill Breakdown */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
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
              </div>
            )}

            {/* Tab 2: Interactive Skill Radar Chart */}
            {activeTab === "radar" && (
              <SkillRadarChart
                skills={matchResult.allSkillBreakdown}
                candidateName={selectedEmployer.name}
                projectName={selectedProject.title}
                simulatedSkillLevels={simulatedSkillLevelsMap}
              />
            )}

            {/* Tab 3: Phased Learning Roadmap & What-If Simulator */}
            {activeTab === "roadmap" && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

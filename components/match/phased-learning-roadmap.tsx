"use client";

import React, { useState, useTransition } from "react";
import { RecommendedCourse } from "@/lib/engine/types";
import { enrollInCourse } from "@/lib/actions/learning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  ExternalLink,
  Clock,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Play,
} from "lucide-react";

interface PhasedLearningRoadmapProps {
  courses: RecommendedCourse[];
  simulatedCourseIds: string[];
  onToggleCourse: (courseId: string) => void;
  onSimulateAll: () => void;
  onClearSimulation: () => void;
  baselineScore: number;
  projectedScore: number;
  scoreDelta: number;
  totalSimulatedHours: number;
  employerId?: string;
}

export function PhasedLearningRoadmap({
  courses,
  simulatedCourseIds,
  onToggleCourse,
  onSimulateAll,
  onClearSimulation,
  baselineScore,
  projectedScore,
  scoreDelta,
  totalSimulatedHours,
  employerId,
}: PhasedLearningRoadmapProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center shadow-xs">
        <Sparkles className="mx-auto h-8 w-8 text-emerald-600" />
        <h4 className="mt-2 text-base font-bold text-emerald-900">
          All Technical Requirements Satisfied!
        </h4>
        <p className="mt-1 text-xs text-emerald-700">
          This profile has met or exceeded all project requirements. No upskilling courses are needed.
        </p>
      </div>
    );
  }

  const phase1Courses = courses.filter((c) =>
    c.reason.toLowerCase().includes("essential") ||
    c.reason.toLowerCase().includes("missing mandatory")
  );

  const phase2Courses = courses.filter((c) =>
    c.reason.toLowerCase().includes("level up") ||
    c.reason.toLowerCase().includes("advance")
  );

  const phase3Courses = courses.filter(
    (c) => !phase1Courses.includes(c) && !phase2Courses.includes(c)
  );

  const allSimulated =
    courses.length > 0 && simulatedCourseIds.length === courses.length;

  return (
    <div className="space-y-6">
      {/* Simulation Control Summary Bar */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Interactive Upskilling Simulator
              </h4>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Check courses below to simulate completion and watch the projected match score jump in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={allSimulated ? onClearSimulation : onSimulateAll}
              className="text-xs border-sky-300 text-sky-800 bg-white hover:bg-sky-50"
            >
              {allSimulated ? (
                <>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Simulation
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Simulate All Courses
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Dynamic Metric Ticker */}
        {simulatedCourseIds.length > 0 && (
          <div className="mt-4 pt-3 border-t border-sky-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Selected:</span>
              <strong className="text-slate-900 font-mono">
                {simulatedCourseIds.length} of {courses.length} courses
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Baseline Fit:</span>
              <span className="font-mono text-slate-700">{baselineScore}%</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Projected Fit:</span>
              <strong className="font-mono text-sky-700 text-sm">
                {projectedScore}% (+{scoreDelta}%)
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Est. Study Hours:</span>
              <span className="font-mono text-indigo-700 font-semibold">
                ~{totalSimulatedHours} hours
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Essential Missing Prerequisites */}
      {phase1Courses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-mono font-bold text-rose-800 border border-rose-200">
                1
              </span>
              <h4 className="text-sm font-bold text-rose-900">
                Phase 1: Critical Missing Prerequisites
              </h4>
            </div>
            <span className="text-xs text-rose-700 font-medium">
              Estimated: Weeks 1–2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phase1Courses.map((c) => (
              <RoadmapCourseCard
                key={c.id}
                course={c}
                isSimulated={simulatedCourseIds.includes(c.id)}
                onToggle={() => onToggleCourse(c.id)}
                employerId={employerId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 2: Depth & Competency Level-Ups */}
      {phase2Courses.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-mono font-bold text-amber-800 border border-amber-200">
                2
              </span>
              <h4 className="text-sm font-bold text-amber-900">
                Phase 2: Competency & Proficiency Elevation
              </h4>
            </div>
            <span className="text-xs text-amber-700 font-medium">
              Estimated: Weeks 3–4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phase2Courses.map((c) => (
              <RoadmapCourseCard
                key={c.id}
                course={c}
                isSimulated={simulatedCourseIds.includes(c.id)}
                onToggle={() => onToggleCourse(c.id)}
                employerId={employerId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 3: Bonus Qualifications & Preferred Skills */}
      {phase3Courses.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-purple-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-mono font-bold text-purple-800 border border-purple-200">
                3
              </span>
              <h4 className="text-sm font-bold text-purple-900">
                Phase 3: Bonus & Preferred Specializations
              </h4>
            </div>
            <span className="text-xs text-purple-700 font-medium">
              Estimated: Weeks 5+
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phase3Courses.map((c) => (
              <RoadmapCourseCard
                key={c.id}
                course={c}
                isSimulated={simulatedCourseIds.includes(c.id)}
                onToggle={() => onToggleCourse(c.id)}
                employerId={employerId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapCourseCard({
  course,
  isSimulated,
  onToggle,
  employerId,
}: {
  course: RecommendedCourse;
  isSimulated: boolean;
  onToggle: () => void;
  employerId?: string;
}) {
  const [enrolled, setEnrolled] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!employerId) return;
    startTransition(async () => {
      const res = await enrollInCourse(employerId, course.id);
      if (res.success) {
        setEnrolled(true);
      }
    });
  };

  return (
    <div
      onClick={onToggle}
      className={`group cursor-pointer relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all shadow-2xs ${
        isSimulated
          ? "border-sky-400 bg-sky-50/60 shadow-sky-100 ring-1 ring-sky-300"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
      }`}
    >
      <div>
        {/* Header & Checkbox */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSimulated}
              onChange={onToggle}
              className="h-4 w-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <Badge
              variant="default"
              className="font-mono text-[10px]"
            >
              {course.skillTag}
            </Badge>
          </div>

          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
            {course.provider}
          </span>
        </div>

        {/* Reason pill */}
        <p className="mt-2 text-[11px] text-slate-500 line-clamp-1">
          {course.reason}
        </p>

        {/* Title */}
        <h5 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {course.title}
        </h5>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-medium">
              <Clock className="h-3 w-3" />
              {course.duration}
            </span>
            {course.rating && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {course.rating}
              </span>
            )}
          </div>

          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <span>View</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        {/* Direct candidate enrollment trigger */}
        {employerId && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500">Live Enrollment:</span>
            {enrolled ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Enrolled
              </span>
            ) : (
              <button
                type="button"
                onClick={handleEnrollClick}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Play className="h-2.5 w-2.5" />
                {isPending ? "Enrolling..." : "Enroll Candidate"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import {
  CandidateCourseEnrollment,
  completeCourseAndPromoteSkill,
  enrollInCourse,
} from "@/lib/actions/learning";
import { CourseItem } from "@/lib/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  ExternalLink,
  Clock,
  Star,
  CheckCircle2,
  TrendingUp,
  Award,
  Play,
  Layers,
  BookOpen,
} from "lucide-react";

interface CandidateLearningDashboardProps {
  employerId: string;
  employerName: string;
  initialEnrollments: CandidateCourseEnrollment[];
  availableCourses: CourseItem[];
  missingSkillTags: string[];
}

export function CandidateLearningDashboard({
  employerId,
  employerName,
  initialEnrollments,
  availableCourses,
  missingSkillTags,
}: CandidateLearningDashboardProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [isPending, startTransition] = useTransition();
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(
    null
  );

  const completedCount = enrollments.filter(
    (e) => e.status === "Completed"
  ).length;
  const inProgressCount = enrollments.filter(
    (e) => e.status === "In Progress"
  ).length;

  const handleComplete = (courseId: string) => {
    startTransition(async () => {
      const res = await completeCourseAndPromoteSkill(employerId, courseId);
      if (res.success) {
        setEnrollments((prev) =>
          prev.map((e) =>
            e.courseId === courseId
              ? { ...e, status: "Completed", completedAt: new Date() }
              : e
          )
        );

        setCelebrationMessage(
          `🎉 Skill Promoted! ${res.skillName} upgraded from Level ${res.oldProficiency} to Level ${res.newProficiency}. All project match scores have been recalculated!`
        );

        setTimeout(() => setCelebrationMessage(null), 8000);
      }
    });
  };

  const handleEnroll = (courseId: string) => {
    startTransition(async () => {
      const res = await enrollInCourse(employerId, courseId);
      if (res.success) {
        window.location.reload();
      }
    });
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const suggestedCourses = availableCourses.filter(
    (c) =>
      !enrolledCourseIds.has(c.id) &&
      missingSkillTags.some(
        (tag) => tag.toLowerCase() === c.skillTag.toLowerCase()
      )
  );

  return (
    <div className="space-y-6">
      {/* Celebration Alert Banner */}
      {celebrationMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{celebrationMessage}</span>
          </div>
          <button
            onClick={() => setCelebrationMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>In Progress</span>
            <Play className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active enrollments</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed Courses</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {completedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Verified completions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Skill Level-Ups</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600">
            +{completedCount} Levels
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Auto-promoted competencies
          </p>
        </div>
      </div>

      {/* Active Enrollments Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Active Learning Enrollments ({enrollments.length})
            </h3>
            <p className="text-xs text-slate-500">
              When a course is completed, {employerName}&apos;s verified skill level automatically increases.
            </p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-xs text-slate-500">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            No active course enrollments yet. Browse suggested upskilling courses below to begin!
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-slate-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="font-mono text-[10px]"
                    >
                      {item.course.skillTag}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.course.provider}
                    </span>
                    <Badge
                      variant={
                        item.status === "Completed" ? "success" : "warning"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <h4 className="font-semibold text-slate-900 text-sm">
                    {item.course.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {item.course.duration}
                    </span>
                    <span>•</span>
                    <span>Difficulty: {item.course.difficulty}</span>
                    {item.completedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Completed on{" "}
                          {new Date(item.completedAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href={item.course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <span>Course Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {item.status !== "Completed" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleComplete(item.courseId)}
                      disabled={isPending}
                      className="text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Mark Completed & Promote Skill
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Upskilling Courses based on profile gaps */}
      {suggestedCourses.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Recommended Upskilling Courses for {employerName}
            </h3>
            <p className="text-xs text-slate-500">
              Courses targeted to bridge identified skill gaps across active company requisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestedCourses.slice(0, 4).map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="text-[10px] font-mono">
                      {course.skillTag}
                    </Badge>
                    <span className="text-[11px] text-slate-500">
                      {course.provider}
                    </span>
                  </div>
                  <h5 className="mt-2 font-semibold text-slate-900 line-clamp-2">
                    {course.title}
                  </h5>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {course.duration} • {course.difficulty}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnroll(course.id)}
                    disabled={isPending}
                    className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <Play className="h-3 w-3 mr-1 text-sky-600" />
                    Enroll
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { RecommendedCourse } from "@/lib/engine/types";
import { enrollInCourse } from "@/lib/actions/learning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Clock, Sparkles, CheckCircle2, Play } from "lucide-react";

interface CourseRecommendationCardProps {
  course: RecommendedCourse;
  employerId?: string;
}

export function CourseRecommendationCard({
  course,
  employerId,
}: CourseRecommendationCardProps) {
  const isEssential = course.reason.toLowerCase().includes("essential") || course.reason.toLowerCase().includes("missing");
  const [enrolled, setEnrolled] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    if (!employerId) return;
    startTransition(async () => {
      const res = await enrollInCourse(employerId, course.id);
      if (res.success) {
        setEnrolled(true);
      }
    });
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Header: Skill Tag & Provider Badge */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="default"
            className="font-mono text-[11px]"
          >
            {course.skillTag}
          </Badge>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {course.provider}
          </span>
        </div>

        {/* Reason Pill */}
        <div className="mt-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
              isEssential
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{course.reason}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="mt-2.5 text-base font-bold leading-snug text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {course.title}
        </h4>

        {/* Description */}
        {course.description && (
          <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
            {course.description}
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 border-t border-slate-100 pt-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {course.duration}
            </span>
            {course.rating && (
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold">{course.rating}</span>
              </span>
            )}
            <span className="hidden sm:inline-block text-slate-400">
              • {course.difficulty}
            </span>
          </div>

          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-all hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
          >
            <span>Learn</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {employerId && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            {enrolled ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Enrolled for this candidate
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnroll}
                disabled={isPending}
                className="text-xs h-7.5 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <Play className="h-3 w-3 mr-1" />
                {isPending ? "Enrolling..." : "Enroll Candidate"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

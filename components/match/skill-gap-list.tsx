import React from "react";
import { SkillMatchResult } from "@/lib/engine/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface SkillGapListProps {
  allSkillBreakdown: SkillMatchResult[];
  matchedSkills: SkillMatchResult[];
  underProficientSkills: SkillMatchResult[];
  missingSkills: SkillMatchResult[];
}

export function SkillGapList({
  matchedSkills,
  underProficientSkills,
  missingSkills,
}: SkillGapListProps) {
  const getProficiencyLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      default:
        return "None";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Fully Matched Skills */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800">
              Matched Skills ({matchedSkills.length})
            </h4>
          </div>
          <span className="text-xs font-semibold text-emerald-700">Proficiency Met</span>
        </div>

        {matchedSkills.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No exact skill matches met yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {matchedSkills.map((skill) => (
              <div
                key={skill.skillName}
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {skill.skillName}
                  </span>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>
                      Profile: Level {skill.candidateProficiency} (
                      {getProficiencyLabel(skill.candidateProficiency)})
                    </span>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  {skill.isRequired ? "Required" : "Bonus"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Under-Proficient Skills (Need Level Up) */}
      {underProficientSkills.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-800">
                Skills Needing Upskilling ({underProficientSkills.length})
              </h4>
            </div>
            <span className="text-xs font-semibold text-amber-700">Partial Fit</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {underProficientSkills.map((skill) => (
              <div
                key={skill.skillName}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {skill.skillName}
                  </span>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Current: Level {skill.candidateProficiency} → Target: Level{" "}
                    {skill.requiredProficiency}
                  </div>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  Gap: +{skill.requiredProficiency - skill.candidateProficiency} lvl
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Missing Skills (Critical Gaps) */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-rose-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-800">
              Missing Skills ({missingSkills.length})
            </h4>
          </div>
          <span className="text-xs font-semibold text-rose-700">Action Required</span>
        </div>

        {missingSkills.length === 0 ? (
          <p className="text-xs text-emerald-700 font-semibold">
            Awesome! Zero missing skills for this project.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {missingSkills.map((skill) => (
              <div
                key={skill.skillName}
                className="flex items-center justify-between rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {skill.skillName}
                  </span>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Requires Level {skill.requiredProficiency} (
                    {getProficiencyLabel(skill.requiredProficiency)})
                  </div>
                </div>
                <Badge
                  variant={skill.isRequired ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {skill.isRequired ? "Mandatory" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

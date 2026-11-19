import React from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Award, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface MatchScoreGaugeProps {
  overallScore: number;
  requiredSkillsScore: number;
  preferredSkillsScore: number;
  experienceScore: number;
  requiredMatchedCount: number;
  requiredTotalCount: number;
  // Phase 1 Upskilling Simulation props
  projectedScore?: number;
  scoreDelta?: number;
  simulatedSkillsCount?: number;
}

export function MatchScoreGauge({
  overallScore,
  requiredSkillsScore,
  preferredSkillsScore,
  experienceScore,
  requiredMatchedCount,
  requiredTotalCount,
  projectedScore,
  scoreDelta = 0,
  simulatedSkillsCount = 0,
}: MatchScoreGaugeProps) {
  const isSimulating = projectedScore !== undefined && projectedScore > overallScore;
  const displayScore = isSimulating ? projectedScore : overallScore;

  const isHigh = displayScore >= 75;
  const isMid = displayScore >= 50 && displayScore < 75;

  const strokeColor = isSimulating
    ? "#0284c7" // sky-600 for projected score
    : isHigh
    ? "#059669" // emerald-600
    : isMid
    ? "#d97706" // amber-600
    : "#e11d48"; // rose-600

  // SVG circular progress calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const baseOffset = circumference - (overallScore / 100) * circumference;
  const projectedOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Background glow when simulating */}
      {isSimulating && (
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-sky-100 blur-2xl pointer-events-none" />
      )}

      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center">
        <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="10"
            fill="transparent"
          />

          {/* If simulating: Show base circle in faint slate */}
          {isSimulating && (
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#cbd5e1"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={baseOffset}
              strokeLinecap="round"
              fill="transparent"
              className="opacity-70"
            />
          )}

          {/* Active / Projected score arc */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={projectedOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center px-4">
          {isSimulating ? (
            <>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight text-sky-600">
                  {displayScore}
                </span>
                <span className="text-lg font-bold text-sky-600">%</span>
              </div>
              <span className="mt-0.5 text-[11px] font-semibold text-slate-500">
                Baseline: {overallScore}%
              </span>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                <TrendingUp className="h-3 w-3" />
                +{scoreDelta}% Boost
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {overallScore}
                </span>
                <span className="text-lg font-semibold text-slate-500">%</span>
              </div>
              <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {isHigh ? "High Fit" : isMid ? "Moderate Fit" : "Skills Gap"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Simulator active alert banner */}
      {isSimulating ? (
        <div className="mt-4 flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800 animate-in fade-in">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
          <span>
            Simulating <strong>{simulatedSkillsCount}</strong> upskilling courses
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
          <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
          <span>
            Mandatory Skills:{" "}
            <strong className="text-slate-900">
              {requiredMatchedCount}/{requiredTotalCount}
            </strong>{" "}
            satisfied
          </span>
        </div>
      )}

      {/* Sub-Score Breakdown Bars */}
      <div className="mt-6 w-full space-y-4 border-t border-slate-100 pt-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Award className="h-3.5 w-3.5 text-indigo-600" />
              Must-Have Skills (70% weight)
            </span>
            <span className="font-mono font-bold text-slate-900">
              {requiredSkillsScore}%
            </span>
          </div>
          <Progress
            value={requiredSkillsScore}
            indicatorClassName={
              requiredSkillsScore >= 75
                ? "bg-emerald-500"
                : requiredSkillsScore >= 50
                ? "bg-amber-500"
                : "bg-rose-500"
            }
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Preferred Skills (15% weight)
            </span>
            <span className="font-mono font-bold text-slate-900">
              {preferredSkillsScore}%
            </span>
          </div>
          <Progress
            value={preferredSkillsScore}
            indicatorClassName="bg-purple-600"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
              Experience Level (15% weight)
            </span>
            <span className="font-mono font-bold text-slate-900">
              {experienceScore}%
            </span>
          </div>
          <Progress
            value={experienceScore}
            indicatorClassName="bg-sky-500"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { SkillMatchResult } from "@/lib/engine/types";
import { Badge } from "@/components/ui/badge";
import { Target, User, Sparkles, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface SkillRadarChartProps {
  skills: SkillMatchResult[];
  candidateName: string;
  projectName: string;
  simulatedSkillLevels?: Record<string, number>; // skillName -> new simulated level
}

export function SkillRadarChart({
  skills,
  candidateName,
  projectName,
  simulatedSkillLevels = {},
}: SkillRadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!skills || skills.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
        No skill requirements available to plot on radar chart.
      </div>
    );
  }

  // Ensure minimum 3 vertices for polygon geometry
  const radarSkills = skills.length >= 3 ? skills : [...skills, ...skills].slice(0, 3);
  const totalAxes = radarSkills.length;

  const size = 360;
  const center = size / 2;
  const radius = 120;
  const maxLevel = 4; // Levels 1 - 4

  // Helper to compute polar coordinates
  const getCoordinates = (index: number, level: number) => {
    const angle = (2 * Math.PI * index) / totalAxes - Math.PI / 2;
    const r = (level / maxLevel) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Helper to compute text anchor based on angle
  const getTextAnchor = (x: number) => {
    if (Math.abs(x - center) < 15) return "middle";
    return x > center ? "start" : "end";
  };

  // Generate web background polygons (Levels 1 to 4)
  const gridLevels = [1, 2, 3, 4];
  const gridPolygons = gridLevels.map((lvl) => {
    return radarSkills
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Project Target Requirement Polygon
  const projectPoints = radarSkills
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.requiredProficiency);
      return `${x},${y}`;
    })
    .join(" ");

  // Candidate Current Baseline Polygon
  const candidatePoints = radarSkills
    .map((s, i) => {
      const { x, y } = getCoordinates(i, s.candidateProficiency);
      return `${x},${y}`;
    })
    .join(" ");

  // Projected Polygon (when simulation active)
  const isSimulating = Object.keys(simulatedSkillLevels).length > 0;
  const projectedPoints = isSimulating
    ? radarSkills
        .map((s, i) => {
          const simLevel = simulatedSkillLevels[s.skillName] ?? s.candidateProficiency;
          const { x, y } = getCoordinates(i, simLevel);
          return `${x},${y}`;
        })
        .join(" ")
    : null;

  const activeSkill = hoveredIndex !== null ? radarSkills[hoveredIndex] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            Skill Proficiency Radar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-axis polygon comparison of candidate proficiencies vs project benchmarks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            Project Target
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            Current Profile
          </span>
          {isSimulating && (
            <span className="flex items-center gap-1.5 text-sky-700 font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
              Projected (After Upskilling)
            </span>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex items-center justify-center py-2">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[420px] overflow-visible"
        >
          {/* Background Concentric Grid Polygons */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeDasharray={idx === 3 ? "none" : "3,3"}
            />
          ))}

          {/* Level Numbers along 12 o'clock ray */}
          {gridLevels.map((lvl) => {
            const { y } = getCoordinates(0, lvl);
            return (
              <text
                key={lvl}
                x={center + 6}
                y={y + 3}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                className="select-none font-bold"
              >
                L{lvl}
              </text>
            );
          })}

          {/* Axis Spoke Rays & Labels */}
          {radarSkills.map((s, i) => {
            const outer = getCoordinates(i, maxLevel);
            const labelPos = getCoordinates(i, maxLevel + 0.6);
            const anchor = getTextAnchor(labelPos.x);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Ray line */}
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />

                {/* Outer label */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor={anchor}
                  fill={isHovered ? "#4f46e5" : "#475569"}
                  fontSize="11"
                  fontWeight={isHovered ? "bold" : "600"}
                  className="cursor-pointer transition-colors select-none"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {s.skillName}
                </text>
              </g>
            );
          })}

          {/* 1. Project Requirement Polygon (Indigo) */}
          <polygon
            points={projectPoints}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="#6366f1"
            strokeWidth="2"
            className="transition-all duration-500"
          />

          {/* 2. Projected Candidate Polygon (Sky dashed) if simulating */}
          {isSimulating && projectedPoints && (
            <polygon
              points={projectedPoints}
              fill="rgba(14, 165, 233, 0.2)"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeDasharray="4,3"
              className="transition-all duration-500 animate-in fade-in"
            />
          )}

          {/* 3. Candidate Baseline Polygon (Emerald) */}
          <polygon
            points={candidatePoints}
            fill="rgba(16, 185, 129, 0.22)"
            stroke="#10b981"
            strokeWidth="2.5"
            className="transition-all duration-500"
          />

          {/* Vertex Nodes for Candidate Points */}
          {radarSkills.map((s, i) => {
            const pt = getCoordinates(i, s.candidateProficiency);
            const isHovered = hoveredIndex === i;

            return (
              <circle
                key={`cand-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? "6" : "4"}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all shadow-sm"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Vertex Nodes for Project Points */}
          {radarSkills.map((s, i) => {
            const pt = getCoordinates(i, s.requiredProficiency);
            const isHovered = hoveredIndex === i;

            return (
              <circle
                key={`proj-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? "5" : "3.5"}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all shadow-sm"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Hover Information Banner */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {activeSkill ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {activeSkill.skillName}
              </span>
              <Badge
                variant={
                  activeSkill.status === "matched"
                    ? "success"
                    : activeSkill.status === "under_proficient"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px]"
              >
                {activeSkill.status === "matched"
                  ? "Proficiency Satisfied"
                  : activeSkill.status === "under_proficient"
                  ? "Needs Level-Up"
                  : "Missing Requirement"}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>
                Candidate:{" "}
                <strong className="text-emerald-700">
                  Level {activeSkill.candidateProficiency}/4
                </strong>
              </span>
              <span>
                Required:{" "}
                <strong className="text-indigo-700">
                  Level {activeSkill.requiredProficiency}/4
                </strong>
              </span>
              {isSimulating && simulatedSkillLevels[activeSkill.skillName] && (
                <span className="text-sky-700 font-bold">
                  Projected: Level {simulatedSkillLevels[activeSkill.skillName]}/4
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Hover over any vertex or skill label to view precise proficiency ratings.
          </p>
        )}
      </div>
    </div>
  );
}

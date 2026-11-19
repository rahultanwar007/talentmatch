import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function MatchScoreBadge({
  score,
  size = "default",
  showIcon = true,
}: MatchScoreBadgeProps) {
  const isHigh = score >= 75;
  const isMid = score >= 50 && score < 75;

  const colorStyles = isHigh
    ? "bg-emerald-50 text-emerald-700 border-emerald-200/90"
    : isMid
    ? "bg-amber-50 text-amber-700 border-amber-200/90"
    : "bg-rose-50 text-rose-700 border-rose-200/90";

  const sizeStyles =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : size === "lg"
      ? "text-base px-3.5 py-1.5 font-bold"
      : "text-xs px-2.5 py-1 font-semibold";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-tight shadow-2xs font-semibold",
        colorStyles,
        sizeStyles
      )}
    >
      {showIcon && (
        <>
          {isHigh ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : isMid ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          )}
        </>
      )}
      <span>{score}% Match</span>
    </div>
  );
}

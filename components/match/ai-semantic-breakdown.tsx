import React from "react";
import { AIMatchAnalysis, AISemanticSkillMatch } from "@/lib/engine/ai-matcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Cpu,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

interface AISemanticBreakdownProps {
  analysis: AIMatchAnalysis;
}

export function AISemanticBreakdown({ analysis }: AISemanticBreakdownProps) {
  const {
    semanticScore,
    standardScore,
    scoreDelta,
    executiveSummary,
    semanticSkills,
    keyStrengths,
    potentialRisks,
    onboardingVelocity,
    modelUsed,
    isFallback,
    fallbackReason,
  } = analysis;

  const getStatusBadge = (status: AISemanticSkillMatch["status"], similarity: number) => {
    switch (status) {
      case "equivalent":
        return (
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Equivalent ({(similarity * 100).toFixed(0)}%)
          </Badge>
        );
      case "transferable":
        return (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200 gap-1 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Transferable ({(similarity * 100).toFixed(0)}%)
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-xs font-semibold">
            <Info className="w-3 h-3 text-amber-600" />
            Partial ({(similarity * 100).toFixed(0)}%)
          </Badge>
        );
      case "unmatched":
      default:
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Unmatched
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Fallback Warning Notice if applicable */}
      {isFallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice:</span> Showing baseline mathematical match because the self-hosted AI engine returned a fallback ({fallbackReason}). Verify that your Ollama / AI endpoint is accessible.
          </div>
        </div>
      )}

      {/* Main AI Synthesis Card */}
      <Card className="border-indigo-200/80 shadow-md bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-100/60 bg-white/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  AI Executive Qualitative Synthesis
                  <Badge variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 font-medium">
                    <Cpu className="w-3 h-3 mr-1 inline" /> {modelUsed}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Evaluates conceptual skill transferability, adjacent frameworks, and domain competence.
                </CardDescription>
              </div>
            </div>

            {/* Velocity & Delta Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Onboarding: <strong>{onboardingVelocity}</strong></span>
              </div>
              {scoreDelta !== 0 && (
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    scoreDelta > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {scoreDelta > 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      +{scoreDelta}% Semantic Boost
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      {scoreDelta}% Strict Gap
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Executive Summary Paragraph */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              {executiveSummary}
            </p>
          </div>

          {/* Key Strengths & Potential Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standout Strengths */}
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Demonstrated Technical Strengths
              </h4>
              <ul className="space-y-1.5">
                {keyStrengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Blindspots / Risks */}
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Considerations & Ramp-Up Gaps
              </h4>
              <ul className="space-y-1.5">
                {potentialRisks.map((risk, idx) => (
                  <li key={idx} className="text-xs text-amber-950 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Skill Bridges Matrix */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Semantic Skill Transferability Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                How candidate skills conceptually satisfy or bridge each project requirement.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Baseline Math: <strong className="text-slate-900">{standardScore}%</strong></span>
              <span>•</span>
              <span>AI Semantic: <strong className="text-indigo-600">{semanticScore}%</strong></span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Project Requirement</th>
                  <th className="py-3 px-4 font-semibold">Candidate Competency</th>
                  <th className="py-3 px-4 font-semibold">Transferability Status</th>
                  <th className="py-3 px-4 font-semibold">AI Rationale & Technical Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {semanticSkills.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {item.projectSkill}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {item.candidateMatchedSkill ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                          {item.candidateMatchedSkill}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None detected</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status, item.similarity)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 leading-relaxed max-w-md">
                      {item.transferabilityNote}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {semanticSkills.map((item, idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">{item.projectSkill}</span>
                  {getStatusBadge(item.status, item.similarity)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-medium text-slate-900">
                    {item.candidateMatchedSkill || "None detected"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                  {item.transferabilityNote}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

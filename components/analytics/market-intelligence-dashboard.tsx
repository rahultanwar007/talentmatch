"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MarketIntelligenceReport,
  SkillMarketStat,
} from "@/lib/engine/analytics";
import {
  extractSkillsFromText,
  SkillExtractionResult,
} from "@/lib/engine/extractor";
import { ProjectWithDetails } from "@/lib/actions/projects";
import { EmployerWithDetails } from "@/lib/actions/employers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  Search,
  Building2,
  Users,
  Activity,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";

interface MarketIntelligenceDashboardProps {
  initialReport: MarketIntelligenceReport;
  projects: ProjectWithDetails[];
  employers: EmployerWithDetails[];
}

const SAMPLE_JOB_POST = `Senior Full-Stack Cloud Architect (FinTech)
We are seeking an experienced Staff/Lead Engineer to drive our next-generation financial processing core.
Requirements & Must-Have:
- 5+ years of hands-on expertise with React, TypeScript, and Next.js for high-throughput interfaces.
- In-depth production proficiency in PostgreSQL and distributed database scaling.
- Expert-level Kubernetes (K8s) and Docker container orchestration.
- 4+ years architecting microservices with Go (Golang) and REST / GraphQL APIs.

Nice-to-Have & Bonus:
- Familiarity with Apache Kafka event streaming.
- Exposure to Retrieval-Augmented Generation (RAG) and Vector Databases.
- Cloud experience on AWS or Google Cloud Platform (GCP).`;

const SAMPLE_RESUME = `Amina Diallo — Staff Distributed Systems Engineer
Summary:
10+ years architecting mission-critical backend and cloud platforms.
Technical Core:
- Expert in Go (Golang), Python, and Node.js microservices.
- Advanced PostgreSQL optimization, Redis caching, and Kafka streaming pipelines.
- Deep expertise in Kubernetes, Docker, and Terraform infrastructure-as-code on AWS.
- Hands-on experience with Next.js, React, and Tailwind CSS.
- Active practitioner of AI / ML workflows, RAG, and vector databases for semantic search.`;

export function MarketIntelligenceDashboard({
  initialReport,
  projects,
  employers,
}: MarketIntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState<"market" | "extractor">("market");

  // Extractor State
  const [rawText, setRawText] = useState(SAMPLE_JOB_POST);
  const [extractionResult, setExtractionResult] = useState<SkillExtractionResult>(() =>
    extractSkillsFromText(SAMPLE_JOB_POST)
  );

  // Skill filter
  const [skillSearch, setSkillSearch] = useState("");

  const handleExtract = (text: string) => {
    setRawText(text);
    const result = extractSkillsFromText(text);
    setExtractionResult(result);
  };

  const filteredSkillStats = useMemo(() => {
    if (!skillSearch) return initialReport.skillStats;
    const q = skillSearch.toLowerCase();
    return initialReport.skillStats.filter(
      (s) =>
        s.skillName.toLowerCase().includes(q) ||
        s.canonicalName.toLowerCase().includes(q)
    );
  }, [initialReport.skillStats, skillSearch]);

  const placedEmployersCount = employers.filter(
    (e) => e.availability === "Assigned"
  ).length;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "market" | "extractor")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market" className="py-2.5">
            <BarChart3 className="h-4 w-4" />
            <span>Market Skill Supply vs Demand ({initialReport.skillStats.length} Technologies)</span>
          </TabsTrigger>
          <TabsTrigger value="extractor" className="py-2.5">
            <Sparkles className="h-4 w-4" />
            <span>Smart Job Description & Resume Skill Extractor</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Market Supply vs Demand */}
        <TabsContent value="market" className="space-y-6">
          {/* Executive Macro KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Market Health Index</span>
                <Activity className="h-4 w-4 text-emerald-600" />
              </p>
              <p className="text-3xl font-extrabold font-mono text-emerald-700 mt-2">
                {initialReport.macroStats.marketHealthScore}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                High Liquidity • Balanced Talent Pool
              </p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center justify-between">
                <span>Critical Shortages</span>
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </p>
              <p className="text-3xl font-extrabold font-mono text-rose-700 mt-2">
                {initialReport.macroStats.criticalShortageCount}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                High Demand & Zero/Low Supply Skills
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center justify-between">
                <span>Talent Staffing Rate</span>
                <Users className="h-4 w-4 text-purple-600" />
              </p>
              <p className="text-3xl font-extrabold font-mono text-purple-700 mt-2">
                {Math.round((placedEmployersCount / Math.max(1, employers.length)) * 100)}%
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {placedEmployersCount} of {employers.length} Candidates Placed
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center justify-between">
                <span>Top Deficit Domain</span>
                <Layers className="h-4 w-4 text-indigo-600" />
              </p>
              <p className="text-lg font-bold text-indigo-900 mt-2 truncate">
                {initialReport.macroStats.topDeficitCategory}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Highest Requisition Bottleneck
              </p>
            </div>
          </div>

          {/* Top Shortages & Surplus Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Shortage Card */}
            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Top Skill Shortages (Market Demand &gt; Supply)
                </h3>
                <Badge variant="destructive" className="text-xs font-mono">
                  Needs Hiring / Training
                </Badge>
              </div>

              <div className="space-y-2">
                {initialReport.topShortages.map((item) => (
                  <div
                    key={item.canonicalName}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.skillName}</p>
                      <p className="text-[11px] text-slate-500">
                        Demanded by {item.demandCount} projects ({item.requiredDemandCount} must-have) •{" "}
                        <span className="text-rose-600 font-semibold">
                          Only {item.supplyCount} candidates available
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-mono font-bold text-rose-700">
                        Deficit: +{item.netGap}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Severity: {item.shortageIndex}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surplus Skills Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  High Supply Technologies (Available Bench)
                </h3>
                <Badge variant="success" className="text-xs font-mono">
                  Abundant Supply
                </Badge>
              </div>

              <div className="space-y-2">
                {initialReport.topSurpluses.map((item) => (
                  <div
                    key={item.canonicalName}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.skillName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.supplyCount} candidates verified • Avg Level {item.avgSupplyProficiency} • {item.avgExperienceYears} yrs exp
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
                        Surplus: +{item.supplyCount - item.demandCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional Upskilling Recommendations */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  Institutional Upskilling Sponsorship Recommendations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Suggested high-impact courses organizations should sponsor to dissolve platform-wide talent bottlenecks.
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                Highest ROI
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {initialReport.institutionalUpskillingRecommendations.map((rec) => (
                <div
                  key={rec.course.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2 hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs line-clamp-1">
                      {rec.course.title}
                    </span>
                    <Badge
                      variant={rec.priority === "Urgent" ? "destructive" : "warning"}
                      className="text-[10px] shrink-0"
                    >
                      {rec.priority} Priority
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Provider: {rec.course.provider} • Duration: {rec.course.duration}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
                    <span>Target: <strong className="text-indigo-700">{rec.targetSkill}</strong></span>
                    <span className="text-emerald-700 font-semibold">
                      Impacts {rec.estimatedTalentImpact} roles
                    </span>
                  </div>

                  <a
                    href={rec.course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold pt-1"
                  >
                    <span>View Curriculum</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Full Comparative Skill Supply vs Demand Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Full Comparative Skill Supply vs Demand Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit across all tracked technical skills on the platform.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Filter skill..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pl-8 bg-white border-slate-300 text-xs h-8 text-slate-900"
                />
              </div>
            </div>

            {/* Mobile Card View for Skill Supply vs Demand */}
            <div className="block sm:hidden space-y-2.5">
              {filteredSkillStats.map((item) => (
                <div
                  key={item.canonicalName}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.skillName}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        item.status === "critical_shortage"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : item.status === "moderate_shortage"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "surplus"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {item.status === "critical_shortage"
                        ? "Critical Deficit"
                        : item.status === "moderate_shortage"
                        ? "Moderate Deficit"
                        : item.status === "surplus"
                        ? "Surplus"
                        : "Balanced"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Demand: <strong className="font-mono text-indigo-700">{item.demandCount} projects</strong></span>
                    <span>Supply: <strong className="font-mono text-emerald-700">{item.supplyCount} profiles</strong></span>
                    <span className="font-mono text-[11px] font-bold">
                      {item.netGap > 0 ? (
                        <span className="text-rose-600">-{item.netGap}</span>
                      ) : item.netGap < 0 ? (
                        <span className="text-emerald-700">+{Math.abs(item.netGap)}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Skill Name</th>
                    <th className="p-3">Market Status</th>
                    <th className="p-3 text-center">Project Demand</th>
                    <th className="p-3 text-center">Talent Supply</th>
                    <th className="p-3 text-center">Net Shortage / Surplus</th>
                    <th className="p-3">Supply vs Demand Balance Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSkillStats.map((item) => {
                    const maxVal = Math.max(item.demandCount, item.supplyCount, 1);
                    const demandPct = Math.round((item.demandCount / maxVal) * 100);
                    const supplyPct = Math.round((item.supplyCount / maxVal) * 100);

                    return (
                      <tr key={item.canonicalName} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          {item.skillName}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                              item.status === "critical_shortage"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : item.status === "moderate_shortage"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : item.status === "surplus"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {item.status === "critical_shortage"
                              ? "Critical Deficit"
                              : item.status === "moderate_shortage"
                              ? "Moderate Deficit"
                              : item.status === "surplus"
                              ? "Surplus"
                              : "Balanced"}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-700">
                          {item.demandCount} projects
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">
                          {item.supplyCount} profiles
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          {item.netGap > 0 ? (
                            <span className="text-rose-600">-{item.netGap} Deficit</span>
                          ) : item.netGap < 0 ? (
                            <span className="text-emerald-700">+{Math.abs(item.netGap)} Surplus</span>
                          ) : (
                            <span className="text-slate-400">0 Balanced</span>
                          )}
                        </td>
                        <td className="p-3 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="w-12 text-slate-500 font-medium">Demand:</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                                <div
                                  className="bg-indigo-600 h-full rounded-full"
                                  style={{ width: `${demandPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="w-12 text-slate-500 font-medium">Supply:</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${supplyPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Smart Job Description & Resume Skill Extractor */}
        <TabsContent value="extractor" className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Smart Job Description & Resume Parser
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste raw text to automatically extract verified technical skills, infer proficiency levels, and detect project requisites.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtract(SAMPLE_JOB_POST)}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Load FinTech Job Spec
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtract(SAMPLE_RESUME)}
                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Load Candidate Resume
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExtract("")}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Raw Text Input */}
            <div>
              <textarea
                value={rawText}
                onChange={(e) => handleExtract(e.target.value)}
                placeholder="Paste any job description, candidate resume, technical specification, or requirements list here..."
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                rows={7}
              />
            </div>

            {/* Extracted Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs">
              <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {extractionResult.summary}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(extractionResult.categoryBreakdown).map(
                  ([cat, count]) => (
                    <span
                      key={cat}
                      className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] text-slate-700 font-medium shadow-2xs"
                    >
                      {cat}: <strong>{count}</strong>
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Extracted Skills Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-600" />
              Structured Skill Profile Extracted ({extractionResult.extractedSkills.length})
            </h3>

            {extractionResult.extractedSkills.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-2xs">
                <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  No technical skills detected yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Type or paste text above to see automatic technical entity extraction.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {extractionResult.extractedSkills.map((skill) => (
                  <div
                    key={skill.canonicalName}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2 hover:border-indigo-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {skill.skillName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Category: {skill.category}
                        </span>
                      </div>

                      <Badge
                        variant={skill.isRequired ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {skill.isRequired ? "Must-Have" : "Bonus/Preferred"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 text-[11px]">Inferred Level:</span>
                      <span className="font-semibold text-indigo-700 font-mono">
                        Level {skill.inferredProficiency} ({skill.proficiencyLabel})
                      </span>
                    </div>

                    {skill.mentionContext && (
                      <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200 line-clamp-2">
                        &ldquo;...{skill.mentionContext}...&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

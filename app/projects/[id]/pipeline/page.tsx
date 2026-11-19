import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectPipeline } from "@/lib/actions/pipeline";
import { getEmployers } from "@/lib/actions/employers";
import { ProjectPipelineBoard } from "@/components/pipeline/project-pipeline-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, UserCheck } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPipelinePage({ params }: PageProps) {
  const { id } = await params;

  const [pipelineData, employers] = await Promise.all([
    getProjectPipeline(id),
    getEmployers(),
  ]);

  if (!pipelineData) {
    notFound();
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Project Overview
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Staffing Pipeline & ATS
            </h1>
            <Badge variant="default" className="text-xs">
              Phase 4 ATS
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Track candidate progression from algorithmic match through shortlisting, technical evaluation, upskilling, and final placement.
          </p>
        </div>
      </div>

      {/* Main Interactive Kanban Board */}
      <ProjectPipelineBoard
        initialData={pipelineData}
        allEmployers={employers}
      />
    </div>
  );
}

import React from "react";
import { getProjects } from "@/lib/actions/projects";
import { ProjectListView } from "@/components/projects/project-list-view";
import { Briefcase } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <Briefcase className="h-3.5 w-3.5" />
          Company Projects Directory
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Active Engineering Projects
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Browse enterprise projects, view technical skill requirements, and find matching talent profiles.
        </p>
      </div>

      <ProjectListView initialProjects={projects} />
    </div>
  );
}

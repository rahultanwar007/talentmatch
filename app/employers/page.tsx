import React from "react";
import { getEmployers } from "@/lib/actions/employers";
import { EmployerListView } from "@/components/employers/employer-list-view";
import { Users } from "lucide-react";

export default async function EmployersPage() {
  const employers = await getEmployers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <Users className="h-3.5 w-3.5" />
          Employer / Talent Directory
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Engineers & Technical Profiles
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Browse verified talent profiles, view technical proficiencies, and evaluate match compatibility with active company projects.
        </p>
      </div>

      <EmployerListView initialEmployers={employers} />
    </div>
  );
}

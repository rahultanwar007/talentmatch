import React from "react";
import { getCourses } from "@/lib/actions/courses";
import { CoursesView } from "@/components/courses/courses-view";
import { GraduationCap } from "lucide-react";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
          <GraduationCap className="h-3.5 w-3.5" />
          Upskilling & Course Catalog
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Curated Technical Courses
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          Courses mapped to technical requirements, ready to be automatically recommended whenever a skill gap is detected during project match analysis.
        </p>
      </div>

      <CoursesView initialCourses={courses} />
    </div>
  );
}

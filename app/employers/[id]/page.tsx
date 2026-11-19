import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployerRankings } from "@/lib/actions/matching";
import { getCandidateLearningProgress } from "@/lib/actions/learning";
import { getCandidatePlacements } from "@/lib/actions/pipeline";
import { getCourses } from "@/lib/actions/courses";
import { EmployerDetailView } from "@/components/employers/employer-detail-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  Mail,
  Layers,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [data, enrollments, allCourses, placements] = await Promise.all([
    getEmployerRankings(id),
    getCandidateLearningProgress(id),
    getCourses(),
    getCandidatePlacements(id),
  ]);

  if (!data) {
    notFound();
  }

  const { employer, rankings } = data;

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
        return "Competent";
    }
  };

  // Collect all missing or under-proficient skills for this candidate across projects
  const missingSkillTagsSet = new Set<string>();
  for (const r of rankings.slice(0, 5)) {
    for (const m of r.analysis.missingSkills) {
      missingSkillTagsSet.add(m.skillName);
    }
    for (const u of r.analysis.underProficientSkills) {
      missingSkillTagsSet.add(u.skillName);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/employers"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all profiles
      </Link>

      {/* Profile Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar size="xl">
              <AvatarImage
                src={employer.avatarUrl || ""}
                alt={employer.name}
              />
              <AvatarFallback>
                {employer.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    employer.availability === "Available"
                      ? "success"
                      : employer.availability === "Exploring"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {employer.availability}
                </Badge>
                <span className="text-xs text-slate-300">•</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {employer.location || "Remote"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {employer.name}
              </h1>

              <p className="text-sm font-semibold text-indigo-600">
                {employer.roleTitle}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {employer.yearsOfExperience} Years of Professional Experience
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {employer.email}
                </span>
              </div>
            </div>
          </div>

          <Link href={`/match?employerId=${employer.id}`}>
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Match All Projects
            </Button>
          </Link>
        </div>

        {/* Bio */}
        {employer.bio && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Professional Biography
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {employer.bio}
            </p>
          </div>
        )}

        {/* Verified Technical Skills */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            Verified Technical Skills ({employer.skills.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {employer.skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-2xs"
              >
                <div className="font-semibold text-slate-900 text-xs">
                  {skill.skillName}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-indigo-600 font-medium">
                    Level {skill.proficiencyLevel} (
                    {getProficiencyLabel(skill.proficiencyLevel)})
                  </span>
                  <span>{skill.yearsExperience}y</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tabbed Area: Ranked Projects vs Candidate Learning Journey vs Staffing Pipeline */}
      <EmployerDetailView
        employer={employer}
        rankings={rankings}
        enrollments={enrollments}
        allCourses={allCourses}
        missingSkillTags={Array.from(missingSkillTagsSet)}
        placements={placements}
      />
    </div>
  );
}

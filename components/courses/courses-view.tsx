"use client";

import React, { useState, useTransition } from "react";
import { CourseItem, createCourse } from "@/lib/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Search,
  Plus,
  BookOpen,
  Filter,
  Sparkles,
} from "lucide-react";

interface CoursesViewProps {
  initialCourses: CourseItem[];
}

export function CoursesView({ initialCourses }: CoursesViewProps) {
  const [coursesList, setCoursesList] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formTitle, setFormTitle] = useState("");
  const [formProvider, setFormProvider] = useState("Coursera");
  const [formUrl, setFormUrl] = useState("");
  const [formSkillTag, setFormSkillTag] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >("Intermediate");
  const [formDuration, setFormDuration] = useState("12 hours");
  const [formRating, setFormRating] = useState("4.8");
  const [formDescription, setFormDescription] = useState("");

  // Extract unique skill tags
  const allTags = ["All", ...Array.from(new Set(coursesList.map((c) => c.skillTag)))];

  const filteredCourses = coursesList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skillTag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || c.skillTag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSkillTag.trim() || !formUrl.trim()) return;

    startTransition(async () => {
      const res = await createCourse({
        title: formTitle,
        provider: formProvider,
        url: formUrl,
        skillTag: formSkillTag,
        difficulty: formDifficulty,
        duration: formDuration,
        rating: formRating,
        description: formDescription,
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by skill tag, title, or provider..."
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="default"
          size="default"
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Course
        </Button>
      </div>

      {/* Skill Tags Horizontal Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedTag === tag
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-2xs">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 font-medium">No courses found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="indigo" className="text-[11px] font-mono">
                    {course.skillTag}
                  </Badge>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="mt-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-2">
                  {course.title}
                </h3>

                <p className="mt-1 text-xs text-indigo-600 font-semibold">
                  {course.provider}
                </p>

                {course.description && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {course.duration || "Self-paced"}
                </span>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    View Course
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal using Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add Upskilling Course
            </DialogTitle>
            <DialogDescription>
              Register a curated training path from Coursera, Udemy, or edX to bridge candidate skill gaps.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Course Title
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Masterclass in Apache Kafka"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Provider
                </label>
                <Input
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  placeholder="Coursera / Udemy / edX"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Target Skill Tag
                </label>
                <Input
                  value={formSkillTag}
                  onChange={(e) => setFormSkillTag(e.target.value)}
                  placeholder="e.g. Kafka, Docker, Next.js"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Course URL
              </label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Difficulty
                </label>
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Duration
                </label>
                <Input
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g. 15 hours"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Rating (out of 5)
                </label>
                <Input
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                  placeholder="4.8"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Description / Outcomes
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief summary of skills taught and real-world project outcomes..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={isPending}
              >
                {isPending ? "Adding..." : "Add Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

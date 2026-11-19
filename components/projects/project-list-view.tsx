"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ProjectWithDetails, createProject } from "@/lib/actions/projects";
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
  Briefcase,
  Search,
  Plus,
  Building2,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  Zap,
} from "lucide-react";

interface ProjectListViewProps {
  initialProjects: ProjectWithDetails[];
}

export function ProjectListView({ initialProjects }: ProjectListViewProps) {
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [formCompany, setFormCompany] = useState("");
  const [formIndustry, setFormIndustry] = useState("Fintech & SaaS");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Fullstack Web");
  const [formDescription, setFormDescription] = useState("");
  const [formMinExp, setFormMinExp] = useState(3);
  const [formBudget, setFormBudget] = useState("$9,000 - $13,000 / mo");
  const [skillTags, setSkillTags] = useState<
    { skillName: string; minProficiency: number; isRequired: boolean }[]
  >([
    { skillName: "Next.js", minProficiency: 3, isRequired: true },
    { skillName: "TypeScript", minProficiency: 3, isRequired: true },
    { skillName: "PostgreSQL", minProficiency: 2, isRequired: true },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProf, setNewSkillProf] = useState(2);
  const [newSkillReq, setNewSkillReq] = useState(true);

  const categories = [
    "All",
    "Fullstack Web",
    "AI & Machine Learning",
    "Cloud & DevOps",
    "Mobile Development",
    "Backend & Systems",
    "Data & IoT",
  ];

  const filteredProjects = projectsList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s) =>
        s.skillName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSkillTag = () => {
    if (!newSkillName.trim()) return;
    setSkillTags([
      ...skillTags,
      {
        skillName: newSkillName.trim(),
        minProficiency: newSkillProf,
        isRequired: newSkillReq,
      },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkillTag = (index: number) => {
    setSkillTags(skillTags.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCompany.trim()) return;

    startTransition(async () => {
      const res = await createProject({
        companyName: formCompany,
        companyIndustry: formIndustry,
        title: formTitle,
        description: formDescription,
        category: formCategory,
        minExperienceYears: Number(formMinExp),
        budget: formBudget,
        skills: skillTags,
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search, Category Pills, New Project CTA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by role, company, or tech stack..."
            className="pl-10"
          />
        </div>

        {/* New Project Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="gradient"
          size="default"
          className="self-start md:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Post New Project
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-2xs font-bold"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-2xs">
          <Briefcase className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 font-medium">No projects match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                {/* Header: Company & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs">
                      {project.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {project.companyName}
                    </span>
                  </div>

                  <Badge variant="outline" className="text-[10px]">
                    {project.category}
                  </Badge>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {project.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {project.description}
                </p>

                {/* Requirements Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-500">Must-Have Skills:</span>
                    <span>{project.minExperienceYears}+ yrs exp</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${
                          skill.isRequired
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold"
                            : "border border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {skill.skillName} (L{skill.minProficiency})
                        {skill.isRequired ? " *" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-mono font-bold text-slate-600">
                  {project.budget || "Competitive"}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/match?project=${project.id}`}>
                    <Button variant="outline" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 border-indigo-200 bg-indigo-50/50">
                      <Zap className="h-3 w-3 mr-1 text-indigo-600" />
                      Find Matches
                    </Button>
                  </Link>

                  <Link href={`/projects/${project.id}`}>
                    <Button variant="default" size="sm" className="text-xs">
                      Details
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post New Project Modal via Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Post New Company Project
            </DialogTitle>
            <DialogDescription>
              Define the role, required technical skills, and minimum proficiency levels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Name
                </label>
                <Input
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Apex FinTech"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry
                </label>
                <Input
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                  placeholder="e.g. Financial Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cloud Banking Core"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  {categories.filter(c => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Description
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="High-level overview of project scope, deliverables, and team context..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min. Experience (Years)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  value={formMinExp}
                  onChange={(e) => setFormMinExp(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Budget / Salary
                </label>
                <Input
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="e.g. $10,000 - $14,000 / mo"
                />
              </div>
            </div>

            {/* Required Skills Picker */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Required Technical Skills ({skillTags.length})
              </label>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {skillTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700 font-medium"
                  >
                    <span>
                      {tag.skillName} (L{tag.minProficiency})
                      {tag.isRequired ? " *" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillTag(idx)}
                      className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Skill (e.g. Docker, Python)"
                  className="flex-1 min-w-[140px] text-xs h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkillTag();
                    }
                  }}
                />

                <select
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(Number(e.target.value))}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <option value={1}>L1 (Novice)</option>
                  <option value={2}>L2 (Junior)</option>
                  <option value={3}>L3 (Mid-Level)</option>
                  <option value={4}>L4 (Senior)</option>
                  <option value={5}>L5 (Expert)</option>
                </select>

                <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkillReq}
                    onChange={(e) => setNewSkillReq(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Must-Have</span>
                </label>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSkillTag}
                  className="text-xs h-9"
                >
                  Add Skill
                </Button>
              </div>
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
                {isPending ? "Creating..." : "Save Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

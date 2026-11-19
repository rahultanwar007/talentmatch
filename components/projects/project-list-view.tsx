"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ProjectWithDetails, createProject } from "@/lib/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        // Refresh local view
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
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, companies, or skills..."
            className="pl-10"
          />
        </div>

        {/* New Project Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="gradient"
          size="default"
          className="self-start md:self-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Post New Project
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
          <p className="mt-2 font-medium">No projects matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm"
            >
              <div>
                {/* Header: Company & Category */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
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
                    <span className="font-medium text-slate-500">Required Tech Stack:</span>
                    <span>{project.minExperienceYears}+ yrs exp</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          skill.isRequired
                            ? "border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold"
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
                <span className="text-xs font-mono font-medium text-slate-500">
                  {project.budget || "Competitive"}
                </span>

                <Link href={`/projects/${project.id}`}>
                  <Button variant="default" size="sm" className="text-xs">
                    View & Match
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Company Project
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Define the role, required technical skills, and minimum proficiency levels.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Company Name
                  </label>
                  <Input
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Acme Tech"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Industry
                  </label>
                  <Input
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    placeholder="e.g. FinTech / HealthTech"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Project Title
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Next.js Enterprise Portal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Min Experience (Years)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    value={formMinExp}
                    onChange={(e) => setFormMinExp(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Project Description
                </label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the deliverables, scope, and technical stack..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Budget / Compensation
                </label>
                <Input
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="e.g. $10,000 - $14,000 / month"
                />
              </div>

              {/* Skills Editor */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Required Skills & Proficiency
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {skillTags.length} skills added
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 shadow-2xs font-medium"
                    >
                      <span>
                        {tag.skillName} (L{tag.minProficiency})
                        {tag.isRequired ? " *" : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillTag(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Skill Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <Input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name (e.g. Docker, Python)"
                    className="flex-1 h-8 text-xs bg-white"
                  />
                  <select
                    value={newSkillProf}
                    onChange={(e) => setNewSkillProf(Number(e.target.value))}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800"
                  >
                    <option value={1}>L1 (Beginner)</option>
                    <option value={2}>L2 (Intermediate)</option>
                    <option value={3}>L3 (Advanced)</option>
                    <option value={4}>L4 (Expert)</option>
                  </select>
                  <label className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={newSkillReq}
                      onChange={(e) => setNewSkillReq(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    Req
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAddSkillTag}
                    className="h-8 text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

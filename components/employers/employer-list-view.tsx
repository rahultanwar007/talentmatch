"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { EmployerWithDetails, createEmployer } from "@/lib/actions/employers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Plus,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  Mail,
} from "lucide-react";

interface EmployerListViewProps {
  initialEmployers: EmployerWithDetails[];
}

export function EmployerListView({
  initialEmployers,
}: EmployerListViewProps) {
  const [employersList, setEmployersList] = useState(initialEmployers);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  // Create Employer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formExp, setFormExp] = useState(3);
  const [formLocation, setFormLocation] = useState("Remote");
  const [formAvailability, setFormAvailability] = useState<
    "Available" | "Busy" | "Exploring"
  >("Available");
  const [skills, setSkills] = useState<
    { skillName: string; proficiencyLevel: number; yearsExperience: number }[]
  >([
    { skillName: "TypeScript", proficiencyLevel: 3, yearsExperience: 3 },
    { skillName: "React", proficiencyLevel: 3, yearsExperience: 3 },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProf, setNewSkillProf] = useState(2);
  const [newSkillYrs, setNewSkillYrs] = useState(2);

  const filteredEmployers = employersList.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) =>
        s.skillName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesAvailability =
      availabilityFilter === "All" || emp.availability === availabilityFilter;
    return matchesSearch && matchesAvailability;
  });

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        skillName: newSkillName.trim(),
        proficiencyLevel: newSkillProf,
        yearsExperience: newSkillYrs,
      },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formEmail.trim()) return;

    startTransition(async () => {
      const res = await createEmployer({
        name: formName,
        roleTitle: formRole,
        email: formEmail,
        bio: formBio,
        yearsOfExperience: Number(formExp),
        availability: formAvailability,
        location: formLocation,
        skills,
      });

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search talent by name, role, or technical skill..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Exploring">Exploring</option>
            <option value="Busy">Busy</option>
          </select>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="default"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Profile
          </Button>
        </div>
      </div>

      {/* Profiles Grid */}
      {filteredEmployers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-2xs">
          <Users className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 font-medium">No employer/talent profiles match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployers.map((emp) => (
            <div
              key={emp.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        emp.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={emp.name}
                      className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium">{emp.roleTitle}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      emp.availability === "Available"
                        ? "success"
                        : emp.availability === "Exploring"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {emp.availability}
                  </Badge>
                </div>

                {/* Bio */}
                {emp.bio && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {emp.bio}
                  </p>
                )}

                {/* Experience & Location */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {emp.yearsOfExperience} yrs exp
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {emp.location || "Remote"}
                  </span>
                </div>

                {/* Skills Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                    Skills ({emp.skills.length})
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 font-medium"
                      >
                        {skill.skillName} (L{skill.proficiencyLevel})
                      </span>
                    ))}
                    {emp.skills.length > 5 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{emp.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <Link
                  href={`/match?employerId=${emp.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Match Projects
                </Link>

                <Link href={`/employers/${emp.id}`}>
                  <Button variant="default" size="sm" className="text-xs">
                    View Profile
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Profile Modal */}
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
              Add Talent / Employer Profile
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Create a profile with verified technical competencies and experience.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Full Name
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Role Title
                  </label>
                  <Input
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Availability
                  </label>
                  <select
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="Available">Available</option>
                    <option value="Exploring">Exploring</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={formExp}
                    onChange={(e) => setFormExp(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Location
                  </label>
                  <Input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote / New York"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Professional Bio
                </label>
                <Textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Summary of experience, past projects, and core strengths..."
                  rows={2}
                />
              </div>

              {/* Skills Editor */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Verified Technical Skills
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {skills.length} skills added
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 shadow-2xs font-medium"
                    >
                      <span>
                        {tag.skillName} (L{tag.proficiencyLevel}) • {tag.yearsExperience}y
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
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
                    placeholder="Skill (e.g. Next.js, Go)"
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
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newSkillYrs}
                    onChange={(e) => setNewSkillYrs(Number(e.target.value))}
                    placeholder="Yrs"
                    className="w-16 h-8 text-xs bg-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAddSkill}
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
                  {isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

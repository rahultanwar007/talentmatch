"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { EmployerWithDetails, createEmployer } from "@/lib/actions/employers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Zap,
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
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
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
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs cursor-pointer"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available (Ready Now)</option>
            <option value="Exploring">Exploring</option>
            <option value="Busy">Busy (Placed)</option>
          </select>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="default"
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Profiles Grid */}
      {filteredEmployers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-2xs">
          <Users className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 font-medium">No candidates match your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployers.map((emp) => (
            <div
              key={emp.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="md">
                      <AvatarImage
                        src={emp.avatarUrl || ""}
                        alt={emp.name}
                      />
                      <AvatarFallback>
                        {emp.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-indigo-600 font-semibold">{emp.roleTitle}</p>
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
                    className="text-[10px] font-bold"
                  >
                    {emp.availability === "Available" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    )}
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
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {emp.yearsOfExperience} yrs exp
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {emp.location || "Remote"}
                  </span>
                </div>

                {/* Skills Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Verified Competencies ({emp.skills.length})
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {skill.skillName} (L{skill.proficiencyLevel})
                      </span>
                    ))}
                    {emp.skills.length > 5 && (
                      <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        +{emp.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <Link href={`/match?employer=${emp.id}`}>
                  <Button variant="outline" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 border-indigo-200 bg-indigo-50/50">
                    <Zap className="h-3 w-3 mr-1 text-indigo-600" />
                    Match Profile
                  </Button>
                </Link>

                <Link href={`/employers/${emp.id}`}>
                  <Button variant="default" size="sm" className="text-xs">
                    Full Profile
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Candidate Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Add Talent Candidate Profile
            </DialogTitle>
            <DialogDescription>
              Create a candidate profile with verified technical competencies and availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title
                </label>
                <Input
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g. Senior Fullstack Engineer"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability
                </label>
                <select
                  value={formAvailability}
                  onChange={(e) =>
                    setFormAvailability(
                      e.target.value as "Available" | "Busy" | "Exploring"
                    )
                  }
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Available">Available (Ready to Deploy)</option>
                  <option value="Exploring">Exploring</option>
                  <option value="Busy">Busy (Placed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formExp}
                  onChange={(e) => setFormExp(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Remote (UTC-5) or San Francisco"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Bio / Highlights
              </label>
              <Textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Brief summary of domain expertise, projects shipped, and core competencies..."
                rows={3}
              />
            </div>

            {/* Skills Array */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Verified Technical Skills ({skills.length})
              </label>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700 font-medium"
                  >
                    <span>
                      {s.skillName} (L{s.proficiencyLevel}, {s.yearsExperience}y)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
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
                  placeholder="Skill (e.g. Next.js, Go)"
                  className="flex-1 min-w-[140px] text-xs h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
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

                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={newSkillYrs}
                  onChange={(e) => setNewSkillYrs(Number(e.target.value))}
                  className="w-16 text-xs h-9"
                  title="Years of experience"
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSkill}
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
                {isPending ? "Saving..." : "Save Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

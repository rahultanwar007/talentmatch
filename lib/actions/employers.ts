"use server";

import { db } from "@/lib/db";
import { employers, employerSkills } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface EmployerWithDetails {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  bio: string | null;
  yearsOfExperience: number;
  avatarUrl: string | null;
  availability: string;
  location: string | null;
  createdAt: Date;
  skills: {
    id: string;
    skillName: string;
    proficiencyLevel: number;
    yearsExperience: number;
  }[];
}

export async function getEmployers(): Promise<EmployerWithDetails[]> {
  try {
    const rawEmployers = await db.query.employers.findMany({
      orderBy: [desc(employers.createdAt)],
      with: {
        skills: true,
      },
    });

    return rawEmployers.map((emp) => ({
      id: emp.id,
      name: emp.name,
      roleTitle: emp.roleTitle,
      email: emp.email,
      bio: emp.bio,
      yearsOfExperience: emp.yearsOfExperience,
      avatarUrl: emp.avatarUrl,
      availability: emp.availability,
      location: emp.location,
      createdAt: emp.createdAt,
      skills: emp.skills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel,
        yearsExperience: s.yearsExperience,
      })),
    }));
  } catch (error) {
    console.error("Error fetching employers:", error);
    return [];
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getEmployerById(
  id: string
): Promise<EmployerWithDetails | null> {
  if (!id || !UUID_REGEX.test(id)) {
    return null;
  }

  try {
    const emp = await db.query.employers.findFirst({
      where: eq(employers.id, id),
      with: {
        skills: true,
      },
    });

    if (!emp) return null;

    return {
      id: emp.id,
      name: emp.name,
      roleTitle: emp.roleTitle,
      email: emp.email,
      bio: emp.bio,
      yearsOfExperience: emp.yearsOfExperience,
      avatarUrl: emp.avatarUrl,
      availability: emp.availability,
      location: emp.location,
      createdAt: emp.createdAt,
      skills: emp.skills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel,
        yearsExperience: s.yearsExperience,
      })),
    };
  } catch (error) {
    console.error(`Error fetching employer ${id}:`, error);
    return null;
  }
}

export async function createEmployer(formData: {
  name: string;
  roleTitle: string;
  email: string;
  bio: string;
  yearsOfExperience: number;
  availability: "Available" | "Busy" | "Exploring";
  location: string;
  skills: {
    skillName: string;
    proficiencyLevel: number;
    yearsExperience: number;
  }[];
}) {
  try {
    const [newEmp] = await db
      .insert(employers)
      .values({
        name: formData.name,
        roleTitle: formData.roleTitle,
        email: formData.email,
        bio: formData.bio,
        yearsOfExperience: formData.yearsOfExperience || 1,
        availability: formData.availability || "Available",
        location: formData.location || "Remote",
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      })
      .returning();

    if (formData.skills && formData.skills.length > 0) {
      for (const s of formData.skills) {
        if (!s.skillName.trim()) continue;
        await db.insert(employerSkills).values({
          employerId: newEmp.id,
          skillName: s.skillName.trim(),
          proficiencyLevel: s.proficiencyLevel || 2,
          yearsExperience: s.yearsExperience || 1,
        });
      }
    }

    revalidatePath("/employers");
    revalidatePath("/match");
    revalidatePath("/");
    return { success: true, employerId: newEmp.id };
  } catch (error: any) {
    console.error("Error creating employer:", error);
    return { success: false, error: error.message };
  }
}

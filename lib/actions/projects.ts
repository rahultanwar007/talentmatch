"use server";

import { db } from "@/lib/db";
import { projects, projectSkills, companies } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ProjectWithDetails {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  companyIndustry: string;
  title: string;
  description: string;
  category: string;
  minExperienceYears: number;
  budget: string | null;
  status: string;
  createdAt: Date;
  skills: {
    id: string;
    skillName: string;
    minProficiency: number;
    isRequired: boolean;
    weight: number;
  }[];
}

export async function getProjects(): Promise<ProjectWithDetails[]> {
  try {
    const rawProjects = await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      with: {
        company: true,
        skills: true,
      },
    });

    return rawProjects.map((p) => ({
      id: p.id,
      companyId: p.companyId,
      companyName: p.company.name,
      companyLogo: p.company.logoUrl,
      companyIndustry: p.company.industry,
      title: p.title,
      description: p.description,
      category: p.category,
      minExperienceYears: p.minExperienceYears,
      budget: p.budget,
      status: p.status,
      createdAt: p.createdAt,
      skills: p.skills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProjectById(
  id: string
): Promise<ProjectWithDetails | null> {
  if (!id || !UUID_REGEX.test(id)) {
    return null;
  }

  try {
    const p = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        company: true,
        skills: true,
      },
    });

    if (!p) return null;

    return {
      id: p.id,
      companyId: p.companyId,
      companyName: p.company.name,
      companyLogo: p.company.logoUrl,
      companyIndustry: p.company.industry,
      title: p.title,
      description: p.description,
      category: p.category,
      minExperienceYears: p.minExperienceYears,
      budget: p.budget,
      status: p.status,
      createdAt: p.createdAt,
      skills: p.skills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        minProficiency: s.minProficiency,
        isRequired: s.isRequired,
        weight: s.weight,
      })),
    };
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }
}

export async function createProject(formData: {
  companyName: string;
  companyIndustry: string;
  title: string;
  description: string;
  category: string;
  minExperienceYears: number;
  budget: string;
  skills: {
    skillName: string;
    minProficiency: number;
    isRequired: boolean;
  }[];
}) {
  try {
    // 1. Find or create company
    let company = await db.query.companies.findFirst({
      where: eq(companies.name, formData.companyName),
    });

    if (!company) {
      const [newCompany] = await db
        .insert(companies)
        .values({
          name: formData.companyName,
          industry: formData.companyIndustry || "Technology",
          logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
        })
        .returning();
      company = newCompany;
    }

    // 2. Insert project
    const [newProject] = await db
      .insert(projects)
      .values({
        companyId: company.id,
        title: formData.title,
        description: formData.description,
        category: formData.category || "Fullstack Web",
        minExperienceYears: formData.minExperienceYears || 2,
        budget: formData.budget,
        status: "Open",
      })
      .returning();

    // 3. Insert skills
    if (formData.skills && formData.skills.length > 0) {
      for (const s of formData.skills) {
        if (!s.skillName.trim()) continue;
        await db.insert(projectSkills).values({
          projectId: newProject.id,
          skillName: s.skillName.trim(),
          minProficiency: s.minProficiency || 2,
          isRequired: s.isRequired ?? true,
          weight: s.isRequired ? 2 : 1,
        });
      }
    }

    revalidatePath("/projects");
    revalidatePath("/match");
    revalidatePath("/");
    return { success: true, projectId: newProject.id };
  } catch (error: any) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

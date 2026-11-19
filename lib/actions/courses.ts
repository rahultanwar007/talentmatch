"use server";

import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq, desc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CourseItem {
  id: string;
  title: string;
  provider: string;
  url: string;
  skillTag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  rating: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

export async function getCourses(skillTag?: string): Promise<CourseItem[]> {
  try {
    let query = db.select().from(courses);
    if (skillTag) {
      const result = await db
        .select()
        .from(courses)
        .where(ilike(courses.skillTag, `%${skillTag}%`))
        .orderBy(desc(courses.rating));
      return result;
    }

    const result = await db.select().from(courses).orderBy(desc(courses.rating));
    return result;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function createCourse(data: {
  title: string;
  provider: string;
  url: string;
  skillTag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating?: string;
  description?: string;
}) {
  try {
    const [newCourse] = await db
      .insert(courses)
      .values({
        title: data.title,
        provider: data.provider,
        url: data.url,
        skillTag: data.skillTag,
        difficulty: data.difficulty || "Intermediate",
        duration: data.duration,
        rating: data.rating || "4.8",
        description: data.description || "",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80",
      })
      .returning();

    revalidatePath("/courses");
    revalidatePath("/match");
    return { success: true, courseId: newCourse.id };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message };
  }
}

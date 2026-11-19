import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db, pool } from "./index";
import {
  companies,
  projects,
  projectSkills,
  employers,
  employerSkills,
  courses,
} from "./schema";
import {
  SEED_COMPANIES,
  SEED_PROJECTS,
  SEED_EMPLOYERS,
  SEED_COURSES,
} from "./seed-data";

async function runSeed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data in reverse dependency order
    await db.delete(projectSkills);
    await db.delete(employerSkills);
    await db.delete(projects);
    await db.delete(companies);
    await db.delete(employers);
    await db.delete(courses);
    console.log("✓ Cleared previous database records.");

    // 1. Insert Companies
    const companyIdMap = new Map<string, string>();
    for (const c of SEED_COMPANIES) {
      const [inserted] = await db
        .insert(companies)
        .values({
          name: c.name,
          industry: c.industry,
          website: c.website,
          logoUrl: c.logoUrl,
          description: c.description,
        })
        .returning({ id: companies.id, name: companies.name });
      companyIdMap.set(inserted.name, inserted.id);
    }
    console.log(`✓ Inserted ${SEED_COMPANIES.length} companies.`);

    // 2. Insert Projects & Project Skills
    let totalProjectSkills = 0;
    for (const p of SEED_PROJECTS) {
      const companyId = companyIdMap.get(p.companyName);
      if (!companyId) continue;

      const [insertedProject] = await db
        .insert(projects)
        .values({
          companyId,
          title: p.title,
          description: p.description,
          category: p.category,
          minExperienceYears: p.minExperienceYears,
          budget: p.budget,
          status: p.status,
        })
        .returning({ id: projects.id });

      for (const s of p.skills) {
        await db.insert(projectSkills).values({
          projectId: insertedProject.id,
          skillName: s.skillName,
          minProficiency: s.minProficiency,
          isRequired: s.isRequired,
          weight: s.weight,
        });
        totalProjectSkills++;
      }
    }
    console.log(`✓ Inserted ${SEED_PROJECTS.length} projects with ${totalProjectSkills} skill requirements.`);

    // 3. Insert Employers & Skills
    let totalEmployerSkills = 0;
    for (const emp of SEED_EMPLOYERS) {
      const [insertedEmp] = await db
        .insert(employers)
        .values({
          name: emp.name,
          roleTitle: emp.roleTitle,
          email: emp.email,
          bio: emp.bio,
          yearsOfExperience: emp.yearsOfExperience,
          avatarUrl: emp.avatarUrl,
          availability: emp.availability,
          location: emp.location,
        })
        .returning({ id: employers.id });

      for (const s of emp.skills) {
        await db.insert(employerSkills).values({
          employerId: insertedEmp.id,
          skillName: s.skillName,
          proficiencyLevel: s.proficiencyLevel,
          yearsExperience: s.yearsExperience,
        });
        totalEmployerSkills++;
      }
    }
    console.log(`✓ Inserted ${SEED_EMPLOYERS.length} employer profiles with ${totalEmployerSkills} verified skills.`);

    // 4. Insert Courses
    for (const crs of SEED_COURSES) {
      await db.insert(courses).values({
        title: crs.title,
        provider: crs.provider,
        url: crs.url,
        skillTag: crs.skillTag,
        difficulty: crs.difficulty,
        duration: crs.duration,
        rating: crs.rating,
        description: crs.description,
        thumbnailUrl: crs.thumbnailUrl,
      });
    }
    console.log(`✓ Inserted ${SEED_COURSES.length} upskilling courses.`);

    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();

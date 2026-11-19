import { pgTable, text, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  industry: text("industry").notNull(),
  website: text("website"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  minExperienceYears: integer("min_experience_years").notNull().default(2),
  budget: text("budget"),
  status: text("status").notNull().default("Open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectSkills = pgTable("project_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  skillName: text("skill_name").notNull(),
  minProficiency: integer("min_proficiency").notNull().default(2), // 1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert
  isRequired: boolean("is_required").notNull().default(true),
  weight: integer("weight").notNull().default(1),
});

export const employers = pgTable("employers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  roleTitle: text("role_title").notNull(),
  email: text("email").notNull(),
  bio: text("bio"),
  yearsOfExperience: integer("years_of_experience").notNull().default(3),
  avatarUrl: text("avatar_url"),
  availability: text("availability").notNull().default("Available"), // Available, Busy, Exploring
  location: text("location").default("Remote"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const employerSkills = pgTable("employer_skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  employerId: uuid("employer_id")
    .references(() => employers.id, { onDelete: "cascade" })
    .notNull(),
  skillName: text("skill_name").notNull(),
  proficiencyLevel: integer("proficiency_level").notNull().default(2), // 1-4
  yearsExperience: integer("years_experience").notNull().default(2),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  provider: text("provider").notNull(),
  url: text("url").notNull(),
  skillTag: text("skill_tag").notNull(),
  difficulty: text("difficulty").notNull().default("Intermediate"), // Beginner, Intermediate, Advanced
  duration: text("duration").notNull(),
  rating: text("rating").default("4.8"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Phase 2: Candidate Learning Progress & Skill Promotion State
export const candidateCourseProgress = pgTable("candidate_course_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  employerId: uuid("employer_id")
    .references(() => employers.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status").notNull().default("In Progress"), // In Progress, Completed
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Phase 4: Staffing Pipeline & Assignment Workflow (ATS)
export const projectPlacements = pgTable("project_placements", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  employerId: uuid("employer_id")
    .references(() => employers.id, { onDelete: "cascade" })
    .notNull(),
  stage: text("stage").notNull().default("Matched"), // Matched, Shortlisted, Interview, In Upskilling, Placed, Archived
  matchScore: integer("match_score").default(0),
  notes: text("notes"),
  assignedRole: text("assigned_role"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  skills: many(projectSkills),
  placements: many(projectPlacements),
}));

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.id],
  }),
}));

export const employersRelations = relations(employers, ({ many }) => ({
  skills: many(employerSkills),
  courseProgress: many(candidateCourseProgress),
  placements: many(projectPlacements),
}));

export const employerSkillsRelations = relations(employerSkills, ({ one }) => ({
  employer: one(employers, {
    fields: [employerSkills.employerId],
    references: [employers.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  candidateProgress: many(candidateCourseProgress),
}));

export const candidateCourseProgressRelations = relations(
  candidateCourseProgress,
  ({ one }) => ({
    employer: one(employers, {
      fields: [candidateCourseProgress.employerId],
      references: [employers.id],
    }),
    course: one(courses, {
      fields: [candidateCourseProgress.courseId],
      references: [courses.id],
    }),
  })
);

export const projectPlacementsRelations = relations(projectPlacements, ({ one }) => ({
  project: one(projects, {
    fields: [projectPlacements.projectId],
    references: [projects.id],
  }),
  employer: one(employers, {
    fields: [projectPlacements.employerId],
    references: [employers.id],
  }),
}));

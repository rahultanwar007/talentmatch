# TalentMatch — AI Talent Matching, Squad Assembly & Upskilling Ecosystem

## Executive Summary & System Overview

**TalentMatch** is an enterprise-grade AI talent-matching, squad-assembly, and upskilling ecosystem built with **Next.js 16 (App Router & Turbopack)**, **Tailwind CSS v4**, **TypeScript**, **Drizzle ORM**, and **PostgreSQL** (Prisma Postgres / Neon / Supabase).

The platform solves the disconnect between hiring requirements, candidate skill profiles, and talent upskilling by providing:
1. **Deterministic, Explainable AI Matching**: Replaces "black-box" scoring with a multi-factor mathematical matching algorithm featuring a canonical skill alias dictionary, weighted required/preferred skill ratios, and experience calibration.
2. **Dynamic Match Studio & Radar Visualizations**: Real-time slider-based weight adjustments, interactive SVG multi-axis skill radar charts, and instant score gauges.
3. **Automated Phased Upskilling Engine**: Bridges talent skill gaps by automatically recommending and sequencing tailored courses from providers like Coursera, Udemy, and edX.
4. **Squad Assembler Studio**: Multi-candidate team assembly engine calculating team coverage, primary competency owners, backup contributors, and redundancy/risk indices.
5. **Full ATS Pipeline Board**: Kanban workflow tracking candidates from *Matched* -> *Shortlisted* -> *In Upskilling* -> *Interview* -> *Placed*.
6. **Market Intelligence & Talent Macro Analytics**: Aggregates platform-wide skill supply vs. demand, tracking shortages, market health scores, and institutional training priorities.
7. **Accessible, Modern Enterprise UX**: Full-width expansive canvas, collapsible sidebar with live DB heartbeat, mobile slide-over Sheet drawer, beginner-friendly "How It Works" guide, and mobile-optimized card fallbacks.

---

## Architecture & Technology Stack

```
Client Browser (Mobile & Desktop)
      │
      ▼
AppShell (Header, Collapsible Sidebar, Mobile Sheet Drawer)
      │
      ▼
Next.js 16 App Router Routes (/match, /squad, /pipeline, /analytics, /courses, /dossier)
      │
      ├── Core Deterministic Engines (lib/engine/)
      │     ├── Matcher (canonical skill alias dictionary & multi-factor scoring)
      │     ├── Squad Assembler (coverage matrix, primary owners, redundancy index)
      │     ├── Market Intelligence (supply vs demand, shortage severity)
      │     └── NLP Skill Extractor (keyword/context skill parsing)
      │
      └── Database Layer (lib/db/)
            ├── Drizzle ORM Schema (PostgreSQL tables & relations)
            ├── Hosted PostgreSQL (Prisma Postgres / Neon / Supabase)
            └── Server Actions (lib/actions/)
```

### Technology Breakdown
* **Framework**: Next.js 16.4.6 with Turbopack & React 19.
* **Styling**: Tailwind CSS v4 with custom CSS variables and `@tailwindcss/turbopack`.
* **Icons & Components**: Lucide React + custom accessible ShadCN UI component suite.
* **Database & ORM**: PostgreSQL via `postgres` & `pg` driver, configured with Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
* **Deployment**: Vercel Serverless with hosted Prisma Postgres.

---

## Core Features & Platform Modules

### 1. Smart Bi-Directional Match Engine (`lib/engine/matcher.ts`)
* **Skill Canonicalization & Alias Dictionary**: Resolves synonyms and shorthand (e.g. `k8s` -> `kubernetes`, `psql` -> `postgresql`, `nextjs` -> `next.js`, `py` -> `python`, `gcp` -> `google cloud`).
* **Multi-Factor Scoring Formula**:
  `Final Score = (Required_Weight * Required_Ratio) + (Preferred_Weight * Preferred_Ratio) + (Experience_Weight * Experience_Ratio)`
* **Skill Gap Categorization**: Splits candidate competencies into *Matched*, *Under-Proficient* (has skill, but below required level), and *Missing* (unmet requirement).
* **Automated Curriculum Roadmap**: Maps missing and under-proficient skills directly to relevant learning courses with difficulty levels and durations.

### 2. Interactive Match Studio (`app/match/page.tsx`)
* **Real-Time Weight Sliders**: Sliders for Required Skills Weight (0–100%), Preferred Skills Weight (0–100%), and Experience Weight (0–100%) with dynamic client-side recalculation.
* **SVG Skill Radar Chart**: Dynamic multi-axis polygon rendering candidate proficiency vs. project requirements.
* **Circular Score Gauge**: Color-coded SVG arc displaying the percentage fit with animated transitions.

### 3. Squad Assembler Studio (`app/squad/page.tsx`)
* **Multi-Candidate Team Composition**: Recruiters can select multiple candidates to form an agile squad against a project.
* **Competency Coverage Matrix**: Calculates overall team coverage score, identifies the primary owner for each skill, and tracks backup contributors.
* **Redundancy & Risk Index**: Flags single points of failure (skills with only 1 owner) and tracks squad safety margins.
* **Mobile Competency Cards**: Automatically switches from a dense table to touch-friendly cards on small screens.

### 4. Candidate ATS Pipeline Board (`app/projects/[id]/pipeline/page.tsx`)
* **Kanban Workflow**: 5 visual stages: *Matched*, *Shortlisted*, *In Upskilling*, *Interview*, *Placed*.
* **Mobile Stage Pills**: Responsive horizontal tab bar on mobile phones (`< 768px`) to quickly switch columns without vertical scrolling.
* **Instant Stage Progression**: One-click advance and quick-assign modal triggers.

### 5. Market Intelligence & Talent Analytics (`app/analytics/page.tsx`)
* **Macro Talent KPIs**: Market Health Score, Critical Shortages, Talent Surpluses, and Top Deficit Categories.
* **Supply vs. Demand Matrix**: Quantifies net talent deficit per skill (Demand - Supply) with severity badges (*Critical Shortage*, *Moderate Shortage*, *Balanced*, *Surplus*).
* **Institutional Upskilling Plan**: Generates prioritized curriculum recommendations for workforce development.

### 6. Candidate Learning & Upskilling Tracker (`app/employers/[id]/page.tsx`)
* **Personal Learning Dashboard**: Enrolled, In Progress, and Completed courses for each employer/candidate.
* **Skill Promotion**: Visual cues showing skills upgraded through completed coursework.

### 7. Executive Match Dossier (`app/dossier/page.tsx`)
* **Print & Export Ready**: Clean, printable summary report designed for C-suite and hiring managers featuring candidate radar, fit breakdown, gaps, and ROI roadmap.

### 8. Enterprise UI/UX & Non-Tech Accessibility
* **Collapsible Modern Sidebar**: Expandable (`w-64`) and compact (`w-20`) modes with hover tooltips and live database heartbeat.
* **Mobile Slide-Over Sheet Drawer**: Accessible drawer menu for mobile screens.
* **Sticky Header**: Dynamic breadcrumbs, global match action, and interactive "How This Works" 3-step modal guide.
* **Zero Cramping**: Removed restrictive `max-w-7xl` constraints across all pages for a modern, expansive full-screen canvas.

---

## The 8+1 Prompt Master Blueprint for Gemini 3.8 Flash in Antigravity

Use these prompts sequentially in a fresh workspace with Antigravity running **Gemini 3.8 Flash**. Each prompt is self-contained, specifies exact file paths and dependencies, and guarantees clean builds at every stage.

---

### Prompt 1: Project Setup, Tooling & Database Core

```text
Initialize this Next.js 16 project with Turbopack, Tailwind CSS v4, TypeScript, and Drizzle ORM connected to PostgreSQL.

Tasks:
1. Ensure the package dependencies include:
   - drizzle-orm, drizzle-kit, postgres, pg, @types/pg
   - lucide-react, clsx, tailwind-merge, class-variance-authority
2. In lib/utils.ts, export the standard `cn(...inputs)` helper using clsx and twMerge.
3. Configure Drizzle in drizzle.config.ts:
   - schema: "./lib/db/schema.ts"
   - dialect: "postgresql"
   - dbCredentials: { url: process.env.DATABASE_URL! }
4. In lib/db/index.ts, configure the Postgres connection pool using postgres / pg with SSL mode support (handling sslmode=require and serverless environments) and export the typed `db` instance initialized with the schema.
5. In package.json scripts, ensure we have:
   - "db:push": "drizzle-kit push"
   - "db:seed": "tsx lib/db/seed.ts"
   - "db:studio": "drizzle-kit studio"
6. Create a root .env.example with DATABASE_URL placeholder.
7. Run `pnpm install` and verify `pnpm build` succeeds.
```

---

### Prompt 2: Relational Schema & Rich Synthetic Data Generator

```text
Define the complete relational database schema in Drizzle ORM and build a rich synthetic data seeder.

Tasks:
1. In lib/db/schema.ts, define the following PostgreSQL tables with UUID primary keys and proper relations:
   - `companies` (id, name, logoUrl, industry, website, description, createdAt)
   - `projects` (id, companyId, title, description, category, minExperienceYears, budget, status, timestamps)
   - `projectSkills` (id, projectId, skillName, minProficiency [1-4], isRequired, weight)
   - `employers` (representing talent/candidates: id, name, roleTitle, email, bio, yearsOfExperience, avatarUrl, availability, location, timestamps)
   - `employerSkills` (id, employerId, skillName, proficiencyLevel [1-4], yearsExperience)
   - `courses` (id, title, provider, url, skillTag, difficulty, duration, rating, description, thumbnailUrl)
   - `candidateCourseProgress` (id, employerId, courseId, status [In Progress, Completed], enrolledAt, completedAt)
   - `projectPlacements` (id, projectId, employerId, stage [Matched, Shortlisted, Interview, In Upskilling, Placed, Archived], matchScore, notes, timestamps)
   - Add Drizzle relations for all tables.
2. In lib/db/seed-data.ts, construct realistic datasets:
   - 6+ diverse companies (Fintech, Healthcare AI, Cloud Infra, E-Commerce, CyberSecurity, CleanTech).
   - 10+ projects with specific required and preferred skills (React, Next.js, TypeScript, Python, PyTorch, Go, Kubernetes, PostgreSQL, AWS).
   - 15+ candidate/employer profiles ranging from Junior to Staff Engineers with realistic skill proficiencies.
   - 25+ real-world upskilling courses from Coursera, Udemy, and edX linked by skillTag.
3. In lib/db/seed.ts, write an idempotent seeding script that wipes existing rows in reverse relational order and inserts all seed data.
4. Test the seeder script compilation with `npx tsx lib/db/seed.ts` (or mock run) and verify schema exports.
```

---

### Prompt 3: Deterministic AI Match Engine & Upskilling Logic

```text
Implement the deterministic mathematical talent-matching and skill gap analysis engine.

Tasks:
1. In lib/engine/types.ts, define interfaces for:
   - MatchWeights (requiredSkillsWeight, preferredSkillsWeight, experienceWeight)
   - SkillMatchResult (skillName, canonicalName, isRequired, requiredProficiency, candidateProficiency, status, ratio, weight)
   - MatchAnalysis (overallScore, requiredSkillsScore, preferredSkillsScore, experienceScore, matchedSkills, underProficientSkills, missingSkills, recommendedCourses)
   - RecommendedCourse (course, targetSkill, priority, rationale)
2. In lib/engine/matcher.ts:
   - Implement `SKILL_ALIASES` dictionary mapping shorthand (e.g. "k8s" -> "kubernetes", "py" -> "python", "nextjs" -> "next.js", "psql" -> "postgresql", "tf" -> "terraform").
   - Implement `canonicalizeSkill(skill: string): string` and `areSkillsEquivalent(a: string, b: string): boolean`.
   - Implement `calculateMatchAnalysis(project, employer, availableCourses, weights)`:
     * Compute weighted required skill fulfillment ratio (0-100%).
     * Compute weighted preferred skill fulfillment ratio (0-100%).
     * Compute experience score based on candidate experience vs. project minimum (capped at 100%).
     * Combine with configurable weights (defaults: 70% required, 15% preferred, 15% experience).
     * Filter missing and under-proficient skills and map them to relevant upskilling courses.
3. In lib/engine/extractor.ts:
   - Implement a keyword and context-aware skill extraction function `extractSkillsFromText(text: string)` that detects technical skills, estimates candidate proficiency, and categorizes skills (Frontend, Backend, Database, Cloud/DevOps, AI/Data).
4. In lib/actions/matching.ts, create server actions to fetch projects, candidates, and compute match analyses with custom weights.
```

---

### Prompt 4: Interactive Match Studio & Visualizations

```text
Build the Interactive Match Studio with real-time dynamic sliders and custom SVG visualizations.

Tasks:
1. Create visual feedback components in components/match/:
   - `match-score-badge.tsx`: Color-coded badge (Green >= 85%, Blue >= 70%, Amber >= 50%, Red < 50%).
   - `match-score-gauge.tsx`: Circular SVG animated gauge showing match percentage, grade, and fit label.
   - `skill-radar-chart.tsx`: Multi-axis SVG radar chart comparing Candidate Proficiency vs. Project Requirements across top 6-8 skills.
   - `skill-gap-list.tsx`: Categorized lists for Matched, Under-Proficient, and Missing skills with proficiency level indicators.
   - `phased-learning-roadmap.tsx`: 3-phase course curriculum roadmap (Phase 1: Critical Gaps, Phase 2: Under-Proficient Skills, Phase 3: Advanced Specialization).
2. In components/match/interactive-match-studio.tsx:
   - Candidate & Project selectors with quick-swap triggers.
   - Interactive weight sliders for Required Skills %, Preferred Skills %, and Experience % with real-time client-side score recalculation.
   - Tabbed view (Skills Breakdown, Learning Roadmap, Radar Analysis).
3. In app/match/page.tsx, load projects and employers from the database and render the interactive studio. Ensure full responsiveness.
```

---

### Prompt 5: Squad Assembler & Team Synergy Studio

```text
Build the Squad Assembler engine and collaborative team-building studio.

Tasks:
1. In lib/engine/squad.ts:
   - Define interfaces for `SquadMemberContribution`, `SquadSkillCoverageItem`, and `SquadAnalysis`.
   - Implement `calculateSquadAnalysis(project, squadMembers, availableCourses, weights)`:
     * For each project skill, scan all squad members to find the highest proficiency level achieved.
     * Assign a Primary Owner (member with highest proficiency & experience) and list Backup Contributors.
     * Calculate squad coverage score, required skill satisfaction count, and redundancy index (skills with >=2 capable members).
     * Aggregate course recommendations for skills still missing across the entire squad.
2. In components/squad/squad-builder-studio.tsx:
   - Build a multi-candidate selection tray with avatar chips and quick removal.
   - Render Macro Squad Stats: Team Coverage %, Primary Owners Count, Combined Experience, Redundancy Safety Margin.
   - Render the Competency Coverage Matrix:
     * Desktop: Detailed table showing Skill, Requirement, Squad Max, Primary Owner, Backup Members, and Status Badge.
     * Mobile (< 640px): Touch-friendly card view displaying skill progress bars, status badges, and contributor avatars.
3. In app/squad/page.tsx, load projects and candidates from the database and connect the Squad Studio.
```

---

### Prompt 6: ATS Kanban Pipeline & Executive Dossier

```text
Build the Project Placement Pipeline Kanban Board and the Printable Executive Match Dossier.

Tasks:
1. In lib/actions/pipeline.ts, implement server actions:
   - `getProjectPipeline(projectId)`: Returns candidates organized by stage (Matched, Shortlisted, In Upskilling, Interview, Placed, Archived).
   - `updatePlacementStage(placementId, newStage)`: Transitions candidate between stages.
   - `assignCandidateToProject(projectId, employerId, stage)`: Creates a new placement.
2. In components/pipeline/project-pipeline-board.tsx:
   - Desktop: 5-column Kanban board with candidate cards showing match score badge, role, experience, and stage advance buttons.
   - Mobile (< 768px): Responsive horizontal pill tab bar (Matched, Shortlisted, In Upskilling, Interview, Placed) with live candidate counts. Selecting a tab displays only that column to eliminate vertical doom-scrolling.
   - Include a "Quick Assign Candidate" dialog modal to add any unassigned candidate directly to a stage.
3. In app/projects/[id]/pipeline/page.tsx, wire up the pipeline board for the selected project.
4. In components/dossier/executive-dossier-view.tsx and app/dossier/page.tsx:
   - Build a print-optimized executive match dossier.
   - Display candidate overview, project requisition context, circular match gauge, multi-axis radar chart, skill gap summary, and course upskilling plan.
   - Add a `window.print()` button formatted with `@media print` CSS utility rules.
```

---

### Prompt 7: Market Intelligence & Candidate Learning Tracker

```text
Build the Market Intelligence Analytics dashboard and candidate personal learning trackers.

Tasks:
1. In lib/engine/analytics.ts:
   - Implement `computeMarketIntelligence(projects, employers, courses)`:
     * Calculate demand count and required proficiency for every skill across all open projects.
     * Calculate talent supply count and average proficiency across all candidate profiles.
     * Compute Net Gap (Demand - Supply) and Shortage Severity Index (Critical Shortage, Moderate Shortage, Balanced, Surplus).
     * Calculate Market Health Score (0-100) and top deficit category.
     * Generate institutional upskilling course priorities.
2. In components/analytics/market-intelligence-dashboard.tsx and app/analytics/page.tsx:
   - Responsive KPI grid for Market Health Score, Tracked Skills, Critical Shortages, and Talent Surpluses.
   - Skill Supply vs. Demand matrix with desktop table and mobile card fallbacks.
   - Institutional training roadmap recommendations.
3. In components/employers/candidate-learning-dashboard.tsx and app/employers/[id]/page.tsx:
   - Candidate profile overview with skills, experience, and contact details.
   - Course progress tracker showing Enrolled, In Progress, and Completed courses with a toggle to update course completion status.
   - Visual indicator showing promoted skills upon course completion.
```

---

### Prompt 8: Enterprise UI Shell, ShadCN Components & Polish

```text
Upgrade the entire UI to an enterprise-grade standard using ShadCN UI components, collapsible navigation, and non-tech accessible design.

Tasks:
1. Build reusable ShadCN UI primitives in components/ui/:
   - tabs.tsx, dialog.tsx, tooltip.tsx, avatar.tsx, alert.tsx, separator.tsx, sheet.tsx, badge.tsx, button.tsx, card.tsx, progress.tsx.
2. Create an accessible beginner guide modal in components/ui/help-guide-modal.tsx:
   - Interactive 3-step walkthrough explaining: 1) What Match Scores Mean, 2) How Squads Work, 3) How Courses Bridge Gaps.
3. In components/sidebar.tsx, build a collapsible desktop sidebar:
   - Expandable (w-64) and compact icon-only (w-20) modes.
   - Categorized links: Main (Dashboard, Match Studio, Squads), Talent & Requisitions (Candidates, Projects), Insights (Analytics, Courses).
   - Tooltips on hover when collapsed.
   - Live PostgreSQL database heartbeat status indicator.
4. In components/header.tsx, build a sticky top navigation header:
   - Dynamic breadcrumb path display.
   - Desktop sidebar toggle button and mobile hamburger button triggering the mobile Sheet drawer.
   - "How This Works" help guide trigger button.
   - Quick "Analyze Match" primary action button.
5. In components/app-shell.tsx, wrap the layout with dynamic desktop margins (lg:pl-64 / lg:pl-20) and mobile Sheet drawer integration. Update app/layout.tsx to wrap all routes in AppShell.
6. Remove any restrictive `max-w-7xl` classes from all pages to give the application an expansive, full-width canvas.
7. Run `pnpm build` to verify 0 TypeScript or Turbopack errors.
```

---

### Prompt 9 (Optional): Cloud Database & Vercel Deployment

```text
Prepare and deploy the application to Vercel with a live Prisma Postgres / Neon database.

Tasks:
1. In .env.local, set the production PostgreSQL connection string:
   DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
2. Run database migration and schema sync:
   `pnpm db:push`
3. Seed the remote database with initial projects, candidates, and courses:
   `pnpm db:seed`
4. In next.config.ts, ensure images and remote patterns allow avatar and logo URLs if using external CDNs.
5. Commit and push the repository to GitHub:
   git add .
   git commit -m "feat: complete enterprise talentmatch platform"
   git push origin main
6. In Vercel Project Settings:
   - Add the `DATABASE_URL` environment variable under Production and Preview environments.
   - Verify deployment build logs and test all routes on the live Vercel URL.
```

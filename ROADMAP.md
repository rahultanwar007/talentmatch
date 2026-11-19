# TalentMatch Pro — Platform Evolution Roadmap

This document outlines the progressive phases to transform **TalentMatch Pro** into a comprehensive, enterprise-grade Talent Intelligence & Upskilling Platform. This file is updated as each phase is completed.

---

## Roadmap Overview & Status

| Phase | Focus Area | Status | Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Interactive Match Intelligence & Upskilling Simulator** | ✅ **Completed** | "What-If" Match Score Projection, Skill Radar Chart, Phased Learning Timeline |
| **Phase 2** | **Candidate Learning Journey & Profile Level-Up** | ✅ **Completed** | Course Enrollment Tracker, "Mark Complete" Action, Dynamic Skill Auto-Promotion |
| **Phase 3** | **Project Squad Builder (Multi-Person Matching)** | ✅ **Completed** | Multi-Candidate Team Assembly, Cumulative Skill Coverage Engine, Squad Gap Matrix |
| **Phase 4** | **Staffing Pipeline & Assignment Workflow (ATS)** | ✅ **Completed** | Candidate Stage Kanban (Matched → Shortlisted → Placed), Auto-Availability Sync |
| **Phase 5** | **Executive Reporting & Market Intelligence** | ✅ **Completed** | Printable Evaluation Dossier, Market Skill Supply vs Demand Analytics, Smart Text Skill Extractor |
| **Design Overhaul** | **Modern Light Theme & Accessibility Redesign** | ✅ **Completed** | Crisp slate palette, high-contrast typography, vibrant functional accents across all 11 routes |

---

## Detailed Phase Breakdown

### Phase 1: Interactive Match Intelligence & Upskilling Simulator
**Objective:** Give users immediate interactive feedback on how completing recommended courses directly elevates candidate compatibility, accompanied by multi-axis visual comparison.

- [x] **1.1 "What-If" Match Score Simulator Engine**:
  - Added pure simulation engine `simulateUpskillingMatch` in `lib/engine/matcher.ts`.
  - Checking courses recalculates projected candidate proficiencies and animates the score gauge in real time (e.g. *65% → 83% → 100%*).
  - Enhanced `components/match/match-score-gauge.tsx` with dual concentric arcs (baseline vs projected), delta badges (`+XX% Boost`), and simulated course count indicators.
- [x] **1.2 Interactive Skill Radar / Spider Chart**:
  - Created `components/match/skill-radar-chart.tsx` with responsive pure SVG geometry.
  - Plots concentric level grids (L1–L4) and dual polygon overlays (Indigo for Project Requirements, Emerald for Candidate Profile).
  - Displays dynamic Cyan dashed polygon when course simulations are active, showcasing projected coverage expansions.
  - Interactive hover state displays exact level benchmarks per vertex.
- [x] **1.3 Phased Learning Pathway & Timeline**:
  - Created `components/match/phased-learning-roadmap.tsx` grouping courses into:
    - *Phase 1 (Critical Missing Prerequisites - Weeks 1–2)*
    - *Phase 2 (Competency & Proficiency Elevation - Weeks 3–4)*
    - *Phase 3 (Bonus & Preferred Specializations - Weeks 5+)*
  - Added dynamic ticker calculating total estimated study hours, "Simulate All" / "Reset" batch toggles, and individual course completion checkboxes.
- [x] **1.4 Match Studio Integration**:
  - Updated `components/match/interactive-match-studio.tsx` with a 3-tab layout (`Gaps`, `Skill Radar Chart`, and `Upskilling Simulator`).

---

### Phase 2: Candidate Learning Journey & Profile Level-Up
**Objective:** Enable candidates to self-manage their skill progression and see their actual verified profile and platform matches permanently improve upon completing courses.

- [x] **2.1 Course Progress State in Database**:
  - Created table `candidate_course_progress` in `lib/db/schema.ts` with fields:
    - `id`, `employerId`, `courseId`, `status` (*In Progress*, *Completed*), `enrolledAt`, `completedAt`.
  - Created Drizzle relations between `employers`, `courses`, and `candidateCourseProgress`.
  - Pushed migration to PostgreSQL 18 via `drizzle-kit push`.
- [x] **2.2 Actionable Learning Server Actions (`lib/actions/learning.ts`)**:
  - Implemented `enrollInCourse(employerId, courseId)` with deduplication.
  - Implemented `getCandidateLearningProgress(employerId)`.
  - Implemented `completeCourseAndPromoteSkill(employerId, courseId)`.
- [x] **2.3 Dynamic Profile Auto-Promotion Engine**:
  - When a course is completed:
    - Automatically checks existing candidate competencies via `areSkillsEquivalent`.
    - If candidate has the skill: promotes proficiency level by +1 (up to Level 4) and increments experience.
    - If candidate lacked the skill: inserts a new verified skill record at Level 2 (or Level 3 for advanced courses).
    - Automatically revalidates all project match rankings across the entire platform.
- [x] **2.4 Interactive Learning Journey UI**:
  - Built `components/employers/candidate-learning-dashboard.tsx` with:
    - Live enrollment metrics (*In Progress*, *Completed Courses*, *Skill Level-Ups*).
    - "Mark Completed & Promote Skill" button with celebratory feedback alert.
    - Suggested upskilling recommendations targeted to bridge profile gaps with one-click "Enroll" button.
  - Built `components/employers/employer-detail-view.tsx` with dual tabs: *Ranked Project Opportunities* & *My Learning Journey*.
  - Added direct "Enroll Candidate" trigger onto course cards in `components/match/course-recommendation-card.tsx` and `components/match/phased-learning-roadmap.tsx`.

---

### Phase 3: Project Squad Builder (Multi-Person Team Matching)
**Objective:** Enable companies to staff projects requiring diverse specializations by assembling a composite team rather than relying on a single individual.

- [x] **3.1 Squad Builder Engine (`lib/engine/squad.ts`)**:
  - Implemented **Cumulative Squad Coverage**:
    $$\text{SquadSkillCoverage}(s) = \max_{e \in \text{Squad}} \Big(\text{Proficiency}_e(s)\Big)$$
  - Multi-candidate skill aggregation across required and preferred requirements.
  - Primary skill owner determination (identifies highest proficiency and highest experience candidate per skill).
  - Backup redundancy depth tracking (counts multiple qualified members for risk mitigation).
  - Team experience metrics (combined and average experience years).
  - Residual team gap detection and targeted course recommendations for uncovered squad skills.
- [x] **3.2 Squad Assembly Studio (`components/squad/squad-builder-studio.tsx` & `/squad`)**:
  - Built interactive studio allowing selection of any company project and dynamic multi-selection of candidates.
  - Real-time squad metrics bar: Cumulative Squad Coverage %, Required Skills Coverage %, Satisfied Requirements ratio, Redundant Skills count, and Combined Experience.
  - Visual Squad Roster strip with quick "Remove" chips and candidate summaries.
  - Interactive Candidate Picker with live search, role filters, and quick "+ Add to Squad" / "- Remove" toggle buttons.
  - **Squad Competency Matrix Table**:
    - Displays each project requirement, required level, squad maximum proficiency, and status badge (*Covered*, *Partial Gap*, *Uncovered*).
    - Highlights **Primary Lead** candidate chip and **Backup Contributors** chips with their respective proficiency levels.
  - Residual Gap Recommendations: Displays curated upskilling courses for any skills still unfulfilled by the combined team.
- [x] **3.3 Navigation & Project Details Integration**:
  - Created dedicated `/squad` page route with `projectId` query param support (`app/squad/page.tsx`).
  - Added "Squad Builder" navigation link with `Layers` icon to top navbar (`components/navbar.tsx`).
  - Added "Assemble Squad" CTA button to project detail page (`app/projects/[id]/page.tsx`).

---

### Phase 4: Staffing Pipeline & Assignment Workflow (ATS)
**Objective:** Provide an end-to-end operational pipeline to track candidate progression from initial match to formal placement.

- [x] **4.1 Placement & Application Schema**:
  - Added `project_placements` table in `lib/db/schema.ts`:
    - `id`, `projectId`, `employerId`, `stage` (*Matched*, *Shortlisted*, *Interview*, *In Upskilling*, *Placed*, *Archived*), `matchScore`, `notes`, `assignedRole`, `createdAt`, `updatedAt`.
  - Configured Drizzle relations between `projects`, `employers`, and `project_placements`.
  - Pushed migration to PostgreSQL 18 via `drizzle-kit push`.
- [x] **4.2 Actionable Pipeline Server Actions (`lib/actions/pipeline.ts`)**:
  - `getProjectPipeline(projectId)`: fetches all placements with employer details and recalculated live match scores.
  - `updatePlacementStage(placementId, newStage, notes)`: transitions candidate across stages with automatic availability synchronization.
  - `addCandidateToPipeline(projectId, employerId, stage, notes, assignedRole)`: adds or updates candidate placement.
  - `removeCandidateFromPipeline(placementId)`: removes candidate and restores availability if needed.
  - `getCandidatePlacements(employerId)`: fetches all active project engagements for candidate profile.
- [x] **4.3 Automatic Availability Synchronization**:
  - Marking candidate stage as *Placed* locks candidate profile `employers.availability` to `"Assigned"`, preventing double-booking.
  - Demoting candidate from *Placed* or removing placement verifies other active placements and automatically restores availability to `"Available"`.
- [x] **4.4 Interactive Kanban Pipeline UI (`components/pipeline/project-pipeline-board.tsx` & `/projects/[id]/pipeline`)**:
  - 5-column ATS Kanban Board: *Matched Pool*, *Shortlisted*, *In Evaluation (Interview)*, *In Upskilling*, and *Placed / Staffed*.
  - Fast stage navigation: `←` / `→` shift buttons and stage selector dropdown.
  - Inline note editor for interview feedback and technical screening notes.
  - Search filter (name, role, skills, notes) and minimum match score filter (≥50%, ≥70%, ≥85%).
  - Slide-in "Add Candidate to Pipeline" modal with talent search and initial stage assignment.
- [x] **4.5 Cross-Platform ATS Integrations**:
  - Project Detail Page (`/projects/[id]`): Added "Staffing Pipeline (ATS)" CTA button with purple accent.
  - Candidate Profile View (`/employers/[id]`): Added Tab 3 ("Staffing Pipeline & Placements") showing candidate's active placements and direct links to project ATS boards.
  - Match Studio (`/match`): Added "Add to Staffing Pipeline" quick action to instantly promote high-match candidates into the project pipeline.

---

### Phase 5: Executive Reporting & Market Intelligence
**Objective:** Deliver executive-grade analytics and AI-assisted data ingestion for hiring directors and staffing leaders.

- [x] **5.1 One-Click Executive Candidate Dossier (PDF / Printable Report)**:
  - Created `components/dossier/executive-dossier-view.tsx` & `/dossier` route (`app/dossier/page.tsx`):
    - Formal executive placement memo with `@media print` layout formatting.
    - Executive compatibility scorecard (Overall Score, Must-Haves, Bonus, Experience).
    - Verified competency vs requirement audit table.
    - Prescribed upskilling curriculum and risk mitigation section.
    - Formal placement sign-off signature blocks.
    - One-click "Print / Save PDF" browser trigger.
- [x] **5.2 Market Skill Supply vs. Demand Intelligence (`/analytics`)**:
  - Implemented `lib/engine/analytics.ts` (`computeMarketIntelligence`):
    - Macro health index, talent staffing rates, and critical deficit domain identification.
    - **Skill Shortage Index**: Detects high-demand skills with low/zero bench supply (e.g., *Kafka, Kubernetes*).
    - **Skill Surplus Index**: Highlights technologies with abundant available supply.
    - **Institutional Upskilling Recommendations**: Identifies high-ROI courses organizations should sponsor.
    - Comparative Supply vs Demand Matrix with visual dual-progress balance bars.
- [x] **5.3 Smart Job Description & Resume Skill Extractor**:
  - Implemented `lib/engine/extractor.ts` (`extractSkillsFromText`):
    - Scans freeform text against `SKILL_ALIASES` taxonomy.
    - Infers proficiency levels (Beginner L1, Intermediate L2, Advanced L3, Expert L4) from context keywords and years of experience.
    - Detects requirement priority (Must-Have vs Bonus/Nice-to-Have).
    - Built into `/analytics` dashboard with sample FinTech job specs and candidate resume presets.
- [x] **5.4 Navigation & Match Studio Integration**:
  - Added "Market Analytics" item with `BarChart3` icon to navbar (`components/navbar.tsx`).
  - Added "Executive Placement Dossier" action card in Match Studio (`components/match/interactive-match-studio.tsx`).

---

## Phase Execution History & Changelog

| Date | Phase | Status | Summary of Delivered Changes |
| :--- | :---: | :---: | :--- |
| **2026-11-19** | **Phase 1** | **✅ Completed** | • Added `simulateUpskillingMatch` in `lib/engine/matcher.ts`<br/>• Built `SkillRadarChart` SVG polygon component (`components/match/skill-radar-chart.tsx`)<br/>• Built `PhasedLearningRoadmap` with 3-phase curriculum, study hours, and simulation checkboxes (`components/match/phased-learning-roadmap.tsx`)<br/>• Enhanced `MatchScoreGauge` with dual-arc projection rendering and delta boosts (`components/match/match-score-gauge.tsx`)<br/>• Integrated tabs and simulation state into `components/match/interactive-match-studio.tsx`. |
| **2026-11-19** | **Phase 2** | **✅ Completed** | • Created `candidate_course_progress` table and relations in `lib/db/schema.ts` and pushed to PostgreSQL 18<br/>• Built `lib/actions/learning.ts` (`enrollInCourse`, `completeCourseAndPromoteSkill`, `getCandidateLearningProgress`)<br/>• Built `CandidateLearningDashboard` with metric cards and "Mark Completed & Promote Skill" action (`components/employers/candidate-learning-dashboard.tsx`)<br/>• Built `EmployerDetailView` with dual-tab interface (`components/employers/employer-detail-view.tsx`)<br/>• Added direct candidate enrollment trigger to `CourseRecommendationCard` and `RoadmapCourseCard`<br/>• Verified via database unit test and production build. |
| **2026-11-19** | **Phase 3** | **✅ Completed** | • Built `lib/engine/squad.ts` for multi-member cumulative skill coverage, primary ownership, backup redundancy depth, and residual gap identification<br/>• Built `SquadBuilderStudio` (`components/squad/squad-builder-studio.tsx`) with interactive multi-candidate selector, live coverage gauge, Competency Matrix, and team upskilling suggestions<br/>• Created `/squad` route (`app/squad/page.tsx`) with preselected `projectId` support<br/>• Integrated "Assemble Squad" CTA on Project Detail page and "Squad Builder" in navbar<br/>• Tested engine and verified production build with zero errors. |
| **2026-11-19** | **Phase 4** | **✅ Completed** | • Created `project_placements` table in `lib/db/schema.ts` and pushed to PostgreSQL 18<br/>• Built `lib/actions/pipeline.ts` with automatic availability sync (*Available* ↔ *Assigned*)<br/>• Built `ProjectPipelineBoard` (`components/pipeline/project-pipeline-board.tsx`) 5-stage ATS Kanban with fast stage shift, inline notes, search, and "Add Candidate" modal<br/>• Created `/projects/[id]/pipeline` route (`app/projects/[id]/pipeline/page.tsx`)<br/>• Integrated ATS CTA on Project Detail, candidate placements tab on Profile View, and "Add to Pipeline" on Match Studio<br/>• Verified via database unit test and production build. |
| **2026-11-19** | **Phase 5** | **✅ Completed** | • Built `lib/engine/analytics.ts` for comparative supply vs demand, shortage/surplus indices, and institutional upskilling ROI<br/>• Built `lib/engine/extractor.ts` for regex/taxonomy-based skill extraction with inferred proficiencies (L1–L4)<br/>• Created `/analytics` route & `MarketIntelligenceDashboard` with macro KPIs, supply vs demand balance bars, and live text extractor<br/>• Created `/dossier` route & `ExecutiveDossierView` with printable PDF memo, compatibility scorecard, and sign-off blocks<br/>• Integrated "Market Analytics" in navbar and "View Dossier" in Match Studio<br/>• Verified via unit tests and clean Next.js production build. |

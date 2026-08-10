# SchulOS - Worklog

## Project Status Description

**Status: Phase 10 - Project pulled from GitHub, database seeded, navigation consolidated**

SchulOS is a free, open-source school management system focused on competency-based assessment and grading. Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and SQLite.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM + **SQLite (only - no other DB)**
- **Auth**: Self-hosted email/password with argon2id hashing, session cookies
- **i18n**: German + English

### Key Facts
- **License**: Custom non-commercial license (free for schools, no selling, revenue must be donated to environmental protection)
- **Mission**: Reduce paper consumption in schools (environmental protection)
- **Database**: SQLite only (`provider = "sqlite"`, file-based at `db/custom.db`)
- **GitHub**: https://github.com/cetinmustafa83/schulos
- **Demo Login**: demo@competencetrack.org / Demo2025!

### Seeded Data
- School: Grundschule Am Park (ELEMENTARY, Berlin)
- School Year: 2025/2026
- Classes: 3a (8 students), 3b (7 students) - 15 total
- Subjects: Mathematik, Deutsch
- Competencies: 14 (7 Math + 7 German)
- Progress entries: 30
- Assessments: 1 with 8 results
- Grading: 1 scheme (Noten 1-6)
- Parents: 21 contacts, 8 messages
- Behavior: 6 categories, 10 incidents
- Rubrics: 3
- Comment bank: 5 categories, 12 entries
- Audit logs: 5

## Current Goals / Completed Modifications / Verification Results

### Phase 10 Completed Work

#### 1. Project Setup
- Pulled project from GitHub repo
- Configured git authentication with token (saved to `/home/z/.git-credentials`)
- Installed dependencies with `bun install`
- Fixed Prisma schema validation errors (missing relation fields for ClassMessagingLock and EscalationPolicy)
- Pushed schema fix to GitHub

#### 2. Database Setup
- Confirmed SQLite-only configuration (`provider = "sqlite"`)
- Ran `bun run db:push` to create database schema
- Ran `bun run db:seed` to populate full demo data (school, classes, students, subjects, competencies, etc.)
- Updated `prisma/seed-demo.ts` to link demo accounts to the existing school (instead of creating a separate "Demo Schule")
- All 5 demo accounts now have access to seeded data

#### 3. Navigation Consolidation
- Refactored sidebar navigation from 3 groups (Analysis, Teaching, Setup) into 5 consolidated sections per TODO.md:
  1. **Home** (Start) - Dashboard, Notifications
  2. **Teach** (Unterricht) - Classes, Progress, Assessments, Grading, Reports, Attendance, Homework, Lesson Plans, Resources, Notebooks, Drawing, Portfolio, Rubrics, Comments, Peer Assessment, Tablet Grading, Seating, Subjects, Competitions (19 items)
  3. **School Life** (Schulleben) - Calendar, Communication, Announcements, Events, Newsletter, Library, Transport, Counseling, Wellness, Career, Discipline, Behavior, Illness, Substitutes, Timetable, Exam Calendar, Parents (17 items)
  4. **Insights** (Erkenntnisse) - Competence Flower, Mastery Matrix, Analytics, Coverage, Grade Analytics, Reports, AI Tests, Data Import/Export (8 items)
  5. **Administration** (Verwaltung) - Competencies, Districts, Settings (3 items)
- Added i18n keys for new section labels (DE + EN)
- Pushed to GitHub

#### 4. Bug Fixes
- Fixed Prisma schema: Added missing `schoolId` field and `school` relation to `ClassMessagingLock` model
- Fixed Prisma schema: Added `escalationPoliciesOverridden` and `classMessagingLocksLocked` relation fields to `User` model
- Fixed Prisma schema: Added `classMessagingLocks` relation to `ClassGroup` model
- Fixed Prisma schema: Added relation names to avoid ambiguity (`"EscalationOverriddenBy"`, `"ClassMessagingLockLockedBy"`)
- Fixed seed-demo.ts: Now uses existing school from seed.ts instead of creating a duplicate

### Verification Results
- ✅ Lint passes with 0 errors
- ✅ Dev server runs on port 3000
- ✅ All demo accounts login successfully
- ✅ Dashboard shows real data (15 students, 2 classes, 21 parents, enrollment chart, grade distribution)
- ✅ Navigation consolidated into 5 sections (verified via browser)
- ✅ All commits pushed to GitHub

### Commits Pushed
1. `9b9115c` - Fix: Prisma schema - add missing relation fields for ClassMessagingLock and EscalationPolicy
2. `9f26c6d` - Fix: seed-demo now links demo accounts to existing school
3. `688a91a` - Refactor: Consolidate sidebar navigation into 5 top-level sections

## Unresolved Issues or Risks, Priority Recommendations for Next Phase

### Known Issues
1. **Onboarding tour** - Appears on every login, may need to be dismissible permanently
2. **WebSocket connection** - CT-WS connection timeout warnings in console (real-time features may not work in dev)
3. **PWA install prompt** - Shows "Install SchulOS" dialog on load, may want to delay or suppress in dev

### Priority Recommendations for Phase 11
1. **Page Tab Consolidation** - Implement tabs within pages (e.g., Classes page should have tabs: Overview, Students, Subjects, Staff, Timetable, Seating, Attendance, Competencies)
2. **Remove Duplicate Sidebar Entries** - After tab consolidation, remove standalone entries that now belong as tabs
3. **School Policy DB Records** - Move configurable policies, thresholds, and escalation windows into database-backed school policy records
4. **Authorization Tests** - Add server-side authorization tests including cross-school IDOR attempts
5. **Mobile/Tablet Optimization** - Ensure 44x44px minimum touch targets and keyboard/screen-reader support
6. **PDF Report Generation** - Implement @react-pdf/renderer for report cards
7. **Digital Notebook Enhancement** - Ensure stylus/pen support works on iPad
8. **AI Features** - Evaluate CoreAI/ZeroClaw integration needs

### Files Modified in Phase 10
- `/home/z/my-project/prisma/schema.prisma` - Fixed 4 relation validation errors
- `/home/z/my-project/prisma/seed-demo.ts` - Updated to use existing school
- `/home/z/my-project/src/components/app-layout.tsx` - Consolidated navigation into 5 sections
- `/home/z/my-project/src/lib/i18n.ts` - Added i18n keys for new nav sections

### Key Files to Reference
- `/home/z/my-project/prisma/schema.prisma` - Full database schema (SQLite)
- `/home/z/my-project/prisma/seed.ts` - Main seed script (creates school, classes, students, etc.)
- `/home/z/my-project/prisma/seed-demo.ts` - Demo account creation
- `/home/z/my-project/src/components/app-layout.tsx` - Main layout with navigation
- `/home/z/my-project/src/lib/navigation-config.ts` - Navigation configuration
- `/home/z/my-project/src/lib/i18n.ts` - German/English translations
- `/home/z/my-project/PRD.md` - Full product requirements document
- `/home/z/my-project/TODO.md` - Execution plan and remaining tasks

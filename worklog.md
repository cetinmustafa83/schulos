# SchulOS - Worklog

## Project Status Description

**Status: Phase 11 - Architecture audit, i18n, UX fixes complete**

SchulOS is a free, open-source school management system focused on competency-based assessment and grading. Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and SQLite (only).

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM + **SQLite (only - no other DB)**
- **Auth**: Self-hosted email/password with argon2id hashing, session cookies
- **i18n**: German + English (all UI text via t() function)
- **AI**: AI Studio with SnapGen video gen, Perchance image gen, agentic chat (teachers/admins only)
- **PWA**: Installable, offline support, push notifications

### GitHub
- Repo: https://github.com/cetinmustafa83/schulos
- Demo Login: demo@competencetrack.org / Demo2025!

## Current Goals / Completed Modifications / Verification Results

### Phase 11 Completed Work

#### Architecture Audit & Cleanup
1. **Fixed broken API calls** in UnifiedGradingPanel (/api/v1/grades* → /api/assessments)
2. **Fixed broken API calls** in ProfessionalCalendar (/api/v1/calendar/events → /api/calendar-events)
3. **Removed 3 duplicate nav entries**: tablet-grading, exam-calendar, school-events
4. **Deleted 4 orphan files** (-1008 lines): grading-panel.tsx, notification-hub.tsx, unified-nav-menu.tsx, navigation-config.ts
5. **Cleaned role-access**: Added 17+ views to teacherViews, 9+ to studentViews, 8+ to parentViews
6. **Removed 92 orphaned i18n keys** (tablet_grading.*)
7. **Removed stale ViewName entries**: tablet-grading, exam-calendar, school-events

#### Feature Enhancements
1. **Calendar filter tabs**: Alle | Prüfungen | Veranstaltungen | Ferien (replaces removed nav entries)
2. **Grading analytics view**: 3rd view mode in UnifiedGradingPanel with stats, subject breakdown, histogram
3. **AI Studio**: 4-tab module (Video, Image, Lesson Plan, AI Agent) - teachers/admins only
   - SnapGen AI video generation API
   - Perchance AI image generation API
   - "Save to Lesson" feature linking AI content to SubjectLesson
   - Access control: students/parents see "Kein Zugriff"

#### UX Fixes
1. **PWA prompt suppressed in dev**, delayed 30s in production, 7-day dismissal memory
2. **Onboarding tour respects "Don't show again"** preference
3. **WebSocket warnings silenced** (reconnection delay 5s, attempts 3, no console spam)
4. **Digitale Hefte sizing fixed**: h-[calc(100vh-8rem)] with overflow-hidden

#### Compliance Fixes
1. **Removed all emojis** from UI code (Lucide icon names instead)
2. **44px touch targets** enforced via @media (pointer: coarse) CSS
3. **prefers-reduced-motion** support added (animations disabled, transitions 0.01ms)
4. **i18n**: All hardcoded English strings replaced with German in:
   - UnifiedGradingPanel (labels, filters, statuses, buttons)
   - ProfessionalCalendar (buttons, dialog, toast messages)
   - subjects-view (placeholders)
   - AI Studio (confirmed German throughout)

### Verification Results
- ✅ All 41 teacher modules load without crashes
- ✅ Lint passes with 0 errors
- ✅ No console errors or warnings
- ✅ No emojis in src/ (verified with Python script)
- ✅ German text confirmed in grading, calendar, AI Studio

### Commits Pushed (Phase 10-11)
1. `9b9115c` - Fix Prisma schema validation errors
2. `9f26c6d` - Fix seed-demo to use existing school
3. `688a91a` - Consolidate navigation into 5 sections
4. `c078ec3` - Update worklog Phase 10
5. `763ebef` - Add AI Studio with SnapGen/Perchance
6. `fe3eb4a` - Restrict AI Studio to teachers/admins + Save to Lesson
7. `411ff14` - Fix Digitale Hefte sizing
8. `1af01dd` - Architecture audit: Fix broken APIs, remove duplicates
9. `af0b0a5` - Cleanup: Remove dead nav items, orphaned i18n keys
10. `0c7a69f` - Add calendar filter tabs and grading analytics
11. `13fce9d` - Fix UX: Suppress PWA, respect onboarding, silence WS
12. `678a4e9` - Compliance: Remove emojis, add touch targets, reduced-motion
13. `7461f76` - i18n: Replace hardcoded English with German

## Unresolved Issues or Risks

### Known Limitations
1. **Auth is session-based** - No real NextAuth.js integration yet
2. **WebSocket (real-time collaboration)** - Mini-service not running, falls back silently
3. **UnifiedGradingPanel** - Uses assessments API (not a dedicated grades API); data transformation bridges the gap
4. **Bulk results API** - `/api/assessments/bulk-results` may not exist yet
5. **Student/parent nav** - Some declared items may still be filtered by role-access

### Priority Recommendations for Next Phase
1. **Page Tab Consolidation** - Implement tabs within Classes page (Overview, Students, Subjects, Staff, Timetable, Seating, Attendance, Competencies)
2. **Student Detail Page** - Consolidate student workflows into tabs (Overview, Progress, Assessments, Reports, Attendance, Wellbeing, Goals, Notebook, Portfolio, Support)
3. **School Policy DB Records** - Move configurable policies into database-backed records
4. **PDF Report Generation** - Implement @react-pdf/renderer for report cards
5. **Digital Notebook Enhancement** - Ensure stylus/pen support works on iPad
6. **Server-side Authorization Tests** - Cross-school IDOR attempt tests
7. **Docker Support** - Dockerfile for easy self-hosted deployment

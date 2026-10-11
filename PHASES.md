# CareThread CRM — Three-Phase Implementation Roadmap

This document outlines the three-phase roadmap for building **CareThread**, a hospital patient-records CRM system with role-based access control (RBAC), Row Level Security (RLS), Supabase Realtime, and Gemini AI clinical summaries.

---

## Permission Matrix Reference
| Module / Data | Admin | Receptionist | Doctor | Nurse | Patient / Guardian |
|---|---|---|---|---|---|
| **Accounts & Roles** | Full Access (RW) | None | None | None | None |
| **Patient Demographics** | Read Only (R) | Full Access (RW) | Read Only (R) | Read Only (R) | Read (Own + Wards) |
| **Families & Relationships** | Read Only (R) | Full Access (RW) | Read Only (R) | Read Only (R) | Read (Own) |
| **Visits & Diagnoses** | None | None | Full Access (RW) | Read Only (R) | Read (Own + Wards) |
| **Vitals Records** | None | None | Full Access (RW) | Full Access (RW) | Read (Own + Wards) |
| **Medicine Cycles** | None | None | Full Access (RW) | Full Access (RW) | Read (Own + Wards) |
| **Family Medical History** | None | None | Full Access (RW) | Read Only (R) | Read (Own + Wards) |
| **AI Clinical Summaries** | None | None | Full Access (RW) | Full Access (RW) | None |

---

## 🟢 Phase 1: Foundation, Security & Front Desk Module
> **Status: COMPLETED ✅**

### Goals & Deliverables
1. **Infrastructure & Database Architecture**:
   - Next.js 16 (App Router, TypeScript) + Tailwind CSS v4 + shadcn/ui.
   - Postgres schema in `supabase/migrations/001_init.sql` with full table definitions (`profiles`, `patients`, `families`, `family_members`, `patient_relationships`, `family_history`, `visits`, `vitals`, `medicine_cycles`, `summaries`).
   - Row Level Security (RLS) policies on all tables.
   - Helper functions: `app_role()`, `my_patient_id()`, `can_view_patient()`, and automatic relationship inversion trigger `trg_inverse_relationship`.
   - TypeScript database interface (`types/database.ts`).
2. **Authentication & Role Guards**:
   - Supabase SSR clients: `client.ts` (browser), `server.ts` (cookies), `admin.ts` (service role).
   - `requireRole(allowed: Role[])` server-side authorization guard.
   - Session management and unauthenticated route redirection in middleware.
   - Unified `/login` page with automatic role-based redirect.
   - Protected `/forbidden` error page.
3. **Application Shell & Design System**:
   - High-contrast clinical dark theme with teal accents.
   - Responsive `Sidebar` component displaying active states, role badges, and role-permitted navigation links.
4. **Admin Module (`/admin`)**:
   - Admin dashboard with system metrics (staff count, patient count).
   - Staff directory (`/admin/staff`) displaying all registered staff and roles.
   - Staff account creation (`/admin/staff/new`) with Zod validation and atomic rollback.
5. **Front Desk / Receptionist Module (`/receptionist`)**:
   - Receptionist dashboard with recent registrations.
   - Searchable patient directory (`/receptionist/patients`) with real-time URL search.
   - Patient intake registration (`/receptionist/patients/new`) with `PatientForm`.
   - Patient record viewing and editing (`/receptionist/patients/[id]`).
   - Patient portal account provisioning server action.
6. **Data Seeding & Verification**:
   - Seed script (`scripts/seed.ts`) populating demo accounts for all 5 roles and ~10 realistic patient records with families.
   - Production build verification (`npm run build` passing with 0 errors).

---

## 🟢 Phase 2: Clinical Care, Family Management & Realtime Updates
> **Status: COMPLETED ✅**

### Goals & Deliverables
1. **Doctor Clinical Module (`/doctor`)**:
   - Doctor patient directory and active case list.
   - Comprehensive `PatientProfile` component with tabbed navigation:
     - **Overview**: Patient demographics, allergies, recent vitals, latest visit.
     - **Visits**: Chronological clinical encounters, symptom logs, diagnoses, doctor notes.
     - **Medicines**: Active medication cycles, dosages, schedules.
     - **Family**: Household tree, emergency contacts, hereditary conditions.
     - **AI Summary**: Clinical summary viewer.
   - Clinical visit documentation form (`VisitForm`) with diagnoses and symptoms.
   - Family medical history recording (`family_history`).
2. **Nurse Clinical Module (`/nurse`)**:
   - Dedicated vitals recording station (`bp_systolic`, `bp_diastolic`, `pulse`, `temp_c`, `weight_kg`).
   - `MedicineCycleTable` with inline cycle status management (`active`, `completed`, `stopped`).
3. **Family Management Module**:
   - Family household creation and management at the front desk.
   - Shared address/phone prefilling for family members.
   - Kinship relationship linking with bidirectional auto-sync (parent/child, guardian/ward, spouse, sibling).
   - Emergency contact designations and soft-removal support.
4. **Supabase Realtime Synchronization**:
   - Postgres Realtime publication on `visits`, `vitals`, and `medicine_cycles`.
   - Live browser listeners on `PatientProfile` filtered by `patient_id`.
   - Zero-reload updates (e.g., doctor profile automatically reflects vitals entered by a nurse).

---

## 🔵 Phase 3: AI Clinical Summary, Patient Portal, Hardening & Deployment
> **Status: QUEUED**

### Goals & Deliverables
1. **Gemini AI Clinical Summaries**:
   - Server-side route handler `/api/summary` utilizing Google Gen AI SDK (`@google/genai`).
   - Executed under caller's Supabase session (RLS strictly enforced: doctor/nurse only).
   - Sanitized clinical data aggregation (`<data>` tag isolation against prompt injection).
   - Plain-language health overview generation with verification disclaimer.
   - `SummaryCard` component with loading skeletons and persistence in `summaries` table.
2. **Patient & Guardian Portal (`/patient`)**:
   - Read-only patient view for own medical records, prescriptions, and visit histories.
   - Guardian / Dependent switcher allowing parents/guardians to review minors' records via `can_view_patient()`.
3. **Security Testing & Automated Verification**:
   - Test suite `scripts/test-rls.ts` validating all rows in the permission matrix across all 5 roles.
   - Receptionist isolation test (no access to clinical visits/vitals/medicines).
   - Role escalation prevention test (profiles cannot be self-updated).
   - Log audit ensuring zero PII leakage.
4. **Production Deployment & Handover**:
   - Vercel deployment configuration with environment variable checklist.
   - Supabase cloud project linking and migration execution.
   - Comprehensive README with setup, seeding, and demo credentials.

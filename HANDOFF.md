# CareThread CRM — Agent Handoff Document

> **Target Audience**: Next AI Agent / Developer continuing the project.  
> **Status**: **Phase 1 and Phase 2 are COMPLETE and verified.** Ready to begin **Phase 3**.  
> **Repository Root**: `c:\Users\FaLL3n\Documents\Projects\CRM`  
> **App Directory**: `c:\Users\FaLL3n\Documents\Projects\CRM\carethread`

---

## 1. Project Context & Purpose

CareThread is a hospital patient-records CRM system with strict role-based access control (RBAC).
- **Core Security Rule**: Security is enforced at the database layer using Postgres **Row Level Security (RLS)** in Supabase. Server-side checks via `requireRole()` serve as a second layer of defense.
- **Roles**:
  - `admin`: Manages staff accounts.
  - `receptionist`: Manages patient intake, searches records, provisions portal accounts, manages families.
  - `doctor`: Conducts clinical visits, records diagnoses/symptoms, reviews vitals and medicines, records family medical history.
  - `nurse`: Records patient vitals, manages medicine cycle statuses.
  - `patient`: Read-only portal for own records, prescriptions, and wards/dependents (as guardian).
- **Important**: All data is synthetic / fake for demonstration. Real patient data must never be stored.

---

## 2. Current Codebase State (Phase 1 & Phase 2 Complete)

### Build & Verification Status
- **`npm run build`**: ✅ **PASSING (Exit Code 0)** — All 21 App Router routes compile and generate cleanly.
- **`npm run lint`**: ✅ **PASSING (Exit Code 0)** — 0 errors, 0 warnings across `app`, `components`, and `lib`.
- **TypeScript**: ✅ Strict mode passing without type errors.

### Complete Route Map
```
Route (app)
┌ ƒ /                               # Root role-based redirect
├ ○ /_not-found                     # 404
├ ƒ /admin                          # Admin metrics dashboard
├ ƒ /admin/staff                    # Staff directory
├ ƒ /admin/staff/new                # New staff registration (admin only)
├ ƒ /doctor                         # Doctor clinical dashboard & recent consultations
├ ƒ /doctor/patients                # Doctor searchable patient directory
├ ƒ /doctor/patients/[id]           # Doctor full 5-tab PatientProfile chart
├ ○ /forbidden                      # 403 Forbidden page
├ ○ /login                          # Email/Password login page with auto role redirection
├ ƒ /nurse                          # Nurse Station dashboard & recent vitals
├ ƒ /nurse/patients                 # Nurse patient station with quick vitals recording
├ ƒ /nurse/patients/[id]            # Nurse full 5-tab PatientProfile chart
├ ƒ /patient                        # Patient portal placeholder (Phase 3)
├ ƒ /receptionist                   # Receptionist intake & family dashboard
├ ƒ /receptionist/families          # Directory of family households
├ ƒ /receptionist/families/[id]     # Family detail manager (members, emergency, kinship)
├ ƒ /receptionist/families/new     # Create new family household unit
├ ƒ /receptionist/patients          # Searchable patient directory
├ ƒ /receptionist/patients/[id]     # Patient overview & demographic editing
└ ƒ /receptionist/patients/new      # Patient intake registration
```

### Complete Components & Actions Map
```
components/
├── PatientProfile.tsx              # 5-Tab clinical chart (Overview, Visits, Meds, Family, AI Summary)
├── VisitForm.tsx                   # Clinical encounter modal (doctor only)
├── VitalsForm.tsx                  # Vital signs modal (doctor/nurse)
├── MedicineCycleTable.tsx          # Medication cycles with inline status updates & prescribe dialog
├── FamilyPanel.tsx                 # Household overview, kinship tags, hereditary conditions
├── FamilyDetailManager.tsx         # Receptionist member addition & kinship linking
├── RealtimeSubscriber.tsx          # Supabase Realtime channel listener (auto router.refresh())
├── Sidebar.tsx                     # Role-filtered navigation sidebar
├── PatientForm.tsx                 # Reusable intake/edit patient form
└── ui/                             # shadcn primitives (button, card, dialog, input, label, tabs, etc.)

app/(app)/clinical/actions.ts:
├── createVisit                     # Doctor records clinical visit (doctor_id = user.id)
├── createVitals                    # Doctor/Nurse records vitals (recorded_by = user.id)
├── createMedicineCycle             # Doctor prescribes medication (prescribed_by = user.id)
├── updateMedicineCycleStatus       # Doctor/Nurse updates status (active, completed, stopped)
└── createFamilyHistory             # Doctor records hereditary condition

app/(app)/receptionist/family-actions.ts:
├── createFamily                    # Receptionist creates household unit
├── addFamilyMember                 # Adds patient to household (enforces one active family rule)
├── removeFamilyMember              # Soft-removes patient from family (sets removed_at)
└── createPatientRelationship       # Links kinship (trigger auto-creates inverse row!)
```

---

## 3. Technical Decisions & Bug Fixes

1. **DialogTrigger `asChild` Support**:
   - Updated `components/ui/dialog.tsx` to handle `asChild?: boolean` using Base UI's `render` prop (`render={children as React.ReactElement}`).
2. **React 19 Pure Render Rule**:
   - `PatientProfile` calculates patient age using a pure helper defined outside the component, avoiding `Date.now()` during render.
3. **Multi-User Realtime Synchronization**:
   - `components/RealtimeSubscriber.tsx` listens on channel `patient-realtime-${patientId}` for changes in `visits`, `vitals`, and `medicine_cycles`.
   - On change, it triggers `router.refresh()`, updating Server Component data without page reloads.
4. **Zod v4 Compatibility**:
   - All server actions strictly use `error.issues` instead of deprecated `error.errors`.
5. **No `any` Types**:
   - All server component data mappings use strict typed interfaces (`RawMemberRecord`, `RawRelationshipRecord`, `RawFamilyWithMembers`).

---

## 4. Phase 3 Implementation Plan (Next Steps!)

Phase 3 is the final phase focusing on **AI Clinical Summary, Patient Portal, Security Hardening & Deployment**.

### Phase 3 Tasks Checklist
- [ ] **Gemini AI Clinical Summaries (`/api/summary`)**:
  - Implement Route Handler `app/api/summary/route.ts` using `@google/genai`.
  - Enforce caller session (RLS: doctor or nurse only, 401/403 JSON responses).
  - Fetch patient chart data under the caller's scoped client (patient, visits, vitals, meds, family history).
  - Prompt: structured plain language summary within strict `<data>` delimiters.
  - Insert summary into `summaries` table (`patient_id`, `content`, `model`, `created_by`).
  - Wire up `SummaryCard` inside `PatientProfile.tsx` (AI Summary tab) with loading skeleton and disclaimer.
- [ ] **Patient & Guardian Portal (`app/(app)/patient/page.tsx`)**:
  - Read-only view for own patient record, visits, vitals, active medications.
  - Guardian switcher: if patient is a guardian of minor dependents, allow switching view via `can_view_patient()`.
- [ ] **RLS Test Script (`scripts/test-rls.ts`)**:
  - Sign in as each seeded user (anon client) and assert permission matrix.
  - Verify receptionist cannot read `visits`, `vitals`, `medicine_cycles`.
  - Verify patient cannot view unrelated patients.
  - Verify user cannot elevate role.
- [ ] **Deployment Preparation**:
  - Verify production configuration for Vercel deployment.
  - Final audit: zero PII in logs, strict input sanitization.

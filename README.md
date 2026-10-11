# CareThread — Hospital Patient-Records CRM

A secure, role-based patient-records system built with Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, and Supabase (PostgreSQL with Row Level Security, Auth, and Realtime).

> **Important**: All data in this application is fake and for demonstration purposes only.

---

## 🚀 Features by Role

| Role | Primary Responsibilities |
|---|---|
| **Admin** | Manage staff accounts (`admin`, `receptionist`, `doctor`, `nurse`). System overview. |
| **Receptionist** | Patient intake, search/filter patient directory, update patient records, provision patient portal accounts, family management. |
| **Doctor** | Clinical encounters, symptom & diagnosis recording, family medical history, review vitals and medicines, trigger AI summaries. |
| **Nurse** | Record vital signs (blood pressure, pulse, temperature, weight), track medicine cycles and compliance. |
| **Patient / Guardian** | Read-only access to own medical history, vitals, active prescriptions, and dependents/wards (guardians). |

---

## 🛠 Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Supabase Account**: A free Supabase project with database & auth enabled

---

## ⚙️ Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your project keys in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>
   GEMINI_API_KEY=<your-gemini-key>
   GEMINI_MODEL=gemini-2.0-flash
   ```

---

## 🗄 Database Migration

Run the migration script in your Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy and paste the contents of [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql).
3. Run the query. This sets up all tables, enums, triggers, RLS policies, and realtime publications.
4. In Supabase Dashboard -> **Authentication** -> **Settings**, disable **"Allow new user signups"** (all accounts are created by Admin or Receptionist).

---

## 🌾 Seeding Demo Data

Once your database migration is in place and `.env.local` is configured, run the seed script:

```bash
npm run seed
```

This creates 5 role accounts and 10 realistic patient records with family connections:

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@carethread.health` | `Admin1234!` |
| **Receptionist** | `reception@carethread.health` | `Recept1234!` |
| **Doctor** | `doctor@carethread.health` | `Doctor1234!` |
| **Nurse** | `nurse@carethread.health` | `Nurse1234!` |
| **Patient** | `patient1@carethread.health` | `Patient1234!` |

---

## 💻 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- You will be redirected to `/login`.
- Enter any of the credentials above to land directly on the role-tailored dashboard.

---

## 🧪 Verification Commands

```bash
npm run build      # Verify production build and TypeScript types
npm run lint       # Run ESLint across code
```

---

## 🗺 Implementation Status

See [`PHASES.md`](./PHASES.md) for the detailed roadmap:
- **Phase 1: Foundation, Security & Front Desk Module** — ✅ **Completed**
- **Phase 2: Clinical Care, Family Management & Realtime Updates** — ✅ **Completed**
- **Phase 3: AI Clinical Summary, Patient Portal & Deployment** — ✅ **Completed**

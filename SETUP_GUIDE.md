# 🏥 CareThread — Complete Setup Guide

> Hand this to your friend. Everything they need to get this running from scratch, in order.

---

## 🧰 Step 1 — Install Prerequisites

Before anything, make sure you have these installed on your machine.

### Node.js (v20+)
1. Go to **https://nodejs.org**
2. Download the **LTS** version (v20 or higher)
3. Run the installer (click Next → Next → Install)
4. Verify: open a terminal and run:
   ```bash
   node -v   # should print v20.x.x or higher
   npm -v    # should print v10.x.x or higher
   ```

### Git (to clone the project)
1. Go to **https://git-scm.com/downloads**
2. Download and install for your OS
3. Verify: `git --version`

---

## 📁 Step 2 — Get the Project Files

You have two options:

### Option A — Clone from Git (if shared as a repo)
```bash
git clone <repo-url>
cd CRM/carethread
```

### Option B — Extract from ZIP/RAR
1. Extract the `carethread.rar` or zip file provided
2. Open a terminal inside the `carethread/` folder
3. Install dependencies:
   ```bash
   npm install
   ```

---

## 🗄️ Step 3 — Create a Supabase Project (Free)

Supabase is the database + authentication backend. You need a free account.

1. Go to **https://supabase.com** and click **Start for free**
2. Sign up with GitHub or email
3. Click **New Project**
4. Fill in:
   - **Organization**: your account
   - **Project name**: `carethread` (or anything)
   - **Database Password**: create a strong password — **save this somewhere!**
   - **Region**: pick the closest to you
5. Click **Create new project** and wait ~2 minutes for it to provision

---

## 🔑 Step 4 — Get Your Supabase API Keys

Once your project is ready:

1. In the Supabase Dashboard sidebar, go to **Project Settings** → **API**
2. Copy these three values (you'll need them in Step 6):
   - **Project URL** → looks like `https://xyzabcdef.supabase.co`
   - **anon / public** key → long JWT string starting with `eyJ...`
   - **service_role** key → another long JWT (keep this secret!)

> ⚠️ **Never share your `service_role` key publicly. It bypasses all security.**

---

## 🔒 Step 5 — Disable Public Signups in Supabase

CareThread manages all user accounts internally (admin creates staff, receptionist creates patients). Public signup must be **OFF**.

1. In Supabase Dashboard → **Authentication** → **Settings**
2. Under **User Signups**, toggle **"Allow new users to sign up"** → **OFF**
3. Click **Save**

---

## 🗃️ Step 6 — Run the Database Migration

This creates all the tables, security rules (RLS), and triggers.

1. In Supabase Dashboard → **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Open the file `carethread/supabase/migrations/001_init.sql` in any text editor
4. Copy **all** the contents (Ctrl+A → Ctrl+C)
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: `Success. No rows returned`

> If you see errors, make sure you haven't run this query before. Drop the schema and try again if needed.

---

## 🤖 Step 7 — Get a Gemini API Key (for AI Summaries)

The AI clinical summary feature uses Google's Gemini API (free tier available).

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a Google account
3. Click **Create API Key**
4. Copy the key

---

## ⚙️ Step 8 — Configure Environment Variables

1. In the `carethread/` folder, copy the example env file:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env.local

   # Mac / Linux
   cp .env.example .env.local
   ```

2. Open `.env.local` in any text editor (Notepad, VS Code, etc.)

3. Fill in ALL values:
   ```env
   # From Supabase Dashboard → Settings → API
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...  (anon/public key)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...      (service_role key)

   # From Step 7
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.0-flash
   ```

4. Save the file. **Do NOT commit `.env.local` to Git — it's in `.gitignore`.**

---

## 🌱 Step 9 — Seed Demo Data

This creates 5 demo staff accounts + 10 fake patient records.

```bash
npm run seed
```

Wait for it to complete. You should see output like:
```
✅ Created admin: admin@carethread.health
✅ Created receptionist: reception@carethread.health
✅ Created doctor: doctor@carethread.health
✅ Created nurse: nurse@carethread.health
✅ Created patient: patient1@carethread.health
✅ Seeded 10 patients with families, visits, vitals, medicines
```

---

## 🚀 Step 10 — Run the App

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

You'll be redirected to the login page.

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@carethread.health` | `Admin1234!` |
| **Receptionist** | `reception@carethread.health` | `Recept1234!` |
| **Doctor** | `doctor@carethread.health` | `Doctor1234!` |
| **Nurse** | `nurse@carethread.health` | `Nurse1234!` |
| **Patient** | `patient1@carethread.health` | `Patient1234!` |

Each role sees a different dashboard with different permissions.

---

## 🎯 What to Try (Feature Tour)

### As Admin
- Go to `/admin/staff` → see all staff accounts
- Go to `/admin/staff/new` → create a new staff member

### As Receptionist
- Go to `/receptionist/patients` → search the patient list
- Go to `/receptionist/patients/new` → register a new patient
- Go to `/receptionist/families` → manage family households

### As Doctor
- Go to `/doctor/patients` → browse patients
- Click any patient → see the 5-tab clinical chart:
  - **Overview** – demographics, allergies, recent vitals
  - **Visits** – record a new clinical encounter
  - **Medicines** – prescribe medications
  - **Family** – view household + hereditary conditions
  - **AI Summary** – click "Generate New Summary" for Gemini AI analysis

### As Nurse
- Go to `/nurse/patients` → quick vitals station
- Record blood pressure, pulse, temperature, weight
- Update medicine cycle statuses (active → completed/stopped)

### As Patient
- Go to `/patient` → read-only view of your own records
- If you're a guardian, switch between yourself and dependents

---

## 🛠️ Useful Commands

```bash
npm run dev      # Start local dev server (http://localhost:3000)
npm run build    # Verify production build (checks types + all routes)
npm run lint     # Run ESLint code quality checks
npm run seed     # Re-seed demo data (run once after migration)
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| `Missing env variables` error on startup | Make sure `.env.local` exists and all 5 values are filled in |
| Login fails | Check Supabase URL + anon key are correct. Make sure you ran the seed. |
| AI summary fails | Check `GEMINI_API_KEY` is set. Make sure you're logged in as doctor or nurse. |
| Database errors on seed | Make sure you ran the SQL migration first (Step 6) |
| Port 3000 already in use | Run `npm run dev -- -p 3001` to use port 3001 |
| Seed fails with "User already exists" | The seed was already run. Sign into Supabase → Authentication → Users to see them. |

---

## 📁 Project Structure (Quick Reference)

```
carethread/
├── app/
│   ├── login/             # Public login page
│   ├── (app)/
│   │   ├── admin/         # Admin dashboard + staff management
│   │   ├── receptionist/  # Patient intake + family management
│   │   ├── doctor/        # Clinical encounters + AI summaries
│   │   ├── nurse/         # Vitals station + medicine tracking
│   │   └── patient/       # Patient read-only portal
│   └── api/summary/       # Gemini AI route handler
├── components/            # Shared UI components
├── supabase/migrations/   # Database schema (run this in Supabase)
├── scripts/
│   ├── seed.ts            # Demo data seeder
│   └── test-rls.ts        # Security policy tests
├── .env.example           # Template for your .env.local
└── proxy.ts               # Session middleware / auth redirect
```

---

> All data in this app is **fake and for demo purposes only**.  
> Never store real patient data here without proper HIPAA compliance setup.

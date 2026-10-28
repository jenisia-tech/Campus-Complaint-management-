# Campus Complaint Management System (Next.js + Supabase + Vercel)

A modern, full-stack **Campus Complaint Management System** designed for colleges and universities to digitally intake, track, triage, and resolve student facility grievances. Built as a comprehensive academic Software Engineering project for IA3 practical demonstration and evaluation.

![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-27%20Passed-6E9F18?style=flat-square&logo=vitest)
![Vercel](https://img.shields.io/badge/Deployment-Vercel%20Ready-000000?style=flat-square&logo=vercel)

---

## 📌 Legacy Implementation Preservation

The original prototype built using Python Flask, SQLite, and Bootstrap 5 has been safely preserved in full inside the [`legacy_flask/`](./legacy_flask/) directory, including all models, blueprints, templates, unit tests, and the initial SQLite database.

---

## 🚀 Key Features

### For Students
- **Account Registration & Login:** Official student registration with Name, Student ID (Roll Number), Campus Email, and Department.
- **Deterministic Ticket ID:** Generates concurrent-safe tracking identifiers formatted as `CMP-YYYY-XXXX` (e.g., `CMP-2026-0001`) via PostgreSQL sequence triggers.
- **Grievance Filing:** Intuitive form across 10 official categories with location, department, description, and priority level.
- **Real-Time Tracking & History:** Interactive chronological audit timeline tracking every status advancement, responsible staff, and remarks.
- **Search & Multi-Parameter Filters:** Instant searching by ticket ID or keyword, and filtering by category, priority, and status.
- **Strict Business Rules:** Students can edit or withdraw grievances **only while in the initial `Submitted` status**. Once under review or in progress, tickets are locked.

### For Administrators
- **Administrative Control Center:** Live dashboard computing total complaints, pending review, active maintenance, critical tickets, and average resolution turnaround hours.
- **Data Visualizations:** Interactive Chart.js charts showing grievance distributions by category and status lifecycle.
- **Campus Directory & Triage:** Filter all grievances campus-wide by department, status, category, priority, or search query.
- **Staff Assignment & Department Routing:** Assign responsible technicians and update responsible departments.
- **Workflow Advancement & Resolution:** Advance statuses through the official lifecycle: `Submitted` &rarr; `Under Review` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`, plus `Reopened`.
- **Audit Logging:** Every status advancement automatically records the actor's identity, remarks, and timestamp.
- **Printable Analytical Reports:** Executive summary report with printable PDF styling (`window.print()`).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Next.js 15 App Router | Server Components (RSC) and Client interactive components |
| **Language & Typing** | TypeScript 5.7 | 100% strict type safety across routes, props, and schemas |
| **Styling & UI** | Tailwind CSS + Lucide React | Accessible, modern responsive user interface |
| **Database Engine** | Supabase (PostgreSQL 15) | Relational persistence, sequence triggers, and cascading constraints |
| **Authentication & RLS** | Supabase Auth + Row-Level Security | JWT authentication with database-enforced row isolation |
| **Schema Validation** | Zod 3.24 | Dual-layer validation on client forms and Next.js route handlers |
| **Data Visualizations** | Chart.js 4.4 + React-Chartjs-2 | Interactive bar and doughnut analytics |
| **Testing Automation** | Vitest + Playwright | 27 unit & integration tests + browser-level E2E tests |
| **Deployment Target** | Vercel | Edge-optimized serverless full-stack hosting |

---

## 📋 Quick Evaluation Test Credentials

For college examiners and practical evaluators, pre-configured demo helper buttons are provided on the `/login` page:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `Student@123456` | Student Dashboard, Filing, Personal Directory |
| **Administrator** | `admin@campus.edu` | `Admin@123456` | Admin Triage, Assignment, Live Stats, Reports |

---

## ⚙️ Step-by-Step Setup Guide (Windows PowerShell)

### 1. Prerequisites
- **Node.js**: Version 18.x or higher (Node.js 22+ recommended). Check with:
  ```powershell
  node --version
  ```
- **Git**: Check with:
  ```powershell
  git --version
  ```

---

### 2. Configure Supabase Database & Auth

1. Go to [https://supabase.com](https://supabase.com) and create a **Free Account**.
2. Click **New Project** and name it `Campus-Complaint-System`.
3. In your Supabase Project Dashboard:
   - Navigate to **Project Settings &rarr; API**.
   - Copy your **Project URL**, **Anon / Public Key**, and **Service Role Key** (under Project API keys).
4. In your project root, copy the environment template:
   ```powershell
   Copy-Item .env.example .env.local
   ```
5. Open `.env.local` in an editor and paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
6. **Run Database Migrations**:
   - In Supabase, navigate to the **SQL Editor** on the left menu.
   - Open [`supabase/migrations/20261029000000_initial_schema.sql`](./supabase/migrations/20261029000000_initial_schema.sql) and paste its contents into the SQL Editor.
   - Click **Run**. This creates all tables (`profiles`, `departments`, `complaints`, `complaint_history`), the sequence trigger for `CMP-YYYY-XXXX`, and strict Row-Level Security (RLS) policies.
   - Next, copy the contents of [`supabase/seed.sql`](./supabase/seed.sql) and run it in the SQL Editor to seed the 10 official campus departments.

---

### 3. Install Dependencies & Run the App

1. Install project dependencies:
   ```powershell
   npm install
   ```

2. Start the Next.js local development server:
   ```powershell
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### 4. Running the Production Build

To test the production build locally:

```powershell
npm run build
npm run start
```

---

## 🧪 Automated Testing Suite

The project includes automated tests for unit validations, status workflow state transitions, utility functions, and Playwright browser journeys:

### Run Unit and Integration Tests (Vitest)
```powershell
npm test
```
*Expected Output: 27 of 27 test cases passing (100% pass rate).*

### Run Strict TypeScript Type Check
```powershell
npx tsc --noEmit
```
*Expected Output: Clean exit with 0 type errors.*

### Run End-to-End Browser Tests (Playwright)
```powershell
npm run test:e2e
```

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub**:
   ```powershell
   git add .
   git commit -m "feat: complete full-stack Next.js and Supabase migration"
   git push origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g. `https://your-app.vercel.app`)
5. Click **Deploy**. Vercel will automatically build and publish your application globally.

---

## 📚 Academic Course Outcomes (CO1 to CO5) Documentation

This project contains comprehensive academic documentation mapped to Software Engineering standards:

- **[CO1: Software Process Models](./docs/CO1_Process_Models.md):** Waterfall vs. Agile comparison, 3-sprint Scrum plan, role-based user stories, and acceptance criteria.
- **[CO2: UML Design & Architecture](./docs/CO2_UML_Design.md):** Mermaid diagrams for System Architecture, Use Case, Class Model, Sequence Flows, and State Machine.
- **[CO3: Software Testing Report](./docs/CO3_Testing_Report.md):** Execution matrix of all 27 automated Vitest unit/integration tests and Playwright E2E suites.
- **[CO4: Quality Assurance & Configuration Management](./docs/CO4_Quality_and_Configuration.md):** SCM Git branching model, Vercel CI/CD pipeline, and ISO/IEC 25010 Quality Model mapping.
- **[CO5: Project Estimation & Scheduling](./docs/CO5_Project_Estimation.md):** Work Breakdown Structure (WBS), COCOMO II sizing calculations, and Earned Value Management (EVM).

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── app/                      # Next.js 15 App Router pages & APIs
│   │   ├── page.tsx              # Public Landing Page & Demo Evaluation Guide
│   │   ├── layout.tsx            # Global Root Layout
│   │   ├── globals.css           # Tailwind CSS directives
│   │   ├── login/page.tsx        # Authentication Portal with Demo Buttons
│   │   ├── register/page.tsx     # Student Registration Portal
│   │   ├── dashboard/page.tsx    # Protected Student Dashboard
│   │   ├── complaints/           # Student Directory & Filing Views
│   │   │   ├── page.tsx          # Complaint Directory with Filters
│   │   │   ├── new/page.tsx      # Lodge New Grievance Form
│   │   │   └── [id]/             # Detail & Status Timeline View
│   │   │       ├── page.tsx      # Complaint Detail & Timeline View
│   │   │       └── edit/page.tsx # Edit Grievance (Submitted state only)
│   │   ├── admin/                # Protected Administrator Views
│   │   │   ├── page.tsx          # Admin Control Center & Live Stats
│   │   │   ├── complaints/       # Campus-Wide Grievance Directory
│   │   │   └── reports/page.tsx  # Analytical Reports & Print View
│   │   ├── api/                  # Next.js Route Handlers
│   │   │   ├── complaints/       # Intake, Update, and Withdraw APIs
│   │   │   └── admin/            # Triage, Assignment & Aggregation APIs
│   │   └── auth/callback/        # Supabase Auth Exchange Callback
│   ├── components/               # Reusable React UI Components
│   │   ├── ui/                   # Button, Card, Badge, StatCard, EmptyState
│   │   ├── Navbar.tsx            # Responsive Role-Based Navigation
│   │   ├── Footer.tsx            # Application Footer
│   │   ├── ComplaintTimeline.tsx # Chronological Status Audit Viewer
│   │   ├── ComplaintFilters.tsx  # Dynamic Query-Param Filter Toolbar
│   │   ├── AdminActionForm.tsx   # Status Advancement & Assignment Panel
│   │   ├── StudentActionForm.tsx # Student Edit/Withdraw Modal Form
│   │   ├── CategoryChart.tsx     # Chart.js Category Distribution
│   │   └── StatusChart.tsx       # Chart.js Status Lifecycle Visualizer
│   ├── lib/
│   │   ├── supabase/             # Client, Server, and Middleware Helpers
│   │   ├── validations/          # Zod Schemas & State Machine Logic
│   │   └── utils.ts              # Badge Color Resolvers & Helpers
│   ├── types/
│   │   └── database.ts           # TypeScript Models (Complaint, Profile, etc.)
│   └── middleware.ts             # Session Refresh & Protected Route Guards
├── supabase/
│   ├── migrations/               # PostgreSQL Versioned Schema & Triggers
│   └── seed.sql                  # Department Seed Data & Admin Setup Guide
├── tests/
│   ├── unit/                     # Vitest Schema & Utility Tests
│   ├── integration/              # Vitest Business Logic & Role Tests
│   └── e2e/                      # Playwright Browser Flow Tests
├── docs/                         # Academic Software Engineering Documentation (CO1-CO5)
├── legacy_flask/                 # Preserved Original Flask + SQLite Implementation
├── .env.example                  # Environment Variables Template
├── package.json                  # NPM Project Dependencies & Scripts
├── tailwind.config.ts            # Tailwind Design System Configuration
├── tsconfig.json                 # TypeScript Configuration with Path Aliases
└── README.md                     # Comprehensive Project Guide
```

---

## ⚖️ Academic Evaluation Note

Developed for academic evaluation in Software Engineering (IA3 practical examination). All code, database schemas, test harnesses, and architectural documentation demonstrate the rigorous application of modern software engineering methodologies.

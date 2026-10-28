# Course Outcome 2 (CO2): UML Design & System Architecture

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Implementation Technology:** React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Supabase Auth, Row-Level Security), Vitest, Playwright, Vercel  
*Legacy Foundation:* Python (Flask), SQLite, Bootstrap 5 (Preserved in `legacy_flask/`)

---

## 1. System Overview & Architecture

The **Campus Complaint Management System** is built on a modern **Full-Stack Next.js App Router & Serverless Architecture**:

```mermaid
graph TD
    subgraph "Client Layer (Browser)"
        UI["React 19 Interactive Components (Tailwind CSS)"]
        Forms["Client Forms & Zod Validations"]
        Charts["Chart.js Dynamic Visualizers"]
    end

    subgraph "Edge & Full-Stack Application (Next.js 15 on Vercel)"
        MW["Next.js Middleware (Session Refresh & Route Guards)"]
        RSC["React Server Components (Direct Server Fetching)"]
        API["Route Handlers (/api/complaints, /api/admin/...)"]
        Val["Zod Validation & State Machine Gatekeepers"]
    end

    subgraph "Backend-as-a-Service (Supabase Cloud)"
        Auth["Supabase Auth (JWT & HTTP-Only Cookies)"]
        PG["PostgreSQL Database (Tables: profiles, complaints, history)"]
        RLS["Row-Level Security (RLS Engine)"]
        Triggers["Triggers & Sequences (CMP-YYYY-XXXX & Profiles)"]
    end

    UI --> Forms
    Forms --> API
    UI --> RSC
    RSC --> PG
    Forms --> Val
    Val --> PG
    MW --> Auth
    API --> PG
    PG --> RLS
    PG --> Triggers
```

- **Client Layer:** Modular React 19 components styled with Tailwind CSS utility classes. Includes client forms with validation, instant URL filter toolbars, and responsive status badges.
- **Server Component Layer (RSC):** Next.js App Router server components execute on the server, querying Supabase directly via server client with zero client-side data leaks.
- **API Route Handlers:** Next.js Route Handlers (`src/app/api/`) validate all incoming JSON mutations using Zod and enforce authorization boundaries.
- **Persistence & RLS Engine:** Supabase PostgreSQL database enforces referential integrity, automated sequence triggers (`set_complaint_id()`), and Row-Level Security (RLS) policies.

---

## 2. UML Diagrams

### 2.1 Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        Student["fa:fa-user Student"]
        Admin["fa:fa-user-shield Administrator"]
    end

    subgraph "Campus Complaint Portal"
        UC1(["Register Account"])
        UC2(["Log In / Log Out (Supabase Auth)"])
        UC3(["View Student Dashboard"])
        UC4(["Submit New Complaint (Auto-ID CMP-YYYY-XXXX)"])
        UC5(["View Personal Complaints & History Timeline"])
        UC6(["Edit / Withdraw Complaint (Submitted state only)"])
        UC7(["View Admin Dashboard & Chart.js Metrics"])
        UC8(["Search & Multi-Filter Campus Directory"])
        UC9(["Assign Staff & Update Department / Priority"])
        UC10(["Advance Workflow Status & Resolution Notes"])
        UC11(["Reopen Resolved Grievance"])
        UC12(["View Analytical Reports & Print"])
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    Admin --> UC2
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
```

---

### 2.2 Class Diagram (Data & Domain Models)

```mermaid
classDiagram
    class Profile {
        +UUID id
        +String name
        +String student_id
        +String email
        +UserRole role
        +String department
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Complaint {
        +UUID id
        +String complaint_id
        +UUID user_id
        +String title
        +String description
        +ComplaintCategory category
        +String location
        +String department
        +ComplaintPriority priority
        +ComplaintStatus status
        +String assigned_to
        +String admin_remarks
        +String resolution_notes
        +Timestamp created_at
        +Timestamp updated_at
        +Timestamp resolved_at
    }

    class ComplaintHistory {
        +UUID id
        +UUID complaint_id
        +UUID changed_by_user_id
        +String changed_by_name
        +String old_status
        +String new_status
        +String remarks
        +Timestamp created_at
    }

    class Department {
        +UUID id
        +String name
        +String code
        +String description
        +Timestamp created_at
    }

    Profile "1" --> "0..*" Complaint : submits
    Complaint "1" --> "0..*" ComplaintHistory : audit_trail
    Profile "1" --> "0..*" ComplaintHistory : records_change
    Department "1" --> "0..*" Complaint : handles
```

---

### 2.3 Sequence Diagram (Complaint Submission & Triage)

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as Next.js Client
    participant Route as Next.js API (/api/complaints)
    participant DB as Supabase PostgreSQL
    actor Admin
    participant AdminRoute as /api/admin/complaints/[id]

    Student->>Browser: Fill Complaint Form (Title, Category, Location, Priority)
    Browser->>Route: POST /api/complaints (JSON payload)
    Note over Route: Zod Schema Validation & Session Verification
    Route->>DB: INSERT into complaints (user_id, title, ...)
    Note over DB: Trigger set_complaint_id() fires: generates CMP-YYYY-XXXX
    DB->>DB: INSERT into complaint_history (status: 'Submitted')
    DB-->>Route: Return Complaint (UUID + complaint_id)
    Route-->>Browser: HTTP 201 Created
    Browser-->>Student: Display Confirmation & Status Timeline

    Note over Admin, AdminRoute: Administrative Triage Phase
    Admin->>Browser: Open Admin Triage (/admin/complaints/[id])
    Browser->>AdminRoute: PATCH /api/admin/complaints/[id] (status: 'In Progress', assigned_to: 'Tech-1')
    Note over AdminRoute: Verify Admin Role & Validate State Transition
    AdminRoute->>DB: UPDATE complaints SET status='In Progress', assigned_to='Tech-1'
    DB->>DB: INSERT into complaint_history (old: 'Assigned', new: 'In Progress')
    AdminRoute-->>Browser: HTTP 200 OK
    Browser-->>Admin: Refresh Live Triage Queue
```

---

### 2.4 State Transition Machine Diagram (Complaint Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> Submitted: Student files complaint (Auto-ID CMP-YYYY-XXXX)
    
    Submitted --> Under_Review: Admin reviews grievance
    Submitted --> Assigned: Admin assigns technician directly
    Submitted --> Closed: Student withdraws grievance
    
    Under_Review --> Assigned: Assigned to department lead
    Under_Review --> In_Progress: Direct action initiated
    Under_Review --> Closed: Rejected as duplicate or invalid
    
    Assigned --> In_Progress: Technician begins repair
    Assigned --> Closed: Cancelled
    
    In_Progress --> Resolved: Maintenance completed & verified
    In_Progress --> Under_Review: Additional parts required
    
    Resolved --> Closed: Student confirms resolution
    Resolved --> Reopened: Issue recurs or unsatisfactory repair
    
    Reopened --> In_Progress: Assigned for re-inspection
    Reopened --> Under_Review: Escalated to senior engineer
    
    Closed --> [*]
```

---

## 3. Database Relational Schema (PostgreSQL 4-Table Architecture)

| Table Name | Primary Key | Foreign Keys | Key Constraints & Policies |
| :--- | :--- | :--- | :--- |
| `public.profiles` | `id` (UUID) | References `auth.users(id)` | Cascading delete, RLS: Users can read/edit own profile; Admins can read all. |
| `public.departments`| `id` (UUID) | None | Unique `code` and `name`. Read public; Write admin only. |
| `public.complaints` | `id` (UUID) | `user_id` &rarr; `profiles(id)` | Unique `complaint_id` generated via trigger; RLS: Students select/insert own; Admins full access. |
| `public.complaint_history` | `id` (UUID) | `complaint_id` &rarr; `complaints(id)` | Immutable append-only audit trail; RLS: Visible to ticket owner and admins. |

# Course Outcome 1 (CO1): Software Process Models

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Implementation Technology:** Python (Flask), SQLite, HTML5, CSS3, JavaScript (Bootstrap 5), pytest, Selenium

---

## 1. Problem Statement

Across college campuses, students frequently face infrastructural and operational difficulties involving classrooms (e.g., broken projectors, furniture, chalkboards), laboratories (e.g., faulty oscilloscopes, network drops, missing equipment), hostels (e.g., plumbing leaks, sanitation issues), power supply, Wi-Fi connectivity, drinking water dispensers, and transit facilities.

Traditionally, complaints are reported verbally to caretakers or through disparate, informal channels (such as paper registers, messaging groups, or word-of-mouth). This informal process leads to:
1. **Lack of Accountability:** Difficult to verify who received a complaint and who is responsible for fixing it.
2. **Zero Transparency:** Students have no tracking mechanism to know whether an issue is under review, scheduled for repair, or ignored.
3. **Operational Bottlenecks:** Campus administrators lack quantitative data on repeat failures, departmental bottlenecks, and resolution turnaround times.

The **Campus Complaint Management System** solves this by establishing a centralized, role-based digital web portal where students submit structured grievances, track live status progressions, and review administrative remarks. Administrators gain analytical dashboards to triage, assign, resolve, and monitor campus maintenance.

---

## 2. Project Objectives

1. **Centralized Digital Intake:** Provide an accessible web interface for reporting grievances across 10 official categories.
2. **Deterministic Complaint Tracking:** Automatically generate unique sequential tracking identifiers (`CMP-YYYY-XXXX`) for every submission.
3. **End-to-End Audit Trail:** Maintain an immutable chronological status history table recording every status transition, actor identity, remarks, and timestamp.
4. **Role-Based Workflow Enforcement:** Enforce strict boundaries between students (intake, tracking, initial withdrawal/edit) and administrators (assignment, priority adjustment, status advancement, resolution notes).
5. **Persistent & Atomic Storage:** Store records in a relational database (SQLite) with transactional integrity for multi-table updates.
6. **Live Quantitative Analytics:** Compute real-time dashboard metrics (breakdowns by category, status, priority, and mean resolution turnaround hours) directly from database queries.
7. **Empirical Verification:** Validate code quality and requirements through automated unit, integration, and browser tests.

---

## 3. Target Users & Stakeholders

| User Role | Responsibilities & Capabilities | Key System Interfaces |
| :--- | :--- | :--- |
| **Student** | Registered college students who identify campus defects. Can register, log in, submit complaints, view personal filing history, filter by status, and edit/withdraw complaints while still in `Submitted` state. | Student Dashboard, Submit Complaint Form, My Complaints Directory, Complaint Details & History Timeline. |
| **Administrator** | Campus facility managers and departmental heads. Can inspect all campus submissions, search across students/keywords, assign complaints to specific technicians/departments, adjust priority, update status, record resolution notes, and reopen closed complaints if necessary. | Admin Dashboard, Visual Analytics (Chart.js), Complaints Directory, Admin Action Panel, Resolution Reports. |
| **Faculty & Department Staff** | Secondary beneficiaries assigned to rectify reported equipment or classroom infrastructure issues. | Departmental assignments surfaced via Admin Portal. |

---

## 4. Requirements Specification

### 4.1 Functional Requirements (FR)

- **FR-01 (Authentication):** The system shall authenticate students using student ID/email and password, and administrators using administrative credentials with Werkzeug PBKDF2:SHA256 password hashing.
- **FR-02 (Unique Identification):** The system shall generate a unique sequential complaint ID formatted as `CMP-YYYY-XXXX` upon successful submission.
- **FR-03 (Complaint Intake):** The system shall record title, description, category (10 official categories), campus location/building, department responsible, and suggested priority.
- **FR-04 (Role-Based Authorization):** The system shall restrict administrative endpoints (`/admin/*`) strictly to accounts with `role='admin'`, returning HTTP 403 Forbidden to students.
- **FR-05 (Ownership Protection):** Students shall be prohibited from viewing or modifying complaints submitted by other student accounts.
- **FR-06 (Editing Restrictions):** A student shall be permitted to edit or withdraw a complaint only while its status remains in the initial `Submitted` state.
- **FR-07 (Administrative Triage):** Administrators shall be able to update status (`Submitted` &rarr; `Under Review` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`, plus `Reopened`), reassign departments/technicians, and append resolution notes.
- **FR-08 (Audit History):** Every change to a complaint's status or assignment shall record an entry in `complaint_history` with the changer's user ID, name, old status, new status, remarks, and timestamp.
- **FR-09 (Search & Filtering):** The system shall provide multi-parameter filtering by category, status, priority, and department, alongside keyword searching across titles, locations, and descriptions.
- **FR-10 (Analytics & Reporting):** The system shall calculate live metrics including counts by status, counts by category, critical priority tallies, and mean resolution turnaround in hours.

### 4.2 Non-Functional Requirements (NFR)

- **NFR-01 (Security - SQL Injection):** All database interactions shall use parameterized SQL queries (`?` placeholders) with strict input typing to eliminate SQL injection vulnerabilities.
- **NFR-02 (Security - CSRF):** State-changing HTTP POST requests shall validate session-bound CSRF tokens.
- **NFR-03 (Security - XSS):** User-generated inputs shall be escaped automatically by Jinja templating before rendering in HTML views.
- **NFR-04 (Usability & Responsiveness):** The frontend shall adapt responsively to laptop and mobile viewports using Bootstrap 5 grid systems and clean status badges.
- **NFR-05 (Performance & Efficiency):** Dashboard database aggregation queries and search queries shall execute in under 100 milliseconds for realistic academic datasets.
- **NFR-06 (Portability):** The application shall run locally on Windows laptops using standard Python 3.10+ without external cloud or paid dependencies.

---

## 5. Software Process Models Analysis

### 5.1 The Waterfall Model

The traditional **Waterfall model** is a sequential software development lifecycle (SDLC) consisting of distinct cascading phases:
1. **Requirements Analysis:** Comprehensive gathering and specification of system requirements.
2. **System Design:** Architectural and database schema design.
3. **Implementation:** Writing the code based on strict design documents.
4. **Integration & Testing:** Verifying the assembled system against initial requirements.
5. **Deployment:** Installing the completed application on host environments.
6. **Maintenance:** Correcting defects and implementing enhancements post-release.

```
[Requirements] ──> [System Design] ──> [Implementation] ──> [Testing] ──> [Deployment]
```

#### Waterfall Applied to this Project
In this academic implementation, the fixed scope defined by the IA3 evaluation rubric (fixed categories, explicit status progression, mandatory database schema, predetermined CO documentation) aligned well with Waterfall's front-loaded requirements gathering. The database schema and constraints (`users`, `complaints`, `complaint_history`, `departments`) were formally drafted before writing backend routes.

#### Limitations in Practice
Strict Waterfall introduces high risk because defects discovered during the late testing phase require costly back-tracking to redesign. For instance, when browser testing revealed that Selenium's headless driver could not interact with hidden navbar dropdown elements, rapid iterative fixes to form selectors were necessary—a flexibility not afforded by rigid sequential Waterfall.

---

### 5.2 Agile Scrum Framework

**Agile Scrum** is an iterative, incremental development framework designed for flexibility, rapid delivery, and frequent inspect-and-adapt cycles.

#### Key Scrum Artifacts & Ceremonies
- **Product Backlog:** A prioritized, evolving list of user stories representing all required functionality.
- **Sprint Backlog:** The subset of user stories committed for completion during a specific sprint iteration (typically 1 to 2 weeks).
- **Increments:** Potentially shippable software increments produced at the conclusion of each sprint.
- **Scrum Ceremonies:** Sprint Planning, Daily Scrum, Sprint Review (demonstration to stakeholders), and Sprint Retrospective (process improvement).

---

## 6. Product Backlog & User Stories

| Story ID | As a... | I want to... | So that... | Story Points (Effort) | Priority |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **US-01** | Student | Register with my name, roll number, college email, and department | I have an authenticated account to file complaints | 3 | High |
| **US-02** | Student | Log in securely with my email or student ID | I can access my private student portal | 2 | High |
| **US-03** | Student | Submit a detailed complaint with category, location, and priority | The campus facility team knows exactly what needs repair | 5 | High |
| **US-04** | Student | Receive an auto-generated tracking ID (e.g., `CMP-2026-0001`) | I can easily reference my complaint during inquiries | 2 | High |
| **US-05** | Student | View a chronological audit timeline of status updates and remarks | I know the real-time progress of my report | 3 | Medium |
| **US-06** | Student | Edit or withdraw my complaint while it is still `Submitted` | I can correct errors or cancel reports that resolved themselves | 3 | Medium |
| **US-07** | Student | Be prevented from viewing other students' complaints | My privacy and grievance records remain confidential | 3 | High |
| **US-08** | Administrator | Log in using administrative credentials | I can access the administrative management console | 2 | High |
| **US-09** | Administrator | View real-time aggregated metrics and visual distribution charts | I can monitor pending workloads and critical defects | 5 | High |
| **US-10** | Administrator | Filter complaints by category, department, priority, and status | I can triage urgent issues and dispatch technicians | 5 | High |
| **US-11** | Administrator | Advance complaint statuses and assign responsible technicians | Facility teams have clear operational ownership | 5 | High |
| **US-12** | Administrator | Record resolution notes and reopen resolved complaints if needed | Quality of maintenance is verified and auditable | 3 | High |

---

## 7. Sprint Execution Plan

The development of the Campus Complaint Management System was structured into **three focused, sequential development iterations (Sprints)**:

### Sprint 1: Foundation, Data Persistence & Secure Authentication
- **Sprint Goal:** Establish application architecture, relational schema, input validation, and role-based authentication.
- **Delivered Backlog Items:** US-01, US-02, US-07, US-08.
- **Tangible Deliverables:**
  - `config.py` with multi-environment configurations (Development, Testing).
  - SQLite database schema (`database/schema.sql`) with foreign key constraints, default timestamps, and indexes.
  - Password hashing and verification using Werkzeug PBKDF2:SHA256 (`models/user.py`).
  - Session management, CSRF protection decorator (`services/csrf.py`), and role enforcement decorators (`services/auth_service.py`).
  - Unit test suite for validation and authentication (`tests/unit/test_validation.py`, `tests/unit/test_models.py`).

### Sprint 2: Core Complaint Engine, Tracking & Student Portal
- **Sprint Goal:** Implement the complaint lifecycle, deterministic ID generation, transactional history logging, and the student interface.
- **Delivered Backlog Items:** US-03, US-04, US-05, US-06.
- **Tangible Deliverables:**
  - `ComplaintModel` with `generate_complaint_id()`, `create_complaint()`, and `get_student_stats()`.
  - Student routes (`routes/student_routes.py`): dashboard, submission, detail view, editing, and withdrawal.
  - Responsive Bootstrap 5 student views (`templates/student/`).
  - Strict enforcement: student editing/withdrawal restricted exclusively to `Submitted` status.
  - Integration tests for student routes and ownership security (`tests/integration/test_student_routes.py`).

### Sprint 3: Administrative Control, Analytics, Automation & Quality Verification
- **Sprint Goal:** Build administrator triage controls, Chart.js visualizations, automated seed data, and end-to-end testing.
- **Delivered Backlog Items:** US-09, US-10, US-11, US-12.
- **Tangible Deliverables:**
  - Administrative routes (`routes/admin_routes.py`): dashboard with metrics, search/filter directory, update action form, analytical reports.
  - Interactive Chart.js graphs displaying complaints by category and status.
  - Automated repeatable seed script (`scripts/seed_demo.py`) with safe reset and duplicate protection.
  - Automated Selenium browser testing (`tests/selenium/test_browser_flow.py`) validating the entire student-to-admin workflow.
  - Complete academic course outcome documentation (CO1 to CO5).

---

## 8. Comparative Analysis: Waterfall vs. Agile Scrum

| Evaluation Dimension | Waterfall Model | Agile Scrum Framework | Applied Project Context |
| :--- | :--- | :--- | :--- |
| **Requirements Management** | Requirements frozen upfront in formal specification. Difficult to adapt. | Iterative backlog refinement; welcomes evolving user stories. | The core academic evaluation rubric was fixed (Waterfall), while UI layouts and test flows evolved iteratively (Scrum). |
| **Delivery Cadence** | Single monolithic delivery at the end of the development lifecycle. | Working software increments delivered at the end of each sprint. | Adopted a hybrid approach: delivered functioning modules iteratively across 3 sprints. |
| **Customer / User Feedback** | Feedback occurs primarily during requirements and final acceptance testing. | Continuous feedback demonstrated at sprint reviews. | Enabled immediate verification of student and admin UI workflows before final evaluation. |
| **Risk Management** | High risk; integration and architecture defects discovered late. | Low risk; continuous testing and automated verification in every iteration. | Automated pytest suite (23 unit/integration tests) run continually prevented regressions. |
| **Documentation Burden** | Heavy upfront documentation required before coding begins. | Lightweight, living documentation coupled with clean executable code. | Comprehensive Markdown documentation authored alongside working code artifacts. |

---

## 9. Justification for Development Approach

For this academic project, a **Pragmatic Hybrid Approach (Agile-within-Waterfall)** was chosen:

1. **Why Pure Waterfall Was Insufficient:** A strict Waterfall model would require complete specification and UI wireframing before writing any Flask route. In practice, building web applications with dynamic Bootstrap interactions and session-driven state transitions requires early, iterative testing to catch issues (such as Jinja timestamp formatting or Selenium headless button interaction) early.
2. **Why Pure Scrum Was Overkill:** A pure Scrum framework presupposes an ongoing commercial product with evolving client requests and dedicated full-time Scrum masters and daily standups. For a time-bound individual academic evaluation, formal ceremonies would introduce artificial overhead without tangible engineering benefit.
3. **The Selected Hybrid Synthesis:**
   - **Structured Upfront Architecture (Waterfall):** Fixed requirements, explicit data models, database schema, and security boundaries were established in Phase 1.
   - **Iterative Implementation & Verification (Scrum):** Code was written in three sprint increments, each accompanied by automated pytest test cases, ensuring that no module was declared complete without empirical test verification.

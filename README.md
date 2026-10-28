# Campus Complaint Management System (CampusCare)

**Academic Evaluation:** College Software Engineering IA3 Practical Project  
**Implementation Technology:** Python (Flask), SQLite, HTML5, CSS3, JavaScript (Bootstrap 5), pytest, Selenium

---

## 1. Project Overview

The **Campus Complaint Management System** is a centralized, digital web platform built for college campuses. It allows students to submit, track, and monitor complaints across classrooms, laboratories, hostels, Wi-Fi, electricity, drinking water, and other campus facilities. Campus facility administrators gain tools to triage, assign, update, and resolve grievances with full audit accountability and live dashboard analytics.

---

## 2. Key Features

### For Students
- **Account Registration & Login:** Register with roll number, college email, name, and department. Secure session management and PBKDF2 password encryption.
- **Complaint Submission:** Report campus issues across 10 official categories with campus location, responsible department, and suggested priority.
- **Sequential Tracking ID:** Automated generation of unique tracking IDs (e.g., `CMP-2026-0001`).
- **Real-Time Audit Timeline:** View a chronological timeline showing every status change, remarks, and timestamps.
- **Student Ownership & Protection:** Strict privacy enforcement; students can only view and modify their own reports.
- **Editing & Withdrawal:** Modify or withdraw a complaint while it remains in the initial `Submitted` status.

### For Administrators
- **Executive Dashboard:** Live calculated KPIs (Total, Pending Review, In Progress, Resolved, Closed, Critical Issues, and Mean Resolution Turnaround in hours).
- **Interactive Visualizations:** Chart.js graphs for complaint distribution by category (doughnut chart) and by status (bar chart).
- **Comprehensive Search & Multi-Filters:** Search across titles, IDs, locations, and student names; filter by category, department, priority, and status.
- **Triage & Assignment:** Assign complaints to specific departments or staff technicians, adjust priorities, and record internal notes.
- **Status Advancement & Resolution:** Advance complaints through the formal lifecycle (`Submitted` &rarr; `Under Review` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`, plus `Reopened`) and record final resolution notes.
- **Analytical Reports:** Breakdown tables and export-ready/print-friendly report views (`window.print()`).

---

## 3. Technology Stack

- **Backend:** Python 3.10+ with Flask 3.x
- **Database:** SQLite3 with relational foreign keys, transactions, and indexes
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5.3, Bootstrap Icons, Chart.js 4.4
- **Security:** Werkzeug PBKDF2:SHA256 password hashing, session-bound CSRF protection, auto-escaping against XSS, and parameterized SQL queries against SQL injection
- **Testing:** pytest 9.x, pytest-cov 7.x, Selenium 4.x (headless browser automation)
- **Version Control:** Git

---

## 4. Course Outcomes (CO1 to CO5) Coverage

| Course Outcome | Academic Documentation | Key Implemented Artifacts & Evidence |
| :--- | :--- | :--- |
| **CO1: Software Process Models** | [`docs/CO1_Process_Models.md`](docs/CO1_Process_Models.md) | Waterfall vs. Scrum analysis, 12 Product Backlog user stories, 3-sprint execution plan, and hybrid development justification. |
| **CO2: UML Design & Architecture** | [`docs/CO2_UML_Design.md`](docs/CO2_UML_Design.md) | Valid Mermaid diagrams: Use Case, Class, Component, Activity (submission flow), Sequence (admin resolution), and UI prototype evolution. |
| **CO3: Software Testing** | [`docs/CO3_Testing_Report.md`](docs/CO3_Testing_Report.md) | 24 automated tests (11 unit/white-box, 12 integration/security, 1 Selenium E2E), 100% test pass rate, and bug remediation log. |
| **CO4: SQA & Configuration Management** | [`docs/CO4_Quality_and_Configuration.md`](docs/CO4_Quality_and_Configuration.md) | Git setup, SemVer convention, ISO/IEC 25010 mapping, Six Sigma DMAIC, and 80.0% measured pytest-cov code coverage. |
| **CO5: Project Estimation & Scheduling** | [`docs/CO5_Project_Estimation.md`](docs/CO5_Project_Estimation.md) | Work Breakdown Structure (WBS), COCOMO II Early Design model, Mermaid Gantt chart, EVM/SPI worked example, and CMMI process levels. |

---

## 5. Prerequisites

Before running the application on your Windows machine, ensure you have:
- **Windows 10 / 11**
- **Python 3.10 or higher** (Verify with `python --version`)
- **Google Chrome** or **Microsoft Edge** (for running Selenium automated tests)

---

## 6. Step-by-Step Setup & Execution Instructions (Windows PowerShell)

Follow these exact commands in Windows PowerShell:

### Step 1: Open Project Directory
```powershell
cd c:\Users\haeue\OneDrive\Desktop\Jenoi\College\MP\student-complaint-portal\Campus-Complaint-management-
```

### Step 2: (Optional) Create & Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies
```powershell
python -m pip install -r requirements.txt
```

### Step 4: Populate Demonstration Accounts & Sample Complaints
Run the seed script to create test accounts and 6 realistic complaints:
```powershell
python scripts/seed_demo.py --force-reset
```
*(This creates the database, lookup tables, 1 admin, 2 students, and 6 sample complaints across multiple categories.)*

### Step 5: Start the Flask Application Server
```powershell
python app.py
```
You will see output indicating that the server is running:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### Step 6: Open the Application in your Browser
Open your browser and navigate to:
**[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 7. Demonstration Credentials (For Evaluation)

| Role | Email / Identifier | Student Roll No | Password | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Campus Administrator** | `admin@campus.edu` | — | `Admin@123` | Full administrative triage, status assignment, and reporting |
| **Student 1** | `john.doe@student.campus.edu` | `STU-2026-001` | `Student@123` | Computer Science student; has active complaints |
| **Student 2** | `sarah.smith@student.campus.edu` | `STU-2026-002` | `Student@123` | Electrical Engineering student; has active complaints |

> You can also register a brand new student account at [http://127.0.0.1:5000/register](http://127.0.0.1:5000/register).

---

## 8. Running Automated Tests

All tests run in isolated test databases (`tempfile`) and **will never modify or delete your demonstration data**.

### Run Unit and Integration Tests:
```powershell
python -m pytest tests/unit tests/integration -v
```

### Run Tests with Code Coverage Report:
```powershell
python -m pytest tests/unit tests/integration --cov=. --cov-report=term-missing
```
*(Measured result: **23 passed, 80% statement coverage**)*

### Run Selenium Browser Automation Test:
```powershell
python -m pytest tests/selenium/test_browser_flow.py -v
```
*(Automatically launches headless Chrome/Edge, logs in as student, files a complaint, logs out, logs in as admin, updates the status to `In Progress`, and verifies the full workflow).*

---

## 9. Project Directory Structure

```
Campus-Complaint-management-/
├── app.py                     # Flask application factory and entry point
├── config.py                  # Multi-environment configurations (Dev, Testing)
├── requirements.txt           # Python package dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Version control exclusions
├── campus_complaints.db       # Persistent SQLite database (created on run)
├── database/
│   ├── __init__.py
│   ├── connection.py          # SQLite connection manager and row factory
│   ├── schema.sql             # Relational SQL schema with foreign keys and indexes
│   └── db_init.py             # Schema initialization and default department seeds
├── models/
│   ├── __init__.py
│   ├── user.py                # User data access and PBKDF2 password hashing
│   └── complaint.py           # Complaint CRUD, state transitions, transactions, and metrics
├── routes/
│   ├── __init__.py
│   ├── auth_routes.py         # Login, student registration, and logout
│   ├── student_routes.py      # Student dashboard, submission, detail, edit, withdraw
│   ├── admin_routes.py        # Admin dashboard, directory, triage actions, and reports
│   └── error_handlers.py      # User-friendly 400, 403, 404, 500 error pages
├── services/
│   ├── __init__.py
│   ├── auth_service.py        # Role decorators (@admin_required, @student_required)
│   ├── csrf.py                # Cryptographic CSRF token generation and validation
│   └── validation.py          # Strict backend validation and status transition matrix
├── templates/
│   ├── base.html              # Responsive Bootstrap 5 layout with navigation and alerts
│   ├── index.html             # Academic portal landing page with quick demo accounts
│   ├── auth/                  # Login and student registration templates
│   ├── student/               # Student dashboard, submission, and timeline templates
│   ├── admin/                 # Admin dashboard, triage, and report templates
│   └── errors/                # 400, 403, 404, 500 error page templates
├── static/
│   ├── css/style.css          # Custom styling, status badges, and vertical timeline
│   └── js/main.js             # Client-side scripts and alert auto-dismissal
├── scripts/
│   ├── __init__.py
│   └── seed_demo.py           # Repeatable demo data population script
├── tests/
│   ├── __init__.py
│   ├── conftest.py            # Pytest test client and isolated database fixtures
│   ├── unit/                  # Unit tests for models, validation, and stats
│   ├── integration/           # Integration tests for routes, RBAC, and security
│   └── selenium/              # End-to-end headless browser automation test
└── docs/
    ├── CO1_Process_Models.md  # Software process models, backlog, and sprint plans
    ├── CO2_UML_Design.md      # Mermaid diagrams and UI prototype evolution
    ├── CO3_Testing_Report.md  # Test case matrix, execution results, and defect log
    ├── CO4_Quality_and_Configuration.md # SCM, SemVer, SQA checklist, ISO/IEC 25010
    └── CO5_Project_Estimation.md # WBS, COCOMO II, Mermaid Gantt, and SPI analysis
```

---

## 10. Troubleshooting Common Issues

1. **Port 5000 Already in Use:**
   If another application is using port 5000, start Flask on a different port:
   ```powershell
   python -c "from app import create_app; app = create_app('development'); app.run(port=5050)"
   ```
   Then open `http://127.0.0.1:5050`.

2. **Resetting Demo Data:**
   To reset the database back to clean demo data:
   ```powershell
   python scripts/seed_demo.py --force-reset
   ```

3. **Selenium Browser Driver Warning:**
   Selenium 4.6+ includes `Selenium Manager` which handles browser drivers automatically. Ensure Google Chrome or Microsoft Edge is installed in standard Windows Program Files.

---

## 11. Academic Evaluation Summary

- **Demonstration Suitability:** Completely functional local system with real SQLite data persistence, genuine transactional integrity, and zero mock API placeholders.
- **Security Compliance:** Parameterized queries, CSRF validation, password hashing, and role-based route protection.
- **Test Integrity:** 24 automated tests actually executed and passing with 80% measured code coverage.

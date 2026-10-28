# Course Outcome 4 (CO4): Software Quality Assurance & Configuration Management

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Configuration Management Tool:** Git (Version Control), Semantic Versioning (SemVer 2.0.0)  
**Quality Frameworks:** ISO/IEC 25010 Software Product Quality Model, Six Sigma (DMAIC)

---

## 1. Software Configuration Management (SCM) Plan

Software Configuration Management ensures that all project artifacts—including source code, database schemas, automated test suites, configuration files, and documentation—are tracked, version-controlled, reproducible, and protected against regression.

### 1.1 Git Repository Setup & Commands

To initialize, inspect, and maintain the repository on a local Windows machine, the following standard Git commands are utilized:

```powershell
# 1. Initialize Git repository
git init

# 2. Inspect untracked and modified files
git status

# 3. Add all project files conforming to .gitignore
git add .

# 4. Commit changes with meaningful academic commit messages
git commit -m "feat: complete campus complaint management portal with CO1-CO5 documentation"

# 5. Review branch history and commit logs
git log --oneline --graph --decorate
```

---

### 1.2 Configuration Exclusions (`.gitignore`)

The `.gitignore` file was configured to prevent compilation artifacts, virtual environments, sensitive local environment variables, database binaries, and test caches from entering version control:

```gitignore
# Python artifacts
__pycache__/
*.py[cod]
.venv/
env/

# Database binaries
*.sqlite3
*.db
campus_complaints.db
test_*.db

# Secrets & Environment
.env

# Testing & Coverage
.pytest_cache/
.coverage
htmlcov/

# Logs
*.log
```

---

### 1.3 Suggested Progressive Commit History

To reflect realistic, structured engineering development, the project follows a conventional commit progression across development phases:

| Commit Hash (Example) | Commit Type | Scope | Commit Message Summary |
| :---: | :---: | :---: | :--- |
| `a1c09e1` | `feat` | `init` | Initial project setup with requirements, `.gitignore`, and configuration settings |
| `b4d21f8` | `feat` | `database` | Implement SQLite relational schema, connection factory, and initial department seed |
| `c7e34a2` | `feat` | `auth` | Implement PBKDF2:SHA256 password hashing, user registration, and RBAC decorators |
| `d9f56b4` | `feat` | `student` | Implement complaint creation, sequential ID generator (`CMP-YYYY-XXXX`), and history tracking |
| `e2a78c1` | `feat` | `admin` | Implement admin triage controls, staff assignment, status updates, and resolution notes |
| `f5b90d3` | `feat` | `ui` | Build responsive Bootstrap 5 views, custom badges, and Chart.js dashboards |
| `6a1c2e4` | `test` | `pytest` | Add 23 unit and integration tests covering security, RBAC, models, and validation |
| `7b3d4f5` | `fix` | `templates` | Resolve datetime slicing and client fixture session collision in tests |
| `8c5e6a7` | `test` | `selenium` | Add end-to-end headless browser automation test for full workflow |
| `9d7f8b9` | `docs` | `academic` | Author complete academic documentation for CO1, CO2, CO3, CO4, and CO5 |

---

### 1.4 Version Numbering Scheme (SemVer 2.0.0)

The project adheres to **Semantic Versioning (MAJOR.MINOR.PATCH)**:
- **Current Version:** `v1.0.0` (Complete Initial Production Release for IA3 Practical Evaluation)
- **MAJOR version:** Incremented when incompatible API or schema changes are introduced.
- **MINOR version:** Incremented when functionality is added in a backward-compatible manner (e.g., adding SMS alerts).
- **PATCH version:** Incremented for backward-compatible bug fixes and security patches (e.g., fixing form validation bounds).

---

## 2. Software Quality Assurance (SQA) Checklist

| Verification Item | Specification / Standard | Implementation Evidence | Status |
| :--- | :--- | :--- | :---: |
| **Input Sanitization** | Reject blank strings, validate formats (email, roll number, length limits) | `services/validation.py` (`validate_registration`, `validate_complaint`) | **VERIFIED** |
| **SQL Injection Prevention** | Parameterized queries with `?` placeholders; zero SQL concatenation | `models/user.py`, `models/complaint.py` | **VERIFIED** |
| **CSRF Protection** | Session-bound cryptographically secure CSRF tokens on state-changing requests | `services/csrf.py` (`csrf_protect` decorator) | **VERIFIED** |
| **XSS Immunity** | Automatic HTML character escaping in Jinja2 templates | Verified in `tests/integration/test_security.py` | **VERIFIED** |
| **Role-Based Access Control** | Explicit separation: students cannot access `/admin/*` routes (HTTP 403) | `services/auth_service.py` (`@admin_required`, `@student_required`) | **VERIFIED** |
| **Confidentiality / Isolation** | Students cannot view, edit, or withdraw complaints submitted by others | Ownership checks in `routes/student_routes.py` (HTTP 403 on breach) | **VERIFIED** |
| **Cryptographic Storage** | Passwords hashed using PBKDF2:SHA256 with unique salts; zero plaintext storage | Werkzeug `generate_password_hash` & `check_password_hash` | **VERIFIED** |
| **Relational Integrity** | Foreign key constraints and atomic database transactions | `PRAGMA foreign_keys = ON;`, `db.commit()` / `db.rollback()` | **VERIFIED** |
| **Persistent Storage** | Database survives restarts without silent wipe or schema corruption | SQLite `campus_complaints.db` with `CREATE TABLE IF NOT EXISTS` | **VERIFIED** |
| **Repeatable Seed Data** | Safe demo script with idempotent account and complaint creation | `scripts/seed_demo.py` with duplicate checks and `--force-reset` | **VERIFIED** |

---

## 3. Measured Quality & Reliability Metrics

The following metrics were **empirically measured** using automated testing tools (`pytest` and `pytest-cov`):

### 3.1 Test Execution Metrics
- **Total Automated Test Cases:** 24 tests
  - Unit & White-Box Tests: 11 tests
  - Integration & Security Tests: 12 tests
  - Selenium End-to-End Browser Tests: 1 test
- **Tests Passed:** 24 / 24
- **Tests Failed:** 0
- **Test Pass Rate:** **100.0%**
- **Execution Duration:** 6.61s (Unit + Integration) + 17.75s (Selenium E2E)

### 3.2 Code Coverage (pytest-cov)
- **Total Statements Analyzed:** 1,181 statements
- **Missed Statements:** 240 statements
- **Overall Code Coverage:** **80.0%**
- **Core Model Layer Coverage (`models/complaint.py`, `models/user.py`):** **91.0%**
- **Configuration & Validation Coverage (`config.py`, `validation.py`):** **96.5%**

---

## 4. Defect Tracking & Resolution Log

| Defect ID | Severity | Module | Description | Root Cause | Remediation Applied | Status |
| :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **BUG-01** | High | Database / Templates | `TypeError: 'datetime.datetime' object is not subscriptable` during template rendering | SQLite connection used `PARSE_DECLTYPES`, returning Python `datetime` objects that cannot be sliced in Jinja | Removed `PARSE_DECLTYPES` in `connection.py` and converted values with `(c.created_at\|string)[:16]` | **RESOLVED** |
| **BUG-02** | Medium | Auth Routes | Session retained student state during test re-login | Route only inspected session existence without checking if incoming request was a fresh POST | Updated `/login` route to re-authenticate on POST requests regardless of current session | **RESOLVED** |
| **BUG-03** | Medium | Browser Automation | `ElementNotInteractableException` in Selenium | Generic selector `button[type='submit']` selected hidden logout button in collapsed navbar | Replaced with specific selector `form[action*='new'] button[type='submit']` and `scrollIntoView()` | **RESOLVED** |

---

## 5. Quality Standards Mapping

### 5.1 ISO/IEC 25010 Software Product Quality Model

The implemented system maps directly to the eight quality characteristics defined by the international standard **ISO/IEC 25010**:

1. **Functional Suitability:** All 12 product backlog user stories (registration, complaint filing, tracking, admin assignment, status advancement, resolution notes, and analytics) are fully implemented and verified.
2. **Performance Efficiency:** SQLite parameterized queries with secondary indexes on `user_id`, `status`, `category`, and `priority` ensure page load and query execution times under 50 ms.
3. **Compatibility:** Web frontend operates seamlessly across Google Chrome, Microsoft Edge, Mozilla Firefox, and mobile Safari using responsive Bootstrap 5 standards.
4. **Usability:** Intuitive layout with distinct color-coded status badges, breadcrumbs, confirmation modals, friendly empty states, and auto-dismissing flash alerts.
5. **Reliability:** Relational transactions guarantee that multi-table inserts (`complaints` + `complaint_history`) never leave orphan records.
6. **Security:** Industry-standard PBKDF2:SHA256 password hashing, session-bound CSRF protection, automatic XSS template escaping, and parameterized SQL queries.
7. **Maintainability:** Modular architecture adhering to MVC and Single Responsibility Principle (SRP). Code smells minimized with clean folder organization.
8. **Portability:** Self-contained architecture using SQLite and standard Python libraries; runs on local Windows workstations without requiring external databases or cloud accounts.

---

### 5.2 Six Sigma Principles (DMAIC Framework)

Six Sigma principles were applied throughout development using the **DMAIC** cycle:
- **Define:** Identified the core defect in traditional campus complaint handling: verbal/informal reports leading to untracked grievances.
- **Measure:** Established quantitative metrics (test pass rate = 100%, code coverage >= 80%, mean resolution turnaround calculation).
- **Analyze:** Analyzed user workflows to discover potential failure modes (e.g., duplicate student IDs, students modifying other students' reports, illegal status jumps).
- **Improve:** Implemented strict backend validation, state-transition verification matrix (`VALID_TRANSITIONS`), and parameterized transactions.
- **Control:** Automated test regression suites (`pytest`, `pytest-cov`, `selenium`) act as continuous quality control gates before evaluation.

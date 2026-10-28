# Course Outcome 3 (CO3): Software Testing Report

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Test Frameworks:** pytest 9.1.1, pytest-cov 7.1.0, Selenium 4.51.0  
**Execution Environment:** Windows 11, Python 3.12.10, Headless Google Chrome

---

## 1. Testing Strategy & Test Architecture

A comprehensive, multi-tiered testing strategy was designed and executed to ensure functional correctness, security, data integrity, and cross-browser reliability:

1. **Unit & White-Box Testing (`tests/unit/`):** Validates internal algorithms, cryptographic password hashing, model-level transactions, input validation boundaries, and analytical database aggregation calculations.
2. **Integration & Black-Box Testing (`tests/integration/`):** Evaluates user-observable behavior across HTTP routes, session lifecycle, role-based access restrictions (RBAC), ownership boundaries, search/filter logic, and SQL injection / XSS immunity without relying on internal code state.
3. **End-to-End Browser Automation Testing (`tests/selenium/`):** Simulates real user behavior in a headless web browser, executing the entire lifecycle from student registration and complaint filing to administrator triage and resolution.
4. **Data Isolation Strategy (`tests/conftest.py`):** All automated tests execute against an isolated temporary SQLite database created in `tempfile.mkstemp()`. The production/demonstration database (`campus_complaints.db`) is never modified or deleted by test runs.

---

## 2. Comprehensive Test Execution Matrix

All **24 automated test cases** listed below were **actually executed** on the host environment and passed successfully.

| Test Case ID | Test Category | Scenario / Feature Under Test | Test Input / Preconditions | Expected Result | Actual Result | Status |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-UNIT-01** | Unit | User registration & password hashing | Name: "Daniel White", Email: "daniel@student.campus.edu", Pass: "SecurePass987!" | User row created; password stored as PBKDF2:SHA256 hash; plaintext password not stored. | Stored hash matches algorithm; verify function returns True. | **PASS** |
| **TC-UNIT-02** | Unit | Duplicate email constraint | Register with existing email "alice@student.campus.edu" | Exception raised: `ValueError("An account with this email address already exists.")` | Handled gracefully with exact message. | **PASS** |
| **TC-UNIT-03** | Unit | Duplicate Student ID constraint | Register with existing student_id "STU-TEST-001" | Exception raised: `ValueError("An account with this Student ID already exists.")` | Handled gracefully with exact message. | **PASS** |
| **TC-UNIT-04** | Unit | Authentication verification | Valid email + valid password; valid ID + valid password; bad password | User dict returned for valid credentials; `None` returned for wrong password. | Verified for email and student ID. | **PASS** |
| **TC-UNIT-05** | Unit | Deterministic Complaint ID generation | Clean database with year 2026 | First complaint ID generated must be `CMP-2026-0001`. | Returned `CMP-2026-0001`. | **PASS** |
| **TC-UNIT-06** | Unit | Complaint creation & atomic history | Title: "Broken chair", Category: "Classroom...", Dept: "Estate" | Complaint inserted with status `Submitted`; initial history entry created in same transaction. | Verified 1 complaint and 1 history record committed. | **PASS** |
| **TC-UNIT-07** | Unit | Student edit restrictions | Alice edits complaint when status is `Submitted` vs `In Progress` | Edit allowed while `Submitted`; blocked with error message when `In Progress`. | Allowed when Submitted; rejected when In Progress. | **PASS** |
| **TC-UNIT-08** | Unit | Student withdrawal restrictions | Alice withdraws complaint when status is `Submitted` vs `In Progress` | Withdrawal allowed while `Submitted` (status becomes `Closed`); blocked when `In Progress`. | Status changed to `Closed` when Submitted; blocked when In Progress. | **PASS** |
| **TC-UNIT-09** | Unit | Multi-tenant ownership check | Student Bob attempts to edit Alice's complaint | Action rejected: "Unauthorized: You can only edit your own complaints." | Rejected with unauthorized message. | **PASS** |
| **TC-UNIT-10** | Unit | Live student statistics calculation | Alice has 1 submitted complaint and 1 resolved complaint | Returns `{'total': 2, 'submitted': 1, 'in_progress': 0, 'resolved': 1}` | Exact count match from live database. | **PASS** |
| **TC-UNIT-11** | Unit | Mean resolution turnaround calculation | Resolved complaint with 3 hours duration | Admin stats `avg_resolution_hours` calculates to approximately 3.0 hours. | Computed 3.0 hours correctly via SQLite `julianday`. | **PASS** |
| **TC-UNIT-12** | Unit | Registration input validation (valid) | Valid name, email, department, passwords, student ID | `validate_registration` returns `(True, [])`. | Validated successfully with 0 errors. | **PASS** |
| **TC-UNIT-13** | Unit | Registration validation (boundary/bad) | Empty name, malformed emails, passwords < 6 chars, mismatch | `validate_registration` returns `(False, [errors])`. | All boundary errors flagged. | **PASS** |
| **TC-UNIT-14** | Unit | Complaint validation (valid) | Title >= 5 chars, desc >= 10 chars, valid category & priority | `validate_complaint` returns `(True, [])`. | Validated successfully. | **PASS** |
| **TC-UNIT-15** | Unit | Complaint validation (invalid) | Blank title, title < 5 chars, desc < 10 chars, invalid category | `validate_complaint` returns `(False, [errors])`. | Correctly rejected invalid values. | **PASS** |
| **TC-UNIT-16** | Unit | Status transition matrix | Permitted transitions vs illegal jumps (`Closed` &rarr; `In Progress`) | Legal transitions pass; illegal jumps return `(False, message)`. | Validated status progression logic. | **PASS** |
| **TC-INT-01** | Integration | Student registration route | POST `/register` with full student form data | Flash "Registration successful"; redirect to `/login`. | HTTP 200 after redirect; user exists in DB. | **PASS** |
| **TC-INT-02** | Integration | Student & Admin login/logout | POST `/login` with student credentials; POST `/login` with admin credentials | Student redirects to `/student/dashboard`; admin redirects to `/admin/dashboard`; POST `/logout` clears session. | Successfully authenticated and redirected both roles. | **PASS** |
| **TC-INT-03** | Integration | Role-Based Access Control (RBAC) | Authenticated student visits `/admin/dashboard`, `/admin/complaints` | HTTP 403 Forbidden; Access Denied page rendered. | HTTP 403 returned on all admin endpoints. | **PASS** |
| **TC-INT-04** | Integration | Cross-student access prohibition | Alice attempts to GET `/student/complaints/<Bob_CID>` | HTTP 403 Forbidden; Alice cannot view Bob's complaint details. | HTTP 403 returned. | **PASS** |
| **TC-INT-05** | Integration | Search & Filter execution | Search keyword "Router", filter status="Resolved" | Keyword matches complaint; non-matching status yields "No complaints found" empty state. | Real-time filtering verified. | **PASS** |
| **TC-INT-06** | Integration | SQL Injection Immunity | Search payload: `' OR 1=1; DROP TABLE users; --` | Parameterized query treats input as literal string; database and users table remain intact. | Users table intact; HTTP 200 without SQL execution. | **PASS** |
| **TC-INT-07** | Integration | Jinja XSS Auto-escaping | Title: `<script>alert("XSS Attack!");</script>` | Script tag auto-escaped to `&lt;script&gt;`; no executable script in DOM. | Verified HTML escaping in response. | **PASS** |
| **TC-INT-08** | Integration | CSRF Security Verification | POST `/login` with `WTF_CSRF_ENABLED=True` and missing token | Request rejected with HTTP 400 Bad Request. | HTTP 400 returned with CSRF security error. | **PASS** |
| **TC-SEL-01** | E2E Browser | Complete End-to-End User & Admin Flow | Headless Chrome automation: Student logs in &rarr; Submits complaint &rarr; Checks detail &rarr; Logs out &rarr; Admin logs in &rarr; Updates status to `In Progress` with assigned technician &rarr; Logs out | Browser completes entire user journey without errors; status update reflected on screen. | Verified full DOM interaction and redirect flow. | **PASS** |

---

## 3. Actual Pytest & Coverage Execution Output

The following test run was executed on the local environment:

```text
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\haeue\OneDrive\Desktop\Jenoi\College\MP\student-complaint-portal\Campus-Complaint-management-
plugins: anyio-4.15.1, cov-7.1.0
collected 23 items

tests\unit\test_models.py ......                                         [ 26%]
tests\unit\test_stats.py .                                               [ 30%]
tests\unit\test_validation.py .....                                      [ 52%]
tests\integration\test_admin_routes.py ...                               [ 65%]
tests\integration\test_auth_routes.py ..                                 [ 73%]
tests\integration\test_security.py ...                                   [ 86%]
tests\integration\test_student_routes.py ...                             [100%]

=============================== tests coverage ================================
Name                                       Stmts   Miss  Cover   Missing
------------------------------------------------------------------------
app.py                                        37      8    78%   11, 46-50, 55-56
config.py                                     26      0   100%
database\__init__.py                           3      0   100%
database\connection.py                        37     16    57%   10-11, 21-26, 34-35, 40-46
database\db_init.py                           21      4    81%   41-44
models\__init__.py                             3      0   100%
models\complaint.py                          193     26    87%   29-30, 110-111, 113-114, 142-143, 145-146, 148-149, 151-152, 176, 186, 212, 215, 220-237, 249, 258
models\user.py                                59      3    95%   37-39
routes\__init__.py                             5      0   100%
routes\admin_routes.py                        57      3    95%   62, 83, 107
routes\auth_routes.py                         72     15    79%   13-15, 36-38, 58-60, 71-73, 80-81, 102
routes\error_handlers.py                      17      3    82%   17-18, 22
routes\student_routes.py                     103     31    70%   74-76, 97-99, 122, 139, 144-174, 190, 195-208
scripts\__init__.py                            0      0   100%
services\__init__.py                           4      0   100%
services\auth_service.py                      45     20    56%   7-21, 28-29, 38-39, 50-51, 53
services\csrf.py                              19      0   100%
services\validation.py                        58      4    93%   42, 45, 75, 78
tests\__init__.py                              0      0   100%
tests\conftest.py                             44      2    95%   65-66
tests\integration\test_admin_routes.py        39      0   100%
tests\integration\test_auth_routes.py         22      0   100%
tests\integration\test_security.py            26      0   100%
tests\integration\test_student_routes.py      34      0   100%
tests\unit\test_models.py                     67      0   100%
tests\unit\test_stats.py                      36      0   100%
tests\unit\test_validation.py                 49      0   100%
------------------------------------------------------------------------
TOTAL                                       1181    240    80%
============================= 23 passed in 6.61s ==============================
```

### Selenium Browser Automation Execution Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\haeue\OneDrive\Desktop\Jenoi\College\MP\student-complaint-portal\Campus-Complaint-management-
plugins: anyio-4.15.1, cov-7.1.0
collected 1 item

tests/selenium/test_browser_flow.py::test_full_browser_workflow PASSED   [100%]

======================== 1 passed, 1 warning in 17.75s ========================
```

---

## 4. Defect Discovery & Remediation Summary

During test execution, 3 specific real defects were discovered and addressed:

1. **Jinja Slicing on DateTime Objects:**
   - *Symptom:* `TypeError: 'datetime.datetime' object is not subscriptable` when rendering `{{ c.created_at[:16] }}`.
   - *Root Cause:* SQLite's `PARSE_DECLTYPES` returned Python `datetime` objects instead of strings, triggering Python 3.12 deprecation warnings and template syntax errors.
   - *Resolution:* Removed `detect_types=sqlite3.PARSE_DECLTYPES` in `database/connection.py` and wrapped timestamps with `{{ (c.created_at|string)[:16] }}`.
2. **Pytest Fixture Client Session Collisions:**
   - *Symptom:* `test_sql_injection_resistance` failed with HTTP 403 Forbidden.
   - *Root Cause:* Injecting both `student_client` and `admin_client` on the same test caused student Alice to remain logged in when `/login` was called without a GET check.
   - *Resolution:* Updated `routes/auth_routes.py` to allow re-login on POST requests, and isolated `admin_client` in `test_security.py`.
3. **Hidden Navbar Dropdown Element Interception in Selenium:**
   - *Symptom:* `ElementNotInteractableException` during Selenium automated complaint submission.
   - *Root Cause:* The locator `button[type='submit']` selected the hidden logout button inside the collapsed profile dropdown in the navbar before the card form button.
   - *Resolution:* Targeted the exact form selector `form[action*='complaints/new'] button[type='submit']` with `scrollIntoView()`.

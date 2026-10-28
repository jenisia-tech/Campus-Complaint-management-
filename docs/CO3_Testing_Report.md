# Course Outcome 3 (CO3): Software Testing Report

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Test Frameworks:** Vitest 3.2.7, Playwright 1.50.1, React Testing Library  
*Preserved Legacy Frameworks:* pytest 9.1.1, pytest-cov 7.1.0, Selenium 4.51.0 (in `legacy_flask/`)  
**Execution Environment:** Windows 11, Node.js v25.8.1

---

## 1. Testing Strategy & Test Architecture

A comprehensive, multi-tiered testing strategy was designed and executed across the Next.js and Supabase full-stack architecture:

1. **Unit Testing (`tests/unit/`):**
   - **Schema Validations:** Tests Zod schemas (`createComplaintSchema`, `complaintUpdateSchema`, `loginSchema`, `registerSchema`) against boundary inputs, length constraints, and email formats.
   - **Status Workflow State Machine:** Tests `isValidTransition` to enforce strictly allowed transitions and reject unauthorized shortcuts (e.g. `Submitted` &rarr; `Resolved` directly).
   - **Utility Functions:** Tests `getStatusBadge`, `getPriorityBadge`, `formatDate`, and `calculateAverageTurnaround`.

2. **Integration Testing (`tests/integration/`):**
   - **Role & Ownership Rules:** Verifies that students can edit and withdraw complaints strictly while in `Submitted` status, and that tickets in `Under Review`, `In Progress`, or `Resolved` statuses are locked.
   - **Administrative Actions:** Validates admin update payloads for technician assignments, priority escalation, and resolution notes recording.

3. **End-to-End Browser Testing (`tests/e2e/campus-flow.spec.ts`):**
   - Automates full browser interaction via Playwright across Homepage, Student Registration, Login with evaluation demo fills, and responsive layouts.

---

## 2. Comprehensive Test Execution Matrix

All **27 automated Vitest unit and integration test cases** listed below were **actually executed** on the host environment and passed successfully (100% pass rate).

| Test Case ID | Test Category | Feature Under Test | Input / Precondition | Expected Behavior | Actual Result | Status |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-VAL-01** | Unit | Complaint submission schema (valid) | Complete valid payload with title >= 5 chars, category, location, priority | `createComplaintSchema.safeParse` succeeds | Parsed successfully | **PASS** |
| **TC-VAL-02** | Unit | Title boundary validation | Title: "Fix" (< 5 characters) | Schema rejection with "at least 5 characters" | Rejected with exact message | **PASS** |
| **TC-VAL-03** | Unit | Category domain constraint | Category: "Quantum Teleportation Unit" | Schema rejection (not in permitted categories) | Rejected | **PASS** |
| **TC-VAL-04** | Unit | Login credentials validation (valid) | Email: `student@campus.edu`, Password >= 6 chars | `loginSchema.safeParse` succeeds | Accepted | **PASS** |
| **TC-VAL-05** | Unit | Login email format constraint | Email: "invalid-email" | Schema rejection | Rejected with email format error | **PASS** |
| **TC-VAL-06** | Unit | Registration password matching | Mismatched password and confirm_password | Schema rejection: "Passwords do not match" | Rejected with matching error | **PASS** |
| **TC-SM-01** | Unit | Sequential transition: Submitted &rarr; Under Review | Current: `Submitted`, Target: `Under Review` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-02** | Unit | Direct assignment: Submitted &rarr; Assigned | Current: `Submitted`, Target: `Assigned` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-03** | Unit | Work start: Assigned &rarr; In Progress | Current: `Assigned`, Target: `In Progress` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-04** | Unit | Completion: In Progress &rarr; Resolved | Current: `In Progress`, Target: `Resolved` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-05** | Unit | Final Closure: Resolved &rarr; Closed | Current: `Resolved`, Target: `Closed` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-06** | Unit | Admin Reopening: Resolved &rarr; Reopened | Current: `Resolved`, Target: `Reopened` | `isValidTransition` returns `true` | Returned `true` | **PASS** |
| **TC-SM-07** | Unit | Illicit shortcut: Submitted &rarr; Resolved | Current: `Submitted`, Target: `Resolved` directly | `isValidTransition` returns `false` | Blocked (`false`) | **PASS** |
| **TC-SM-08** | Unit | Backward step: Closed &rarr; Submitted | Current: `Closed`, Target: `Submitted` | `isValidTransition` returns `false` | Blocked (`false`) | **PASS** |
| **TC-UTL-01** | Unit | Tailwind class merger `cn()` | Conflicting classes: `px-4` vs `px-6` | `px-6` overrides `px-4` | Correctly resolved | **PASS** |
| **TC-UTL-02** | Unit | `getStatusBadge` color mapping | Status: Submitted, In Progress, Resolved, Closed, Reopened | Distinct color tokens returned | Verified color classes | **PASS** |
| **TC-UTL-03** | Unit | `getPriorityBadge` styling | Priority: Low, Medium, High, Critical | Critical returns pulse animation token | Verified styling tokens | **PASS** |
| **TC-UTL-04** | Unit | Date formatting null safety | Input: `null` or `undefined` | Returns fallback dash `"—"` | Returned `"—"` | **PASS** |
| **TC-UTL-05** | Unit | Date formatting valid ISO | Input: `"2026-10-29T10:00:00Z"` | Returns localized month, day, year string | Formatted correctly | **PASS** |
| **TC-UTL-06** | Unit | Turnaround calculation zero check | Zero resolved complaints | Returns `0` | Returned `0` | **PASS** |
| **TC-UTL-07** | Unit | Turnaround calculation average hours | Complaints with 4h and 6h durations | Computes average: 5.0 hours | Computed `5` | **PASS** |
| **TC-INT-01** | Integration | Student edit permissions by status | Allowed only when status === `'Submitted'` | True for `Submitted`; False for `In Progress`, `Resolved`, `Closed` | Correctly enforced | **PASS** |
| **TC-INT-02** | Integration | Student withdrawal permissions by status | Allowed only when status === `'Submitted'` | True for `Submitted`; False for subsequent states | Correctly enforced | **PASS** |
| **TC-INT-03** | Integration | Standard forward lifecycle verification | Complete chain: Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Closed | All transitions return `true` | Verified | **PASS** |
| **TC-INT-04** | Integration | Reopened lifecycle verification | Resolved &rarr; Reopened &rarr; In Progress | Transitions return `true` | Verified | **PASS** |
| **TC-INT-05** | Integration | Admin payload: staff assignment & remarks | Assigned technician and priority escalation | `adminUpdateSchema.safeParse` succeeds | Validated | **PASS** |
| **TC-INT-06** | Integration | Admin payload: formal resolution notes | Resolution notes recording on completion | `adminUpdateSchema.safeParse` succeeds | Validated | **PASS** |

---

## 3. Actual Vitest Test Execution Output

```text
> campus-complaint-management-system@1.0.0 test
> vitest run

 RUN  v3.2.7 C:/Users/haeue/OneDrive/Desktop/Jenoi/College/MP/student-complaint-portal/Campus-Complaint-management-

 ✓ tests/integration/api-complaints.test.ts (6 tests) 6ms
 ✓ tests/unit/validation.test.ts (14 tests) 8ms
 ✓ tests/unit/utils.test.ts (7 tests) 37ms

 Test Files  3 passed (3)
      Tests  27 passed (27)
   Start at  02:11:57
   Duration  1.61s (transform 198ms, setup 0ms, collect 385ms, tests 51ms, environment 1ms, prepare 721ms)
```

---

## 4. End-to-End Playwright Automated Test Suite

The Playwright browser automation test suite (`tests/e2e/campus-flow.spec.ts`) covers:
1. **Public Landing Experience:** Validates IA3 evaluation matrix badges (CO1–CO5), hero titles, and responsive call-to-actions.
2. **Student & Admin Quick Demo Fill:** Automates evaluation helper buttons (`Student Demo` and `Admin Demo`) to verify pre-fill logic and credentials input.
3. **Student Registration Form:** Verifies input fields (Name, Student Roll ID, Email, Department, Password, Confirm Password) and client validations.

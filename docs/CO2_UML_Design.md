# Course Outcome 2 (CO2): UML Design & System Architecture

**Project Title:** Campus Complaint Management System  
**Academic Evaluation:** College Software Engineering (IA3 Practical Evaluation)  
**Implementation Technology:** Python (Flask), SQLite, HTML5, CSS3, JavaScript (Bootstrap 5), pytest, Selenium

---

## 1. System Overview & Architecture

The **Campus Complaint Management System** is built on a **Modular Model-View-Controller (MVC) architectural pattern** combined with a Service-Layer abstraction. 

- **Controller Layer (Flask Blueprints in `routes/`):** Manages HTTP routing, session inspection, and orchestrates request handling (`auth_routes.py`, `student_routes.py`, `admin_routes.py`, `error_handlers.py`).
- **Service Layer (`services/`):** Houses cross-cutting business logic, input validation (`validation.py`), session authorization decorators (`auth_service.py`), and CSRF token verification (`csrf.py`).
- **Model Layer (`models/`):** Encapsulates data persistence, parameterized SQL queries, password hashing, ID generation, and multi-table transactions (`user.py`, `complaint.py`).
- **View Layer (`templates/` and `static/`):** Renders responsive HTML5 views using Jinja2 templating, Bootstrap 5 styling, and Chart.js dynamic visualizations.
- **Persistence Layer (`database/`):** SQLite database engine enforcing referential integrity with foreign key constraints, default timestamps, and indexes.

---

## 2. UML Diagrams

### 2.1 Use Case Diagram

The Use Case representation below details the actor interactions for both **Student** and **Administrator** roles, showing clear boundaries and role separation.

```mermaid
graph LR
    subgraph Actors
        Student["fa:fa-user Student"]
        Admin["fa:fa-user-shield Administrator"]
    end

    subgraph "Campus Complaint Portal"
        UC1(["Register Account"])
        UC2(["Log In / Log Out"])
        UC3(["View Student Dashboard"])
        UC4(["Submit New Complaint"])
        UC5(["View My Complaints & Timeline"])
        UC6(["Edit / Withdraw Complaint (Submitted state only)"])
        UC7(["View Admin Dashboard & Charts"])
        UC8(["Search & Filter Campus Directory"])
        UC9(["Assign Staff & Update Priority"])
        UC10(["Advance Status & Resolution Notes"])
        UC11(["Reopen Resolved Complaint"])
        UC12(["View Analytical Reports"])
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

    UC4 -.->|"<<generates>>"| UC4_ID(["Unique ID CMP-YYYY-XXXX"])
    UC10 -.->|"<<records>>"| UC10_HIST(["Status History Audit Log"])
```

#### Code Mapping:
- `UC1, UC2` are implemented in `routes/auth_routes.py` (`register()`, `login()`, `logout()`).
- `UC3, UC4, UC5, UC6` are implemented in `routes/student_routes.py` with ownership checks in `ComplaintModel.update_by_student()` and `ComplaintModel.withdraw_by_student()`.
- `UC7, UC8, UC9, UC10, UC11, UC12` are restricted to `role='admin'` via the `@admin_required` decorator in `services/auth_service.py` and implemented in `routes/admin_routes.py`.

---

### 2.2 Class Diagram

The class diagram below depicts the structural relationships between the model layer, service validators, and database entities.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string student_id
        +string email
        +string password_hash
        +string role
        +string department
        +datetime created_at
        +create_user(name, email, password, role, dept, student_id) Dict
        +authenticate(identifier, password) Dict
        +get_by_id(user_id) Dict
        +get_by_email(email) Dict
    }

    class Complaint {
        +int id
        +string complaint_id
        +int user_id
        +string title
        +string description
        +string category
        +string location
        +string department
        +string priority
        +string status
        +string assigned_to
        +string admin_remarks
        +string resolution_notes
        +datetime created_at
        +datetime updated_at
        +datetime resolved_at
        +generate_complaint_id() string
        +create_complaint(user_id, name, title, desc, cat, loc, dept, prio) Dict
        +get_by_id(complaint_id) Dict
        +update_by_student(cid, uid, uname, title, desc, cat, loc, dept, prio) Tuple
        +withdraw_by_student(cid, uid, uname, reason) Tuple
        +admin_update(cid, admin_id, admin_name, status, prio, assigned, dept, remarks, notes) Tuple
        +get_student_stats(user_id) Dict
        +get_admin_stats() Dict
    }

    class ComplaintHistory {
        +int id
        +string complaint_id
        +int changed_by_user_id
        +string changed_by_name
        +string old_status
        +string new_status
        +string remarks
        +datetime created_at
    }

    class ValidationService {
        <<service>>
        +validate_registration(name, email, pwd, confirm_pwd, dept, stu_id, role) Tuple
        +validate_complaint(title, desc, cat, loc, dept, prio) Tuple
        +validate_status_transition(old_status, new_status) Tuple
    }

    class AuthService {
        <<service>>
        +get_current_user() Dict
        +login_required(func) func
        +student_required(func) func
        +admin_required(func) func
        +generate_csrf_token() string
        +csrf_protect(func) func
    }

    User "1" --> "0..*" Complaint : submits
    Complaint "1" *-- "1..*" ComplaintHistory : tracks
    User "1" --> "0..*" ComplaintHistory : records_changes
    Complaint ..> ValidationService : validates
    Complaint ..> AuthService : authorizes
```

#### Code Mapping:
- `User` corresponds to `models/user.py` (`UserModel`).
- `Complaint` corresponds to `models/complaint.py` (`ComplaintModel`).
- `ComplaintHistory` corresponds to records in SQLite table `complaint_history` inserted atomically inside `ComplaintModel` transactions.
- `ValidationService` corresponds to `services/validation.py`.
- `AuthService` corresponds to `services/auth_service.py` and `services/csrf.py`.

---

### 2.3 Component Diagram

The component diagram illustrates the high-level packaging and subsystem interactions.

```mermaid
graph TD
    subgraph ClientBrowser ["Client Web Browser"]
        HTMLUI["Bootstrap 5 Responsive UI (HTML/CSS/JS)"]
        ChartComp["Chart.js Dynamic Visualizer"]
    end

    subgraph ApplicationServer ["Python Flask Application Server"]
        WSGI["WSGI App Factory (app.py)"]
        
        subgraph Controllers ["Controllers (Routes)"]
            AuthRoute["auth_bp (routes/auth_routes.py)"]
            StudentRoute["student_bp (routes/student_routes.py)"]
            AdminRoute["admin_bp (routes/admin_routes.py)"]
            ErrorRoute["error_bp (routes/error_handlers.py)"]
        end

        subgraph Services ["Core Services"]
            AuthSvc["Auth & RBAC Decorators (services/auth_service.py)"]
            CSRFSvc["CSRF Protection (services/csrf.py)"]
            ValidSvc["Input & State Transition Validation (services/validation.py)"]
        end

        subgraph Models ["Data Access Layer"]
            UserMdl["UserModel (models/user.py)"]
            CompMdl["ComplaintModel (models/complaint.py)"]
        end

        subgraph DBManager ["Database Connection Manager"]
            DBConn["connection.py (Row Factory & PRAGMA foreign_keys)"]
            DBSchema["schema.sql & db_init.py"]
        end
    end

    subgraph Storage ["Persistent Storage"]
        SQLiteDB[("SQLite Database: campus_complaints.db")]
    end

    HTMLUI <-->|HTTP GET/POST Requests| WSGI
    ChartComp <-->|JSON Data Feed| WSGI
    WSGI --> Controllers
    Controllers --> Services
    Controllers --> Models
    Models --> DBManager
    DBManager <-->|SQL Queries & Transactions| SQLiteDB
```

---

### 2.4 Activity Diagram: Student Complaint Submission

The activity diagram below illustrates the exact workflow executed from the moment a student fills the complaint form to database persistence and history logging.

```mermaid
flowchart TD
    Start([Student opens Submit Complaint form]) --> FillForm[Student fills title, category, location, department, priority, description]
    FillForm --> ClientSubmit[Student clicks Submit Complaint button]
    ClientSubmit --> CheckCSRF{CSRF Token valid?}
    
    CheckCSRF -- No --> Abort400[Return 400 Bad Request error]
    CheckCSRF -- Yes --> CheckSession{Student logged in?}
    
    CheckSession -- No --> RedirectLogin[Redirect to login with warning flash]
    CheckSession -- Yes --> ValidateInput{Validate inputs:<br/>title >= 5 chars,<br/>desc >= 10 chars,<br/>valid category & prio}
    
    ValidateInput -- Invalid --> ShowErrors[Render form with validation error messages]
    ValidateInput -- Valid --> GenID[Generate unique sequential ID CMP-YYYY-XXXX]
    
    GenID --> StartTxn[Begin SQLite Database Transaction]
    StartTxn --> InsertComplaint[Insert record into complaints table with status 'Submitted']
    InsertComplaint --> InsertHist[Insert initial record into complaint_history table]
    InsertHist --> CommitTxn{Commit Transaction}
    
    CommitTxn -- Failure --> Rollback[Rollback transaction & return error]
    CommitTxn -- Success --> FlashSuccess[Flash success message with Complaint ID]
    FlashSuccess --> RedirectDetail[Redirect to /student/complaints/CMP-YYYY-XXXX]
    RedirectDetail --> End([End Workflow])
```

#### Code Mapping:
- Initiated in `templates/student/submit_complaint.html`.
- Handled in `routes/student_routes.py` (`submit_complaint()`).
- Atomic transaction implemented in `models/complaint.py` (`create_complaint()`).

---

### 2.5 Sequence Diagram: Administrator Complaint Resolution Workflow

The sequence diagram below shows the detailed interaction between the Administrator, the Web Controller, Service Validators, Data Models, and SQLite during a complaint status update and resolution note assignment.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant Browser as Web Browser (UI)
    participant Route as routes/admin_routes.py
    participant Auth as services/auth_service.py
    participant Valid as services/validation.py
    participant Model as models/complaint.py
    participant DB as SQLite (campus_complaints.db)

    Admin->>Browser: Selects status 'In Progress', inputs assigned technician, clicks 'Save Updates'
    Browser->>Route: POST /admin/complaints/CMP-2026-0001/update (form data, csrf_token)
    
    Route->>Auth: @admin_required check
    Auth-->>Route: Role validated (session.role == 'admin')
    
    Route->>Model: get_by_id("CMP-2026-0001")
    Model->>DB: SELECT * FROM complaints WHERE complaint_id = ?
    DB-->>Model: Complaint row returned (current_status: 'Submitted')
    Model-->>Route: Complaint dict
    
    Route->>Model: admin_update(cid, admin_id, new_status='In Progress', assigned_to='HVAC Team', remarks='...')
    Model->>Valid: validate_status_transition('Submitted', 'In Progress')
    Valid-->>Model: (True, "Valid transition")
    
    Model->>DB: UPDATE complaints SET status='In Progress', assigned_to='...', updated_at=CURRENT_TIMESTAMP WHERE complaint_id=?
    Model->>DB: INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, remarks) VALUES (...)
    Model->>DB: COMMIT TRANSACTION
    DB-->>Model: Transaction confirmed
    Model-->>Route: (True, "Complaint updated successfully.")
    
    Route->>Browser: HTTP 302 Redirect to /admin/complaints/CMP-2026-0001
    Browser->>Route: GET /admin/complaints/CMP-2026-0001
    Route->>Model: get_by_id() + get_history()
    Model->>DB: Query complaint details & full audit log
    DB-->>Model: Joined student info and chronological history
    Model-->>Route: Data bundle
    Route-->>Browser: Render templates/admin/complaint_detail.html with updated badges & audit timeline
    Browser-->>Admin: Displays updated status badge 'In Progress' and assigned technician
```

---

## 3. UI Prototype Evolution & Screen-by-Screen Description

### 3.1 Initial Prototype Design vs. Final Implemented UI

During initial conception, a basic low-fidelity wireframe was planned. Below is the comparative evolution from that initial design to the final production implementation:

| Interface Component | Initial Wireframe Prototype | Final Implemented Interface | Usability & Functional Improvements |
| :--- | :--- | :--- | :--- |
| **Portal Landing Page** | Plain HTML text links to login. | Polished Hero Section with key value proposition badges, system feature highlights, and a quick-demonstration credential card. | Evaluators can immediately view credentials and test accounts without digging through terminal logs. |
| **Student Dashboard** | Simple table listing all complaints. | Stat Cards (Total, Submitted, In Progress, Resolved) with soft hover transitions, prominent "Submit New Complaint" CTA, and Recent Complaints summary table. | Immediate visual summary of active issues; one-click action to file new grievances. |
| **Complaint Details View** | Plain text readouts of complaint attributes. | Two-column responsive layout: Left column features rich metadata cards and prominent Admin Remarks/Resolution alert boxes; Right column features an elegant vertical CSS status audit timeline. | Clear separation between complaint content and administrative progress tracking. |
| **Admin Dashboard** | Basic count numbers and raw table. | High-level KPI metric cards, Critical priority indicator, mean resolution turnaround hours, interactive Chart.js Doughnut (categories) and Bar (statuses) graphs. | Administrators instantly spot departmental bottlenecks and repeat defect patterns visually. |
| **Search & Filters** | Single text input searching only IDs. | Multi-parameter filter bar combining keyword search (matching titles, IDs, locations, student names) with dropdown filters for category, department, priority, and status. | Facilitates granular triage during facility management audits. |

---

### 3.2 Screen-by-Screen Walkthrough

1. **Portal Home (`/` - `index.html`):** Welcomes users, describes the 10 grievance categories, and displays demonstration credentials for testing.
2. **Authentication Screens (`/login`, `/register`):**
   - Clean, centered Bootstrap cards with email/student ID input validation.
   - Prevents duplicate roll number and email registrations.
3. **Student Dashboard (`/student/dashboard`):** Real database statistics (Total, Submitted, In Progress, Resolved) and table of the student's 5 most recent submissions.
4. **Complaint Submission Screen (`/student/complaints/new`):** Dropdowns populated dynamically from configuration (`Config.COMPLAINT_CATEGORIES`, `Config.CAMPUS_DEPARTMENTS`, `Config.COMPLAINT_PRIORITIES`), with character counters and input guidelines.
5. **Student Complaint Detail (`/student/complaints/<id>`):** Full details, administrator resolution notes, status timeline, and conditionally rendered **Edit** and **Withdraw** buttons (rendered *only* when status is `Submitted`).
6. **Administrator Dashboard (`/admin/dashboard`):** Real-time database metrics, Chart.js category and status charts, and quick-action links to pending complaints.
7. **Administrator Complaints Directory (`/admin/complaints`):** Comprehensive search and filtering table displaying all campus grievances with quick links to manage.
8. **Administrator Action Screen (`/admin/complaints/<id>`):** Full student information panel, complaint body, and an administrative control card with status dropdowns, staff assignment fields, internal remarks, and public resolution notes.
9. **Analytical Reports Screen (`/admin/reports`):** Statistical breakdowns by category and department with percentage shares and a one-click browser print/export trigger (`window.print()`).

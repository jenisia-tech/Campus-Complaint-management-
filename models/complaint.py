import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from database.connection import get_db, db_transaction
from services.validation import validate_status_transition, validate_complaint

class ComplaintModel:
    """Handles Complaint business logic, state transitions, transactions, and analytics."""

    @staticmethod
    def generate_complaint_id(conn=None) -> str:
        """Generate unique complaint ID in format CMP-YYYY-XXXX."""
        db = conn or get_db()
        year = datetime.now().year
        cursor = db.cursor()
        prefix = f"CMP-{year}-"
        
        cursor.execute(
            """SELECT complaint_id FROM complaints 
               WHERE complaint_id LIKE ? 
               ORDER BY id DESC LIMIT 1""",
            (f"{prefix}%",)
        )
        row = cursor.fetchone()
        if row and row['complaint_id']:
            last_id = row['complaint_id']
            try:
                seq_num = int(last_id.split('-')[-1]) + 1
            except (ValueError, IndexError):
                seq_num = 1
        else:
            seq_num = 1
            
        return f"{prefix}{seq_num:04d}"

    @staticmethod
    def create_complaint(user_id: int, user_name: str, title: str, description: str,
                         category: str, location: str, department: str,
                         priority: str = 'Medium', conn=None) -> Dict[str, Any]:
        """Create a new complaint and record initial history within a single transaction."""
        db = conn or get_db()
        complaint_id = ComplaintModel.generate_complaint_id(db)
        
        cursor = db.cursor()
        cursor.execute(
            """INSERT INTO complaints 
               (complaint_id, user_id, title, description, category, location, department, priority, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')""",
            (complaint_id, user_id, title.strip(), description.strip(),
             category.strip(), location.strip(), department.strip(), priority.strip())
        )
        
        # Record initial status in history
        cursor.execute(
            """INSERT INTO complaint_history
               (complaint_id, changed_by_user_id, changed_by_name, old_status, new_status, remarks)
               VALUES (?, ?, ?, NULL, 'Submitted', 'Complaint submitted by student')""",
            (complaint_id, user_id, user_name)
        )
        db.commit()
        
        return ComplaintModel.get_by_id(complaint_id, db)

    @staticmethod
    def get_by_id(complaint_id: str, conn=None) -> Optional[Dict[str, Any]]:
        """Retrieve complaint with student details."""
        db = conn or get_db()
        cursor = db.cursor()
        cursor.execute(
            """SELECT c.*, 
                      u.name AS student_name, 
                      u.student_id AS student_reg_no, 
                      u.email AS student_email,
                      u.department AS student_department
               FROM complaints c
               JOIN users u ON c.user_id = u.id
               WHERE c.complaint_id = ?""",
            (complaint_id,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def get_history(complaint_id: str, conn=None) -> List[Dict[str, Any]]:
        """Retrieve full chronological history for a complaint."""
        db = conn or get_db()
        cursor = db.cursor()
        cursor.execute(
            """SELECT * FROM complaint_history
               WHERE complaint_id = ?
               ORDER BY created_at ASC, id ASC""",
            (complaint_id,)
        )
        return [dict(r) for r in cursor.fetchall()]

    @staticmethod
    def get_student_complaints(user_id: int, status: str = None, category: str = None,
                               priority: str = None, search: str = None, conn=None) -> List[Dict[str, Any]]:
        """Retrieve complaints submitted by a specific student with optional filters."""
        db = conn or get_db()
        cursor = db.cursor()
        
        query = "SELECT * FROM complaints WHERE user_id = ?"
        params: List[Any] = [user_id]
        
        if status:
            query += " AND status = ?"
            params.append(status)
        if category:
            query += " AND category = ?"
            params.append(category)
        if priority:
            query += " AND priority = ?"
            params.append(priority)
        if search:
            search_param = f"%{search.strip()}%"
            query += " AND (complaint_id LIKE ? OR title LIKE ? OR description LIKE ? OR location LIKE ?)"
            params.extend([search_param, search_param, search_param, search_param])
            
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

    @staticmethod
    def get_all_complaints(status: str = None, category: str = None, priority: str = None,
                           department: str = None, search: str = None, conn=None) -> List[Dict[str, Any]]:
        """Retrieve all campus complaints for administrator review with filters and search."""
        db = conn or get_db()
        cursor = db.cursor()
        
        query = """SELECT c.*, 
                          u.name AS student_name, 
                          u.student_id AS student_reg_no, 
                          u.email AS student_email,
                          u.department AS student_department
                   FROM complaints c
                   JOIN users u ON c.user_id = u.id
                   WHERE 1=1"""
        params: List[Any] = []
        
        if status:
            query += " AND c.status = ?"
            params.append(status)
        if category:
            query += " AND c.category = ?"
            params.append(category)
        if priority:
            query += " AND c.priority = ?"
            params.append(priority)
        if department:
            query += " AND c.department = ?"
            params.append(department)
        if search:
            search_param = f"%{search.strip()}%"
            query += """ AND (c.complaint_id LIKE ? 
                              OR c.title LIKE ? 
                              OR c.description LIKE ? 
                              OR c.location LIKE ? 
                              OR u.student_id LIKE ? 
                              OR u.name LIKE ?)"""
            params.extend([search_param, search_param, search_param, search_param, search_param, search_param])
            
        query += " ORDER BY c.created_at DESC"
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

    @staticmethod
    def update_by_student(complaint_id: str, user_id: int, user_name: str,
                          title: str, description: str, category: str,
                          location: str, department: str, priority: str, conn=None) -> Tuple[bool, str]:
        """Allow student to edit complaint only if still in 'Submitted' status."""
        db = conn or get_db()
        complaint = ComplaintModel.get_by_id(complaint_id, db)
        
        if not complaint:
            return False, "Complaint not found."
            
        if complaint['user_id'] != user_id:
            return False, "Unauthorized: You can only edit your own complaints."
            
        if complaint['status'] != 'Submitted':
            return False, f"Cannot edit complaint. Current status is '{complaint['status']}'. Editing is only allowed while 'Submitted'."
            
        valid, errors = validate_complaint(title, description, category, location, department, priority)
        if not valid:
            return False, " ".join(errors)
            
        cursor = db.cursor()
        cursor.execute(
            """UPDATE complaints 
               SET title = ?, description = ?, category = ?, location = ?, department = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
               WHERE complaint_id = ? AND user_id = ?""",
            (title.strip(), description.strip(), category.strip(), location.strip(), department.strip(), priority.strip(), complaint_id, user_id)
        )
        
        cursor.execute(
            """INSERT INTO complaint_history
               (complaint_id, changed_by_user_id, changed_by_name, old_status, new_status, remarks)
               VALUES (?, ?, ?, 'Submitted', 'Submitted', 'Complaint details updated by student')""",
            (complaint_id, user_id, user_name)
        )
        db.commit()
        return True, "Complaint updated successfully."

    @staticmethod
    def withdraw_by_student(complaint_id: str, user_id: int, user_name: str, reason: str = "", conn=None) -> Tuple[bool, str]:
        """Allow student to withdraw complaint only if still in 'Submitted' status."""
        db = conn or get_db()
        complaint = ComplaintModel.get_by_id(complaint_id, db)
        
        if not complaint:
            return False, "Complaint not found."
            
        if complaint['user_id'] != user_id:
            return False, "Unauthorized: You can only withdraw your own complaints."
            
        if complaint['status'] != 'Submitted':
            return False, f"Cannot withdraw complaint. Current status is '{complaint['status']}'. Withdrawal is only permitted while 'Submitted'."
            
        cursor = db.cursor()
        remarks = f"Complaint withdrawn by student. {reason.strip()}".strip()
        
        cursor.execute(
            """UPDATE complaints 
               SET status = 'Closed', updated_at = CURRENT_TIMESTAMP
               WHERE complaint_id = ? AND user_id = ?""",
            (complaint_id, user_id)
        )
        
        cursor.execute(
            """INSERT INTO complaint_history
               (complaint_id, changed_by_user_id, changed_by_name, old_status, new_status, remarks)
               VALUES (?, ?, ?, 'Submitted', 'Closed', ?)""",
            (complaint_id, user_id, user_name, remarks)
        )
        db.commit()
        return True, "Complaint withdrawn successfully."

    @staticmethod
    def admin_update(complaint_id: str, admin_id: int, admin_name: str,
                     new_status: Optional[str] = None, priority: Optional[str] = None,
                     assigned_to: Optional[str] = None, department: Optional[str] = None,
                     admin_remarks: Optional[str] = None, resolution_notes: Optional[str] = None,
                     conn=None) -> Tuple[bool, str]:
        """Administrator updates complaint status, assignment, remarks, or priority."""
        db = conn or get_db()
        complaint = ComplaintModel.get_by_id(complaint_id, db)
        if not complaint:
            return False, "Complaint not found."
            
        old_status = complaint['status']
        status_to_set = (new_status or old_status).strip()
        
        # Validate transition if status is changing
        if status_to_set != old_status:
            is_valid, msg = validate_status_transition(old_status, status_to_set)
            if not is_valid:
                return False, msg
                
        # Resolve timestamp logic
        resolved_at_expr = "resolved_at"
        if status_to_set == 'Resolved' and old_status != 'Resolved':
            resolved_at_expr = "CURRENT_TIMESTAMP"
        elif status_to_set == 'Reopened':
            resolved_at_expr = "NULL"
            
        priority_to_set = priority.strip() if priority else complaint['priority']
        dept_to_set = department.strip() if department else complaint['department']
        assigned_to_set = assigned_to.strip() if assigned_to is not None else complaint['assigned_to']
        remarks_to_set = admin_remarks.strip() if admin_remarks is not None else complaint['admin_remarks']
        res_notes_to_set = resolution_notes.strip() if resolution_notes is not None else complaint['resolution_notes']
        
        cursor = db.cursor()
        cursor.execute(
            f"""UPDATE complaints
                SET status = ?,
                    priority = ?,
                    department = ?,
                    assigned_to = ?,
                    admin_remarks = ?,
                    resolution_notes = ?,
                    resolved_at = {resolved_at_expr},
                    updated_at = CURRENT_TIMESTAMP
                WHERE complaint_id = ?""",
            (status_to_set, priority_to_set, dept_to_set, assigned_to_set, remarks_to_set, res_notes_to_set, complaint_id)
        )
        
        # Build history remarks
        history_remarks_parts = []
        if status_to_set != old_status:
            history_remarks_parts.append(f"Status changed from {old_status} to {status_to_set}")
        if assigned_to_set != complaint['assigned_to']:
            history_remarks_parts.append(f"Assigned to {assigned_to_set or 'Unassigned'}")
        if priority_to_set != complaint['priority']:
            history_remarks_parts.append(f"Priority set to {priority_to_set}")
        if remarks_to_set and remarks_to_set != complaint['admin_remarks']:
            history_remarks_parts.append(f"Remarks: {remarks_to_set}")
        if res_notes_to_set and res_notes_to_set != complaint['resolution_notes']:
            history_remarks_parts.append(f"Resolution Notes: {res_notes_to_set}")
            
        history_remarks = "; ".join(history_remarks_parts) if history_remarks_parts else "Complaint details reviewed"
        
        cursor.execute(
            """INSERT INTO complaint_history
               (complaint_id, changed_by_user_id, changed_by_name, old_status, new_status, remarks)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (complaint_id, admin_id, admin_name, old_status, status_to_set, history_remarks)
        )
        db.commit()
        return True, "Complaint updated successfully."

    @staticmethod
    def get_student_stats(user_id: int, conn=None) -> Dict[str, Any]:
        """Compute live complaint statistics for a specific student."""
        db = conn or get_db()
        cursor = db.cursor()
        
        cursor.execute(
            """SELECT 
                 COUNT(*) AS total,
                 SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) AS submitted,
                 SUM(CASE WHEN status IN ('Under Review', 'Assigned', 'In Progress', 'Reopened') THEN 1 ELSE 0 END) AS in_progress,
                 SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved
               FROM complaints WHERE user_id = ?""",
            (user_id,)
        )
        row = cursor.fetchone()
        
        cursor.execute(
            """SELECT * FROM complaints 
               WHERE user_id = ? 
               ORDER BY created_at DESC LIMIT 5""",
            (user_id,)
        )
        recent = [dict(r) for r in cursor.fetchall()]
        
        return {
            'total': row['total'] or 0,
            'submitted': row['submitted'] or 0,
            'in_progress': row['in_progress'] or 0,
            'resolved': row['resolved'] or 0,
            'recent': recent
        }

    @staticmethod
    def get_admin_stats(conn=None) -> Dict[str, Any]:
        """Compute real database analytics, category/status distributions, and resolution times."""
        db = conn or get_db()
        cursor = db.cursor()
        
        cursor.execute(
            """SELECT 
                 COUNT(*) AS total,
                 SUM(CASE WHEN status IN ('Submitted', 'Under Review') THEN 1 ELSE 0 END) AS pending,
                 SUM(CASE WHEN status IN ('Assigned', 'In Progress', 'Reopened') THEN 1 ELSE 0 END) AS in_progress,
                 SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
                 SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed,
                 SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) AS critical
               FROM complaints"""
        )
        main_stats = dict(cursor.fetchone())
        
        # Category breakdown
        cursor.execute(
            """SELECT category, COUNT(*) as count 
               FROM complaints 
               GROUP BY category 
               ORDER BY count DESC"""
        )
        categories = [dict(r) for r in cursor.fetchall()]
        
        # Status breakdown
        cursor.execute(
            """SELECT status, COUNT(*) as count 
               FROM complaints 
               GROUP BY status 
               ORDER BY count DESC"""
        )
        statuses = [dict(r) for r in cursor.fetchall()]
        
        # Priority breakdown
        cursor.execute(
            """SELECT priority, COUNT(*) as count 
               FROM complaints 
               GROUP BY priority 
               ORDER BY count DESC"""
        )
        priorities = [dict(r) for r in cursor.fetchall()]
        
        # Department breakdown
        cursor.execute(
            """SELECT department, COUNT(*) as count 
               FROM complaints 
               GROUP BY department 
               ORDER BY count DESC"""
        )
        departments = [dict(r) for r in cursor.fetchall()]
        
        # Average resolution time in hours for resolved complaints with resolved_at
        cursor.execute(
            """SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24.0) AS avg_hours,
                      COUNT(*) as resolved_with_time
               FROM complaints 
               WHERE resolved_at IS NOT NULL AND status IN ('Resolved', 'Closed')"""
        )
        avg_row = cursor.fetchone()
        avg_hours = round(avg_row['avg_hours'], 1) if avg_row and avg_row['avg_hours'] is not None else 0.0
        
        # Recent complaints
        cursor.execute(
            """SELECT c.*, u.name AS student_name, u.student_id AS student_reg_no
               FROM complaints c
               JOIN users u ON c.user_id = u.id
               ORDER BY c.created_at DESC LIMIT 6"""
        )
        recent = [dict(r) for r in cursor.fetchall()]
        
        return {
            'total': main_stats['total'] or 0,
            'pending': main_stats['pending'] or 0,
            'in_progress': main_stats['in_progress'] or 0,
            'resolved': main_stats['resolved'] or 0,
            'closed': main_stats['closed'] or 0,
            'critical': main_stats['critical'] or 0,
            'avg_resolution_hours': avg_hours,
            'categories': categories,
            'statuses': statuses,
            'priorities': priorities,
            'departments': departments,
            'recent': recent
        }

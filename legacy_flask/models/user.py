import sqlite3
from typing import Optional, Dict, Any
from werkzeug.security import generate_password_hash, check_password_hash
from database.connection import get_db

class UserModel:
    """Handles User data operations with secure Werkzeug password hashing."""

    @staticmethod
    def create_user(name: str, email: str, password: str, role: str,
                    department: str, student_id: Optional[str] = None, db_conn=None) -> Dict[str, Any]:
        """Create a new user with hashed password."""
        conn = db_conn or get_db()
        cursor = conn.cursor()
        
        email_clean = email.strip().lower()
        name_clean = name.strip()
        dept_clean = department.strip()
        stu_id_clean = student_id.strip() if student_id else None
        
        # Check duplicate email
        cursor.execute("SELECT id FROM users WHERE email = ?", (email_clean,))
        if cursor.fetchone():
            raise ValueError("An account with this email address already exists.")
            
        # Check duplicate student_id if applicable
        if stu_id_clean:
            cursor.execute("SELECT id FROM users WHERE student_id = ?", (stu_id_clean,))
            if cursor.fetchone():
                raise ValueError("An account with this Student ID already exists.")
                
        try:
            from flask import current_app
            if current_app and current_app.config.get('TESTING'):
                hash_method = 'pbkdf2:sha256:1000'
            else:
                hash_method = 'pbkdf2:sha256'
        except Exception:
            hash_method = 'pbkdf2:sha256'

        password_hash = generate_password_hash(password, method=hash_method)
        
        cursor.execute(
            """INSERT INTO users (name, student_id, email, password_hash, role, department)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (name_clean, stu_id_clean, email_clean, password_hash, role, dept_clean)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        return UserModel.get_by_id(user_id, conn)

    @staticmethod
    def authenticate(identifier: str, password: str, db_conn=None) -> Optional[Dict[str, Any]]:
        """Authenticate user by email or student ID and verify password."""
        conn = db_conn or get_db()
        cursor = conn.cursor()
        
        identifier_clean = identifier.strip().lower()
        cursor.execute(
            """SELECT * FROM users 
               WHERE LOWER(email) = ? OR LOWER(student_id) = ?""",
            (identifier_clean, identifier_clean)
        )
        row = cursor.fetchone()
        if not row:
            return None
            
        if isinstance(row, sqlite3.Row):
            user = dict(row)
        else:
            cols = [col[0] for col in cursor.description]
            user = dict(zip(cols, row))

        if check_password_hash(user['password_hash'], password):
            return user
        return None

    @staticmethod
    def get_by_id(user_id: int, db_conn=None) -> Optional[Dict[str, Any]]:
        """Retrieve user by ID."""
        conn = db_conn or get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, student_id, email, role, department, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        if isinstance(row, sqlite3.Row):
            return dict(row)
        cols = [col[0] for col in cursor.description]
        return dict(zip(cols, row))

    @staticmethod
    def get_by_email(email: str, db_conn=None) -> Optional[Dict[str, Any]]:
        """Retrieve user by email."""
        conn = db_conn or get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, student_id, email, role, department, created_at FROM users WHERE LOWER(email) = ?", (email.strip().lower(),))
        row = cursor.fetchone()
        if not row:
            return None
        if isinstance(row, sqlite3.Row):
            return dict(row)
        cols = [col[0] for col in cursor.description]
        return dict(zip(cols, row))

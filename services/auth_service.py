from functools import wraps
from flask import session, redirect, url_for, flash, abort, g, request
from database.connection import get_db

def get_current_user():
    """Retrieve full user dictionary from database based on session."""
    user_id = session.get('user_id')
    if not user_id:
        return None
    
    if hasattr(g, 'current_user') and g.current_user and g.current_user['id'] == user_id:
        return g.current_user
        
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, student_id, email, role, department, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if row:
        g.current_user = dict(row)
        return g.current_user
    return None

def login_required(f):
    """Ensure user is logged in."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Ensure current user has the administrator role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in with administrator credentials.", "warning")
            return redirect(url_for('auth.login', next=request.url))
        if session.get('role') != 'admin':
            abort(403, description="Access denied. Administrator privileges required.")
        return f(*args, **kwargs)
    return decorated_function

def student_required(f):
    """Ensure current user has the student role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in as a student to access this page.", "warning")
            return redirect(url_for('auth.login', next=request.url))
        if session.get('role') != 'student':
            abort(403, description="Access restricted to student accounts.")
        return f(*args, **kwargs)
    return decorated_function

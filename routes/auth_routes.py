from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models.user import UserModel
from services.validation import validate_registration
from services.csrf import csrf_protect

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
@csrf_protect
def register():
    """Register a new student account."""
    if request.method == 'GET' and 'user_id' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('student.dashboard'))
        
    if request.method == 'POST':
        name = request.form.get('name', '')
        student_id = request.form.get('student_id', '')
        email = request.form.get('email', '')
        department = request.form.get('department', '')
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        is_valid, errors = validate_registration(
            name=name,
            email=email,
            password=password,
            confirm_password=confirm_password,
            department=department,
            student_id=student_id,
            role='student'
        )
        
        if not is_valid:
            for err in errors:
                flash(err, 'danger')
            return render_template('auth/register.html',
                                   form_data={'name': name, 'student_id': student_id,
                                              'email': email, 'department': department})
                                              
        try:
            UserModel.create_user(
                name=name,
                email=email,
                password=password,
                role='student',
                department=department,
                student_id=student_id
            )
            flash("Registration successful! You may now log in with your credentials.", "success")
            return redirect(url_for('auth.login'))
        except ValueError as e:
            flash(str(e), "danger")
            return render_template('auth/register.html',
                                   form_data={'name': name, 'student_id': student_id,
                                              'email': email, 'department': department})
        except Exception:
            flash("An unexpected error occurred during registration. Please try again.", "danger")
            return render_template('auth/register.html',
                                   form_data={'name': name, 'student_id': student_id,
                                              'email': email, 'department': department})
            
    return render_template('auth/register.html', form_data={})

@auth_bp.route('/login', methods=['GET', 'POST'])
@csrf_protect
def login():
    """Authenticate student or administrator."""
    if request.method == 'GET' and 'user_id' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('student.dashboard'))
        
    if request.method == 'POST':
        identifier = request.form.get('identifier', '').strip()
        password = request.form.get('password', '')
        
        if not identifier or not password:
            flash("Please enter both email / student ID and password.", "warning")
            return render_template('auth/login.html', identifier=identifier)
            
        user = UserModel.authenticate(identifier, password)
        if not user:
            flash("Invalid credentials. Please verify your details and try again.", "danger")
            return render_template('auth/login.html', identifier=identifier)
            
        # Clear existing session and set user details
        session.clear()
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['email'] = user['email']
        session['role'] = user['role']
        session['department'] = user['department']
        session['student_id'] = user.get('student_id')
        
        flash(f"Welcome back, {user['name']}!", "success")
        
        # Safe redirection
        next_page = request.args.get('next')
        if next_page and next_page.startswith('/'):
            return redirect(next_page)
            
        if user['role'] == 'admin':
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('student.dashboard'))
        
    return render_template('auth/login.html', identifier='')

@auth_bp.route('/logout', methods=['GET', 'POST'])
def logout():
    """Log out current user and clear session."""
    session.clear()
    flash("You have been logged out securely.", "info")
    return redirect(url_for('auth.login'))

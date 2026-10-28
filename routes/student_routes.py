from flask import Blueprint, render_template, request, redirect, url_for, flash, session, abort
from models.complaint import ComplaintModel
from services.auth_service import login_required, student_required
from services.validation import validate_complaint
from services.csrf import csrf_protect
from config import Config

student_bp = Blueprint('student', __name__, url_prefix='/student')

@student_bp.route('/dashboard')
@login_required
@student_required
def dashboard():
    """Render student dashboard with actual live metrics and recent submissions."""
    user_id = session['user_id']
    stats = ComplaintModel.get_student_stats(user_id)
    return render_template('student/dashboard.html', stats=stats)

@student_bp.route('/complaints')
@login_required
@student_required
def complaints_list():
    """Display student's complaints with real-time filters and search."""
    user_id = session['user_id']
    status = request.args.get('status', '').strip() or None
    category = request.args.get('category', '').strip() or None
    priority = request.args.get('priority', '').strip() or None
    search = request.args.get('search', '').strip() or None
    
    complaints = ComplaintModel.get_student_complaints(
        user_id=user_id,
        status=status,
        category=category,
        priority=priority,
        search=search
    )
    
    return render_template(
        'student/complaints_list.html',
        complaints=complaints,
        selected_status=status,
        selected_category=category,
        selected_priority=priority,
        search_query=search or '',
        categories=Config.COMPLAINT_CATEGORIES,
        priorities=Config.COMPLAINT_PRIORITIES,
        statuses=Config.COMPLAINT_STATUSES
    )

@student_bp.route('/complaints/new', methods=['GET', 'POST'])
@login_required
@student_required
@csrf_protect
def submit_complaint():
    """Submit a new campus complaint."""
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', '').strip()
        location = request.form.get('location', '').strip()
        department = request.form.get('department', '').strip()
        priority = request.form.get('priority', 'Medium').strip()
        
        is_valid, errors = validate_complaint(
            title=title,
            description=description,
            category=category,
            location=location,
            department=department,
            priority=priority
        )
        
        if not is_valid:
            for err in errors:
                flash(err, 'danger')
            return render_template(
                'student/submit_complaint.html',
                form_data=request.form,
                categories=Config.COMPLAINT_CATEGORIES,
                departments=Config.CAMPUS_DEPARTMENTS,
                priorities=Config.COMPLAINT_PRIORITIES
            )
            
        try:
            complaint = ComplaintModel.create_complaint(
                user_id=session['user_id'],
                user_name=session['user_name'],
                title=title,
                description=description,
                category=category,
                location=location,
                department=department,
                priority=priority
            )
            flash(f"Complaint {complaint['complaint_id']} submitted successfully!", "success")
            return redirect(url_for('student.complaint_detail', complaint_id=complaint['complaint_id']))
        except Exception as e:
            flash(f"Failed to submit complaint: {str(e)}", "danger")
            return render_template(
                'student/submit_complaint.html',
                form_data=request.form,
                categories=Config.COMPLAINT_CATEGORIES,
                departments=Config.CAMPUS_DEPARTMENTS,
                priorities=Config.COMPLAINT_PRIORITIES
            )
            
    return render_template(
        'student/submit_complaint.html',
        form_data={},
        categories=Config.COMPLAINT_CATEGORIES,
        departments=Config.CAMPUS_DEPARTMENTS,
        priorities=Config.COMPLAINT_PRIORITIES
    )

@student_bp.route('/complaints/<complaint_id>')
@login_required
@student_required
def complaint_detail(complaint_id):
    """View complaint details and status history timeline (restricted to owner)."""
    complaint = ComplaintModel.get_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
        
    # Prevent student from accessing another student's complaint
    if complaint['user_id'] != session['user_id']:
        abort(403, description="Access denied. You can only view complaints submitted by your account.")
        
    history = ComplaintModel.get_history(complaint_id)
    return render_template('student/complaint_detail.html', complaint=complaint, history=history)

@student_bp.route('/complaints/<complaint_id>/edit', methods=['GET', 'POST'])
@login_required
@student_required
@csrf_protect
def edit_complaint(complaint_id):
    """Allow editing complaint details only while in initial 'Submitted' state."""
    complaint = ComplaintModel.get_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
        
    if complaint['user_id'] != session['user_id']:
        abort(403, description="Access denied. You can only edit your own complaints.")
        
    if complaint['status'] != 'Submitted':
        flash(f"Cannot edit complaint. Its status is '{complaint['status']}'. Complaints can only be modified while 'Submitted'.", "warning")
        return redirect(url_for('student.complaint_detail', complaint_id=complaint_id))
        
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', '').strip()
        location = request.form.get('location', '').strip()
        department = request.form.get('department', '').strip()
        priority = request.form.get('priority', 'Medium').strip()
        
        success, msg = ComplaintModel.update_by_student(
            complaint_id=complaint_id,
            user_id=session['user_id'],
            user_name=session['user_name'],
            title=title,
            description=description,
            category=category,
            location=location,
            department=department,
            priority=priority
        )
        
        if success:
            flash(msg, "success")
            return redirect(url_for('student.complaint_detail', complaint_id=complaint_id))
        else:
            flash(msg, "danger")
            
    return render_template(
        'student/edit_complaint.html',
        complaint=complaint,
        categories=Config.COMPLAINT_CATEGORIES,
        departments=Config.CAMPUS_DEPARTMENTS,
        priorities=Config.COMPLAINT_PRIORITIES
    )

@student_bp.route('/complaints/<complaint_id>/withdraw', methods=['POST'])
@login_required
@student_required
@csrf_protect
def withdraw_complaint(complaint_id):
    """Allow withdrawing complaint only while in initial 'Submitted' state."""
    complaint = ComplaintModel.get_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
        
    if complaint['user_id'] != session['user_id']:
        abort(403, description="Access denied. You can only withdraw your own complaints.")
        
    reason = request.form.get('reason', '').strip()
    success, msg = ComplaintModel.withdraw_by_student(
        complaint_id=complaint_id,
        user_id=session['user_id'],
        user_name=session['user_name'],
        reason=reason
    )
    
    if success:
        flash(msg, "info")
    else:
        flash(msg, "danger")
        
    return redirect(url_for('student.complaint_detail', complaint_id=complaint_id))

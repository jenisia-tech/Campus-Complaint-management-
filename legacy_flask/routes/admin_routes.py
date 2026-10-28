from flask import Blueprint, render_template, request, redirect, url_for, flash, session, abort
from models.complaint import ComplaintModel
from services.auth_service import login_required, admin_required
from services.csrf import csrf_protect
from config import Config

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """Administrator dashboard with calculated statistics, live charts, and recent complaints."""
    stats = ComplaintModel.get_admin_stats()
    return render_template(
        'admin/dashboard.html',
        stats=stats,
        categories=Config.COMPLAINT_CATEGORIES,
        statuses=Config.COMPLAINT_STATUSES
    )

@admin_bp.route('/complaints')
@login_required
@admin_required
def complaints_list():
    """View and filter all campus complaints with multi-parameter search."""
    status = request.args.get('status', '').strip() or None
    category = request.args.get('category', '').strip() or None
    priority = request.args.get('priority', '').strip() or None
    department = request.args.get('department', '').strip() or None
    search = request.args.get('search', '').strip() or None
    
    complaints = ComplaintModel.get_all_complaints(
        status=status,
        category=category,
        priority=priority,
        department=department,
        search=search
    )
    
    return render_template(
        'admin/complaints_list.html',
        complaints=complaints,
        selected_status=status,
        selected_category=category,
        selected_priority=priority,
        selected_dept=department,
        search_query=search or '',
        categories=Config.COMPLAINT_CATEGORIES,
        departments=Config.CAMPUS_DEPARTMENTS,
        priorities=Config.COMPLAINT_PRIORITIES,
        statuses=Config.COMPLAINT_STATUSES
    )

@admin_bp.route('/complaints/<complaint_id>')
@login_required
@admin_required
def complaint_detail(complaint_id):
    """View full complaint details, student information, and action form for administrator."""
    complaint = ComplaintModel.get_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
        
    history = ComplaintModel.get_history(complaint_id)
    return render_template(
        'admin/complaint_detail.html',
        complaint=complaint,
        history=history,
        categories=Config.COMPLAINT_CATEGORIES,
        departments=Config.CAMPUS_DEPARTMENTS,
        priorities=Config.COMPLAINT_PRIORITIES,
        statuses=Config.COMPLAINT_STATUSES
    )

@admin_bp.route('/complaints/<complaint_id>/update', methods=['POST'])
@login_required
@admin_required
@csrf_protect
def update_complaint(complaint_id):
    """Process administrator updates to complaint status, assignment, remarks, and resolution."""
    complaint = ComplaintModel.get_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
        
    new_status = request.form.get('status', '').strip() or None
    priority = request.form.get('priority', '').strip() or None
    department = request.form.get('department', '').strip() or None
    assigned_to = request.form.get('assigned_to', '').strip()
    admin_remarks = request.form.get('admin_remarks', '').strip()
    resolution_notes = request.form.get('resolution_notes', '').strip()
    
    success, msg = ComplaintModel.admin_update(
        complaint_id=complaint_id,
        admin_id=session['user_id'],
        admin_name=session['user_name'],
        new_status=new_status,
        priority=priority,
        assigned_to=assigned_to,
        department=department,
        admin_remarks=admin_remarks,
        resolution_notes=resolution_notes
    )
    
    if success:
        flash(f"Complaint {complaint_id} updated successfully: {msg}", "success")
    else:
        flash(f"Failed to update complaint: {msg}", "danger")
        
    return redirect(url_for('admin.complaint_detail', complaint_id=complaint_id))

@admin_bp.route('/reports')
@login_required
@admin_required
def reports():
    """Campus complaint resolution metrics and analytical reports."""
    stats = ComplaintModel.get_admin_stats()
    return render_template('admin/reports.html', stats=stats)


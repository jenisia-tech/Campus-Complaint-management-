import pytest
from models.user import UserModel
from models.complaint import ComplaintModel

def test_admin_dashboard_and_reports(admin_client):
    res_dash = admin_client.get('/admin/dashboard')
    assert res_dash.status_code == 200
    assert b"Campus Administration Dashboard" in res_dash.data
    assert b"Total Complaints" in res_dash.data

    res_reports = admin_client.get('/admin/reports')
    assert res_reports.status_code == 200
    assert b"Campus Complaint Resolution Reports" in res_reports.data

def test_student_blocked_from_admin_pages(student_client):
    """Students attempting to access admin endpoints must be rejected with 403."""
    res_dash = student_client.get('/admin/dashboard')
    assert res_dash.status_code == 403

    res_list = student_client.get('/admin/complaints')
    assert res_list.status_code == 403

    res_reports = student_client.get('/admin/reports')
    assert res_reports.status_code == 403

def test_admin_complaint_management_workflow(admin_client, app_instance):
    with app_instance.app_context():
        alice = UserModel.get_by_email("alice@student.campus.edu")
        c = ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Broken window latch in room 204",
            description="Window latch is bent and allows rain to enter room.",
            category="Classroom and infrastructure",
            location="Room 204",
            department="Estate & Maintenance",
            priority="Medium"
        )
        cid = c['complaint_id']

    # Admin opens detail view
    res_detail = admin_client.get(f'/admin/complaints/{cid}')
    assert res_detail.status_code == 200
    assert b"Broken window latch in room 204" in res_detail.data
    assert b"Administrative Actions & Resolution Controls" in res_detail.data

    # Admin assigns to staff and updates to In Progress
    res_update = admin_client.post(f'/admin/complaints/{cid}/update', data={
        'status': 'In Progress',
        'priority': 'High',
        'department': 'Estate & Maintenance',
        'assigned_to': 'Carpenter Bob',
        'admin_remarks': 'Assigned to carpentry workshop for repair.',
        'resolution_notes': ''
    }, follow_redirects=True)

    assert res_update.status_code == 200
    assert b"updated successfully" in res_update.data
    assert b"In Progress" in res_update.data
    assert b"Carpenter Bob" in res_update.data

    # Admin marks as Resolved
    res_resolve = admin_client.post(f'/admin/complaints/{cid}/update', data={
        'status': 'Resolved',
        'priority': 'High',
        'department': 'Estate & Maintenance',
        'assigned_to': 'Carpenter Bob',
        'admin_remarks': 'Fixed on site.',
        'resolution_notes': 'New brass latch mechanism installed and lubricated.'
    }, follow_redirects=True)

    assert res_resolve.status_code == 200
    assert b"Resolved" in res_resolve.data
    assert b"New brass latch mechanism installed" in res_resolve.data

    # Admin reopens resolved complaint
    res_reopen = admin_client.post(f'/admin/complaints/{cid}/update', data={
        'status': 'Reopened',
        'priority': 'High',
        'department': 'Estate & Maintenance',
        'assigned_to': 'Carpenter Bob',
        'admin_remarks': 'Student reported latch is sticking again.',
        'resolution_notes': ''
    }, follow_redirects=True)

    assert res_reopen.status_code == 200
    assert b"Reopened" in res_reopen.data


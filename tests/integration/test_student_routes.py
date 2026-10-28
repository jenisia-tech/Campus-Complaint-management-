import pytest
from models.user import UserModel
from models.complaint import ComplaintModel

def test_student_complaint_submission_and_lifecycle(student_client, app_instance):
    # View submission form
    res_form = student_client.get('/student/complaints/new')
    assert res_form.status_code == 200
    assert b"Submit Campus Complaint" in res_form.data

    # Submit new complaint
    res_submit = student_client.post('/student/complaints/new', data={
        'title': 'Defective keyboard in Programming Lab 2',
        'description': 'Keycaps for Enter and Spacebar are missing on workstation 14.',
        'category': 'Laboratory equipment',
        'location': 'Lab 2 Workstation 14',
        'department': 'Computer Science',
        'priority': 'Medium'
    }, follow_redirects=True)

    assert res_submit.status_code == 200
    assert b"submitted successfully" in res_submit.data
    assert b"CMP-" in res_submit.data
    assert b"Defective keyboard in Programming Lab 2" in res_submit.data

def test_student_ownership_and_access_control(student_client, student_bob_client, app_instance):
    with app_instance.app_context():
        bob = UserModel.get_by_email("bob@student.campus.edu")
        # Bob submits a complaint
        bobs_complaint = ComplaintModel.create_complaint(
            user_id=bob['id'],
            user_name=bob['name'],
            title="Bob's Private Hostel Grievance",
            description="Room lock is jammed and difficult to turn from outside.",
            category="Hostel facilities",
            location="Hostel Block A Room 102",
            department="Hostel & Welfare",
            priority="High"
        )
        bob_cid = bobs_complaint['complaint_id']

    # Alice attempts to view Bob's complaint by ID -> Must be 403 Forbidden
    res_view = student_client.get(f'/student/complaints/{bob_cid}')
    assert res_view.status_code == 403
    assert b"Access Denied" in res_view.data

    # Alice attempts to edit Bob's complaint -> Must be 403 Forbidden
    res_edit = student_client.get(f'/student/complaints/{bob_cid}/edit')
    assert res_edit.status_code == 403

    # Alice attempts to withdraw Bob's complaint -> Must be 403 Forbidden
    res_withdraw = student_client.post(f'/student/complaints/{bob_cid}/withdraw')
    assert res_withdraw.status_code == 403

def test_student_search_and_filters(student_client, app_instance):
    with app_instance.app_context():
        alice = UserModel.get_by_email("alice@student.campus.edu")
        ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Wi-Fi Router Reset Required",
            description="Wi-Fi connection drop in central library study hall.",
            category="Wi-Fi and internet",
            location="Central Library",
            department="IT & Network Services",
            priority="High"
        )

    # Search with keyword
    res_search = student_client.get('/student/complaints?search=Router')
    assert res_search.status_code == 200
    assert b"Wi-Fi Router Reset Required" in res_search.data

    # Filter with non-matching status
    res_filter = student_client.get('/student/complaints?status=Resolved')
    assert res_filter.status_code == 200
    assert b"No complaints found" in res_filter.data

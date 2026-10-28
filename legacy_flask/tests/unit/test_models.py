import pytest
from datetime import datetime
from werkzeug.security import check_password_hash
from models.user import UserModel
from models.complaint import ComplaintModel
from database.connection import get_db

def test_user_creation_and_password_hashing(app_instance):
    with app_instance.app_context():
        user = UserModel.create_user(
            name="Daniel White",
            email="daniel@student.campus.edu",
            password="SecurePass987!",
            role="student",
            department="Civil Engineering",
            student_id="STU-2026-888"
        )
        assert user['id'] is not None
        assert user['email'] == "daniel@student.campus.edu"
        
        # Verify password hash
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user['id'],))
        stored_hash = cursor.fetchone()['password_hash']
        assert stored_hash != "SecurePass987!"
        assert check_password_hash(stored_hash, "SecurePass987!") is True

def test_user_duplicate_constraints(app_instance):
    with app_instance.app_context():
        with pytest.raises(ValueError, match="email address already exists"):
            UserModel.create_user(
                name="Duplicate User",
                email="alice@student.campus.edu",  # already in fixture
                password="AnotherPassword123",
                role="student",
                department="Computer Science",
                student_id="STU-UNIQUE-001"
            )

        with pytest.raises(ValueError, match="Student ID already exists"):
            UserModel.create_user(
                name="Duplicate ID",
                email="unique_email@campus.edu",
                password="AnotherPassword123",
                role="student",
                department="Computer Science",
                student_id="STU-TEST-001"  # already in fixture
            )

def test_user_authentication(app_instance):
    with app_instance.app_context():
        # Authenticate by email
        user1 = UserModel.authenticate("alice@student.campus.edu", "AlicePassword123")
        assert user1 is not None
        assert user1['name'] == "Student Alice"

        # Authenticate by student ID
        user2 = UserModel.authenticate("STU-TEST-001", "AlicePassword123")
        assert user2 is not None
        assert user2['id'] == user1['id']

        # Invalid password
        assert UserModel.authenticate("alice@student.campus.edu", "WrongPassword") is None

        # Non-existent user
        assert UserModel.authenticate("nobody@campus.edu", "Password") is None

def test_complaint_id_generation(app_instance):
    with app_instance.app_context():
        year = datetime.now().year
        cid1 = ComplaintModel.generate_complaint_id()
        assert cid1 == f"CMP-{year}-0001"

def test_complaint_creation_and_transaction(app_instance):
    with app_instance.app_context():
        alice = UserModel.get_by_email("alice@student.campus.edu")
        complaint = ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Broken chair in Seminar Hall",
            description="The wooden armrest of chair row 3 seat 4 is broken.",
            category="Classroom and infrastructure",
            location="Main Seminar Hall",
            department="Estate & Maintenance",
            priority="Low"
        )
        assert complaint['complaint_id'].startswith("CMP-")
        assert complaint['status'] == "Submitted"
        assert complaint['student_name'] == "Student Alice"

        # Check that history was committed atomically
        history = ComplaintModel.get_history(complaint['complaint_id'])
        assert len(history) == 1
        assert history[0]['new_status'] == "Submitted"
        assert history[0]['changed_by_name'] == "Student Alice"

def test_student_edit_and_withdraw_restrictions(app_instance):
    with app_instance.app_context():
        alice = UserModel.get_by_email("alice@student.campus.edu")
        bob = UserModel.get_by_email("bob@student.campus.edu")
        admin = UserModel.get_by_email("testadmin@campus.edu")

        c = ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Water dispenser leaking",
            description="Continuous drip from the cold tap.",
            category="Water and sanitation",
            location="Floor 2",
            department="Estate & Maintenance"
        )

        # Bob cannot edit Alice's complaint
        success, msg = ComplaintModel.update_by_student(
            c['complaint_id'], bob['id'], bob['name'],
            "Hacked title", "New description long enough",
            "Water and sanitation", "Floor 2", "Estate & Maintenance", "Low"
        )
        assert success is False
        assert "Unauthorized" in msg

        # Alice CAN edit while Submitted
        success, msg = ComplaintModel.update_by_student(
            c['complaint_id'], alice['id'], alice['name'],
            "Updated Title Long Enough", "Updated description long enough to pass validation.",
            "Water and sanitation", "Floor 2 Room 204", "Estate & Maintenance", "Medium"
        )
        assert success is True

        # Admin advances status to In Progress
        ComplaintModel.admin_update(
            c['complaint_id'], admin['id'], admin['name'],
            new_status="In Progress"
        )

        # Alice can NO LONGER edit or withdraw
        success_edit, msg_edit = ComplaintModel.update_by_student(
            c['complaint_id'], alice['id'], alice['name'],
            "Another update title", "Another valid long enough description here.",
            "Water and sanitation", "Floor 2", "Estate & Maintenance", "Low"
        )
        assert success_edit is False
        assert "only allowed while 'Submitted'" in msg_edit

        success_withdraw, msg_withdraw = ComplaintModel.withdraw_by_student(
            c['complaint_id'], alice['id'], alice['name']
        )
        assert success_withdraw is False
        assert "only permitted while 'Submitted'" in msg_withdraw


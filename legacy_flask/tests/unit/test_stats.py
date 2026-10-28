import pytest
from datetime import datetime, timedelta
from models.user import UserModel
from models.complaint import ComplaintModel
from database.connection import get_db

def test_student_and_admin_statistics_calculation(app_instance):
    with app_instance.app_context():
        alice = UserModel.get_by_email("alice@student.campus.edu")
        admin = UserModel.get_by_email("testadmin@campus.edu")

        # Initial student stats: all 0
        s_stats = ComplaintModel.get_student_stats(alice['id'])
        assert s_stats['total'] == 0
        assert s_stats['submitted'] == 0

        # Submit 1 complaint
        c1 = ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Complaint One for Stats",
            description="Detailed description for stats testing complaint one.",
            category="Wi-Fi and internet",
            location="Library 1st Floor",
            department="IT & Network Services",
            priority="Critical"
        )

        s_stats = ComplaintModel.get_student_stats(alice['id'])
        assert s_stats['total'] == 1
        assert s_stats['submitted'] == 1

        # Submit 2nd complaint
        c2 = ComplaintModel.create_complaint(
            user_id=alice['id'],
            user_name=alice['name'],
            title="Complaint Two for Stats",
            description="Detailed description for stats testing complaint two.",
            category="Electricity and lighting",
            location="Physics Lab",
            department="Estate & Maintenance",
            priority="Medium"
        )

        # Advance c2 to In Progress
        ComplaintModel.admin_update(
            c2['complaint_id'], admin['id'], admin['name'],
            new_status="In Progress"
        )

        s_stats = ComplaintModel.get_student_stats(alice['id'])
        assert s_stats['total'] == 2
        assert s_stats['submitted'] == 1
        assert s_stats['in_progress'] == 1
        assert s_stats['resolved'] == 0

        # Resolve c2
        ComplaintModel.admin_update(
            c2['complaint_id'], admin['id'], admin['name'],
            new_status="Resolved",
            resolution_notes="Bulb replaced."
        )

        # Set resolved_at to 3 hours after creation for realistic test
        db = get_db()
        now = datetime.now()
        created_str = (now - timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
        resolved_str = now.strftime('%Y-%m-%d %H:%M:%S')
        db.execute(
            "UPDATE complaints SET created_at = ?, resolved_at = ? WHERE complaint_id = ?",
            (created_str, resolved_str, c2['complaint_id'])
        )
        db.commit()

        # Admin stats
        a_stats = ComplaintModel.get_admin_stats()
        assert a_stats['total'] == 2
        assert a_stats['pending'] == 1      # c1 is Submitted
        assert a_stats['resolved'] == 1     # c2 is Resolved
        assert a_stats['critical'] == 1     # c1 is Critical
        assert a_stats['avg_resolution_hours'] > 2.0  # Approx 3 hours


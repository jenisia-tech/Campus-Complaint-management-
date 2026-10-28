import os
import sys
import argparse
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from database.db_init import init_db
from models.user import UserModel
from models.complaint import ComplaintModel
from database.connection import get_db

DEMO_USERS = [
    {
        "name": "Campus Administrator",
        "email": "admin@campus.edu",
        "password": "Admin@123",
        "role": "admin",
        "department": "Administration",
        "student_id": None
    },
    {
        "name": "John Doe",
        "email": "john.doe@student.campus.edu",
        "password": "Student@123",
        "role": "student",
        "department": "Computer Science",
        "student_id": "STU-2026-001"
    },
    {
        "name": "Sarah Smith",
        "email": "sarah.smith@student.campus.edu",
        "password": "Student@123",
        "role": "student",
        "department": "Electrical Engineering",
        "student_id": "STU-2026-002"
    }
]

def seed_database(db_path: str = None, force_reset: bool = False):
    """Populate database with demonstration accounts and complaints."""
    if db_path is None:
        db_path = str(BASE_DIR / 'campus_complaints.db')
        
    db_file = Path(db_path)
    if force_reset and db_file.exists():
        backup_file = db_file.with_name(f"{db_file.stem}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db")
        print(f"[*] Backing up existing database to: {backup_file}")
        try:
            db_file.rename(backup_file)
        except Exception:
            # If in-use, remove file directly
            if db_file.exists():
                os.remove(db_file)
        print("[*] Database reset. Initializing clean tables...")
        
    # Ensure tables exist
    init_db(db_path)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Seed Users (Idempotent)
    created_users = {}
    print("\n--- Seeding User Accounts ---")
    for u in DEMO_USERS:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (u['email'].lower(),))
        existing = cursor.fetchone()
        if existing:
            created_users[u['email']] = dict(existing)
            print(f"  [Exists] {u['role'].capitalize()}: {u['name']} ({u['email']})")
        else:
            user = UserModel.create_user(
                name=u['name'],
                email=u['email'],
                password=u['password'],
                role=u['role'],
                department=u['department'],
                student_id=u['student_id'],
                db_conn=conn
            )
            created_users[u['email']] = user
            print(f"  [Created] {u['role'].capitalize()}: {u['name']} ({u['email']}) [Password: {u['password']}]")

    # 2. Check if complaints are already populated
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM complaints")
    existing_count = cursor.fetchone()[0]
    
    if existing_count >= 6:
        print(f"\n[!] Database already contains {existing_count} complaints. Skipping complaint seeding to avoid duplicates.")
        conn.close()
        return

    print("\n--- Seeding Demonstration Complaints ---")
    admin_user = created_users['admin@campus.edu']
    student1 = created_users['john.doe@student.campus.edu']
    student2 = created_users['sarah.smith@student.campus.edu']

    now = datetime.now()

    # Complaint 1: Classroom and infrastructure (Under Review)
    c1 = ComplaintModel.create_complaint(
        user_id=student1['id'],
        user_name=student1['name'],
        title="Ceiling projector not displaying HDMI input in Room 302",
        description="The ceiling-mounted projector in Room 302 shows 'No Signal' when connected through the wall HDMI port. Several faculty members could not present slides today.",
        category="Classroom and infrastructure",
        location="Academic Block A, 3rd Floor, Room 302",
        department="Computer Science",
        priority="High",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c1['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="Under Review",
        admin_remarks="Forwarded to AV maintenance team for cable and socket testing.",
        conn=conn
    )
    print(f"  [Created] {c1['complaint_id']}: Projector Issue (Under Review)")

    # Complaint 2: Wi-Fi and internet (In Progress)
    c2 = ComplaintModel.create_complaint(
        user_id=student1['id'],
        user_name=student1['name'],
        title="Wi-Fi coverage drops frequently in Computer Lab 3",
        description="Students attempting lab practical evaluations lose internet connection every 10-15 minutes. Signal strength drops to 1 bar near the western lab desks.",
        category="Wi-Fi and internet",
        location="Computing Centre, 2nd Floor, Lab 3",
        department="IT & Network Services",
        priority="Medium",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c2['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="In Progress",
        assigned_to="K. Sharma (Network Admin)",
        admin_remarks="Network team checking Cisco AP-04 PoE connection and firmware.",
        conn=conn
    )
    print(f"  [Created] {c2['complaint_id']}: Wi-Fi Drop (In Progress)")

    # Complaint 3: Water and sanitation (Critical / Assigned)
    c3 = ComplaintModel.create_complaint(
        user_id=student1['id'],
        user_name=student1['name'],
        title="Severe water pipe leakage in Hostel Block B washroom",
        description="Overhead pipe burst on 2nd floor east wing washroom causing continuous floor flooding. Slipping hazard for residents.",
        category="Water and sanitation",
        location="Hostel Block B, 2nd Floor East Washroom",
        department="Estate & Maintenance",
        priority="Critical",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c3['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="Assigned",
        priority="Critical",
        assigned_to="Estate Plumbing Unit B",
        admin_remarks="Urgent plumbing ticket dispatched. Main water valve shut off temporarily.",
        conn=conn
    )
    print(f"  [Created] {c3['complaint_id']}: Hostel Water Leakage (Critical / Assigned)")

    # Complaint 4: Electricity and lighting (Resolved)
    c4 = ComplaintModel.create_complaint(
        user_id=student2['id'],
        user_name=student2['name'],
        title="Flickering corridor tube lights outside Physics Lab",
        description="Two fluorescent tube lights in the corridor between Physics Lab and Seminar Hall are constantly buzzing and flickering.",
        category="Electricity and lighting",
        location="Science Block, Ground Floor Corridor",
        department="Estate & Maintenance",
        priority="Medium",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c4['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="In Progress",
        assigned_to="Campus Electrician Unit",
        admin_remarks="Maintenance crew scheduled for light replacement.",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c4['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="Resolved",
        resolution_notes="Replaced defective electronic ballasts and installed two new energy-efficient 20W LED fixtures. Illumination restored.",
        conn=conn
    )
    # Adjust timestamps to simulate realistic resolution turnaround (4 hours)
    c4_created = (now - timedelta(hours=6)).strftime('%Y-%m-%d %H:%M:%S')
    c4_resolved = (now - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')
    conn.execute(
        "UPDATE complaints SET created_at = ?, resolved_at = ? WHERE complaint_id = ?",
        (c4_created, c4_resolved, c4['complaint_id'])
    )
    conn.commit()
    print(f"  [Created] {c4['complaint_id']}: Corridor Lighting (Resolved)")

    # Complaint 5: Laboratory equipment (Closed)
    c5 = ComplaintModel.create_complaint(
        user_id=student2['id'],
        user_name=student2['name'],
        title="Digital Storage Oscilloscope channel 2 faulty in VLSI Lab",
        description="Workstation #5 DSO has a loose BNC input connector on Channel 2, resulting in distorted waveform readings during lab experiments.",
        category="Laboratory equipment",
        location="Electrical Sciences Block, VLSI Lab Workstation 5",
        department="Electrical Engineering",
        priority="High",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c5['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="Resolved",
        assigned_to="Lab Superintendent",
        resolution_notes="Replaced damaged BNC terminal with OEM component and re-calibrated oscilloscope with standard 1kHz square wave.",
        conn=conn
    )
    ComplaintModel.admin_update(
        complaint_id=c5['complaint_id'],
        admin_id=admin_user['id'],
        admin_name=admin_user['name'],
        new_status="Closed",
        admin_remarks="Student confirmed oscilloscope is functioning properly in practical sessions.",
        conn=conn
    )
    c5_created = (now - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
    c5_resolved = (now - timedelta(days=1, hours=18)).strftime('%Y-%m-%d %H:%M:%S')
    conn.execute(
        "UPDATE complaints SET created_at = ?, resolved_at = ? WHERE complaint_id = ?",
        (c5_created, c5_resolved, c5['complaint_id'])
    )
    conn.commit()
    print(f"  [Created] {c5['complaint_id']}: VLSI Lab DSO (Closed)")

    # Complaint 6: Water and sanitation (Submitted / New)
    c6 = ComplaintModel.create_complaint(
        user_id=student2['id'],
        user_name=student2['name'],
        title="Drinking water cooler dispensing warm water near Library entrance",
        description="The commercial RO water cooler located next to the Central Library entrance is not cooling. Tank compressor appears non-functional.",
        category="Water and sanitation",
        location="Central Library, Ground Floor Foyer",
        department="Estate & Maintenance",
        priority="High",
        conn=conn
    )
    print(f"  [Created] {c6['complaint_id']}: Water Cooler Compressor (Submitted)")

    conn.close()
    print("\n[+] Demonstration seed process completed successfully.")
    print("=" * 60)
    print("DEMO CREDENTIALS SUMMARY:")
    print("  Administrator: admin@campus.edu               | Password: Admin@123")
    print("  Student 1:     john.doe@student.campus.edu    | Password: Student@123")
    print("  Student 2:     sarah.smith@student.campus.edu | Password: Student@123")
    print("=" * 60)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Seed demonstration data for Campus Complaint Management System")
    parser.add_argument('--reset', action='store_true', help="Safely reset database with backup before seeding")
    parser.add_argument('--force-reset', action='store_true', help="Force reset database without interactive prompt")
    parser.add_argument('--db-path', type=str, default=None, help="Custom database file path")
    args = parser.parse_args()

    should_reset = False
    if args.force_reset:
        should_reset = True
    elif args.reset:
        confirm = input("Are you sure you want to backup and reinitialize the demo database? [y/N]: ").strip().lower()
        if confirm == 'y':
            should_reset = True
        else:
            print("Reset cancelled.")
            sys.exit(0)

    seed_database(db_path=args.db_path, force_reset=should_reset)


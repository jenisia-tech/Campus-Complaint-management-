import sqlite3
from pathlib import Path

SCHEMA_FILE = Path(__file__).resolve().parent / 'schema.sql'

DEFAULT_DEPARTMENTS = [
    ("Administration", "ADMIN", "Central administrative services and academic governance"),
    ("Computer Science", "CSE", "Department of Computer Science and Engineering"),
    ("Electrical Engineering", "EEE", "Department of Electrical and Electronics Engineering"),
    ("Mechanical Engineering", "MECH", "Department of Mechanical Engineering"),
    ("Civil Engineering", "CIVIL", "Department of Civil Engineering"),
    ("Estate & Maintenance", "ESTATE", "Campus physical infrastructure, civil works, and water supply"),
    ("IT & Network Services", "ITNET", "Campus Wi-Fi, LAN, servers, and digital systems"),
    ("Hostel & Welfare", "HOSTEL", "Student hostels, dining halls, and student welfare"),
    ("Library Services", "LIB", "Central library and department reference sections"),
    ("Transport Division", "TRANS", "College buses, parking, and transit facilities")
]

def init_db(db_path: str):
    """Initialize database tables and initial lookup records without erasing existing data."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    conn.executescript(schema_sql)
    
    # Seed default departments if table is empty
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM departments")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO departments (name, code, description) VALUES (?, ?, ?)",
            DEFAULT_DEPARTMENTS
        )
        conn.commit()
        
    conn.close()

if __name__ == '__main__':
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else 'campus_complaints.db'
    init_db(path)
    print(f"Database initialized successfully at {path}")

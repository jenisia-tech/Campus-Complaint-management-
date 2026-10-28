import os
import tempfile
import pytest
import sqlite3
from app import create_app
from database.db_init import init_db
from models.user import UserModel
from models.complaint import ComplaintModel

@pytest.fixture
def app_instance():
    """Create isolated test application with temporary SQLite database file."""
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)
    
    # Initialize schema
    init_db(db_path)
    
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'DATABASE_PATH': db_path,
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key-isolated'
    })
    
    # Pre-seed test accounts
    with app.app_context():
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        UserModel.create_user(
            name="Test Admin",
            email="testadmin@campus.edu",
            password="AdminPassword123",
            role="admin",
            department="Administration",
            db_conn=conn
        )
        UserModel.create_user(
            name="Student Alice",
            email="alice@student.campus.edu",
            password="AlicePassword123",
            role="student",
            department="Computer Science",
            student_id="STU-TEST-001",
            db_conn=conn
        )
        UserModel.create_user(
            name="Student Bob",
            email="bob@student.campus.edu",
            password="BobPassword123",
            role="student",
            department="Mechanical Engineering",
            student_id="STU-TEST-002",
            db_conn=conn
        )
        conn.close()

    yield app

    # Teardown
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
    except Exception:
        pass

@pytest.fixture
def client(app_instance):
    """Flask test client."""
    return app_instance.test_client()

@pytest.fixture
def admin_client(client):
    """Client authenticated as administrator."""
    client.post('/login', data={
        'identifier': 'testadmin@campus.edu',
        'password': 'AdminPassword123'
    }, follow_redirects=True)
    return client

@pytest.fixture
def student_client(client):
    """Client authenticated as Student Alice."""
    client.post('/login', data={
        'identifier': 'alice@student.campus.edu',
        'password': 'AlicePassword123'
    }, follow_redirects=True)
    return client

@pytest.fixture
def student_bob_client(app_instance):
    """Client authenticated as Student Bob."""
    bob_client = app_instance.test_client()
    bob_client.post('/login', data={
        'identifier': 'bob@student.campus.edu',
        'password': 'BobPassword123'
    }, follow_redirects=True)
    return bob_client


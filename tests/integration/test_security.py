import pytest
from models.user import UserModel
from models.complaint import ComplaintModel
from database.connection import get_db

def test_sql_injection_resistance(admin_client, app_instance):
    """Ensure search queries and inputs with SQL injection payloads do not compromise the database."""
    # Attempt SQL injection in search
    sql_payload = "' OR 1=1; DROP TABLE users; --"
    res = admin_client.get(f'/admin/complaints?search={sql_payload}')
    assert res.status_code == 200

    # Ensure users table is completely intact
    with app_instance.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        assert count >= 3

def test_xss_escaping_in_jinja(student_client, app_instance):
    """Ensure script tags in complaint titles are HTML-escaped by template rendering."""
    xss_payload = '<script>alert("XSS Attack!");</script>'
    student_client.post('/student/complaints/new', data={
        'title': f"Test XSS {xss_payload}",
        'description': "Detailed test description for XSS safety validation.",
        'category': "Other",
        'location': "Main Block",
        'department': "Administration",
        'priority': "Low"
    }, follow_redirects=True)

    res = student_client.get('/student/complaints')
    # Jinja autoescapes <script> to &lt;script&gt;
    assert b"<script>alert" not in res.data
    assert b"&lt;script&gt;alert" in res.data or b"Test XSS" in res.data

def test_csrf_protection_when_enabled(app_instance):
    """Verify CSRF token rejection on state-changing requests when WTF_CSRF_ENABLED is True."""
    app_instance.config['WTF_CSRF_ENABLED'] = True
    client = app_instance.test_client()

    # Login without CSRF token
    res = client.post('/login', data={
        'identifier': 'testadmin@campus.edu',
        'password': 'AdminPassword123'
    })
    # Should be rejected with 400 Bad Request
    assert res.status_code == 400
    assert b"CSRF" in res.data or b"Invalid or missing" in res.data

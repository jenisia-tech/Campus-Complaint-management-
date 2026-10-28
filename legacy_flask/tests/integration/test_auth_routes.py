import pytest

def test_student_registration_flow(client):
    # GET register page
    res = client.get('/register')
    assert res.status_code == 200
    assert b"Student Registration" in res.data

    # POST valid registration
    res = client.post('/register', data={
        'name': 'Grace Hopper',
        'student_id': 'STU-2026-042',
        'email': 'grace@student.campus.edu',
        'department': 'Computer Science',
        'password': 'StrongPassword123',
        'confirm_password': 'StrongPassword123'
    }, follow_redirects=True)
    assert res.status_code == 200
    assert b"Registration successful" in res.data

    # Duplicate registration fails
    res_dup = client.post('/register', data={
        'name': 'Grace Hopper Copy',
        'student_id': 'STU-2026-042',
        'email': 'grace2@student.campus.edu',
        'department': 'Computer Science',
        'password': 'StrongPassword123',
        'confirm_password': 'StrongPassword123'
    }, follow_redirects=True)
    assert b"Student ID already exists" in res_dup.data

def test_login_and_logout_flows(client):
    # Invalid login credentials
    res_fail = client.post('/login', data={
        'identifier': 'alice@student.campus.edu',
        'password': 'WrongPassword!'
    }, follow_redirects=True)
    assert b"Invalid credentials" in res_fail.data

    # Valid Student Login
    res_student = client.post('/login', data={
        'identifier': 'alice@student.campus.edu',
        'password': 'AlicePassword123'
    }, follow_redirects=True)
    assert res_student.status_code == 200
    assert b"Student Portal Dashboard" in res_student.data
    assert b"Student Alice" in res_student.data

    # Logout
    res_logout = client.post('/logout', follow_redirects=True)
    assert b"logged out securely" in res_logout.data

    # Valid Admin Login
    res_admin = client.post('/login', data={
        'identifier': 'testadmin@campus.edu',
        'password': 'AdminPassword123'
    }, follow_redirects=True)
    assert res_admin.status_code == 200
    assert b"Campus Administration Dashboard" in res_admin.data


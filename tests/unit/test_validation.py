import pytest
from services.validation import validate_registration, validate_complaint, validate_status_transition

def test_valid_student_registration():
    valid, errors = validate_registration(
        name="Charlie Brown",
        email="charlie@student.campus.edu",
        password="ValidPassword123",
        confirm_password="ValidPassword123",
        department="Computer Science",
        student_id="STU-2026-999",
        role="student"
    )
    assert valid is True
    assert len(errors) == 0

def test_registration_invalid_inputs():
    # Empty name
    valid, errors = validate_registration("", "test@campus.edu", "pass123", "pass123", "CSE", "STU-01")
    assert valid is False
    assert any("Name" in e for e in errors)

    # Invalid email formats
    for bad_email in ["notanemail", "bad@domain", "bad@@domain.com", "user@.com"]:
        valid, errors = validate_registration("John", bad_email, "pass123", "pass123", "CSE", "STU-01")
        assert valid is False

    # Short password
    valid, errors = validate_registration("John", "john@campus.edu", "12345", "12345", "CSE", "STU-01")
    assert valid is False
    assert any("Password" in e for e in errors)

    # Password mismatch
    valid, errors = validate_registration("John", "john@campus.edu", "secret123", "different", "CSE", "STU-01")
    assert valid is False
    assert any("match" in e for e in errors)

    # Invalid student ID (special characters)
    valid, errors = validate_registration("John", "john@campus.edu", "pass123", "pass123", "CSE", "STU@#$%")
    assert valid is False

def test_valid_complaint_validation():
    valid, errors = validate_complaint(
        title="Ceiling fan motor defective in Room 101",
        description="The fan is vibrating heavily and making a loud grinding noise since morning.",
        category="Classroom and infrastructure",
        location="Room 101, Main Block",
        department="Estate & Maintenance",
        priority="Medium"
    )
    assert valid is True
    assert len(errors) == 0

def test_complaint_boundary_and_invalid_inputs():
    # Empty title or whitespace only
    valid, errors = validate_complaint("   ", "This is a valid detailed description.", "Classroom and infrastructure", "Room 101", "CSE")
    assert valid is False

    # Too short title (< 5 chars)
    valid, errors = validate_complaint("Fan", "This is a valid detailed description.", "Classroom and infrastructure", "Room 101", "CSE")
    assert valid is False

    # Description too short (< 10 chars)
    valid, errors = validate_complaint("Valid Title Here", "Short", "Classroom and infrastructure", "Room 101", "CSE")
    assert valid is False

    # Invalid category
    valid, errors = validate_complaint("Valid Title Here", "This is a valid detailed description.", "Space Travel", "Room 101", "CSE")
    assert valid is False
    assert any("Category" in e for e in errors)

    # Invalid priority
    valid, errors = validate_complaint("Valid Title Here", "This is a valid detailed description.", "Wi-Fi and internet", "Lab", "ITNET", "SuperUrgent")
    assert valid is False

def test_status_transitions():
    # Valid initial transitions
    assert validate_status_transition("Submitted", "Under Review")[0] is True
    assert validate_status_transition("Submitted", "Assigned")[0] is True
    assert validate_status_transition("Submitted", "Closed")[0] is True

    # Valid progression
    assert validate_status_transition("Under Review", "In Progress")[0] is True
    assert validate_status_transition("In Progress", "Resolved")[0] is True
    assert validate_status_transition("Resolved", "Closed")[0] is True
    assert validate_status_transition("Resolved", "Reopened")[0] is True
    assert validate_status_transition("Closed", "Reopened")[0] is True

    # Same status
    assert validate_status_transition("Submitted", "Submitted")[0] is True

    # Invalid jump or bogus status
    assert validate_status_transition("Closed", "In Progress")[0] is False
    assert validate_status_transition("Submitted", "InvalidStatus")[0] is False

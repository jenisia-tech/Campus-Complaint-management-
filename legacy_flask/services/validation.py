import re
from typing import Tuple, List
from config import Config

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
STUDENT_ID_REGEX = re.compile(r'^[A-Za-z0-9\-_]{3,25}$')

# Valid state transitions matrix
VALID_TRANSITIONS = {
    'Submitted': {'Under Review', 'Assigned', 'In Progress', 'Closed'},
    'Under Review': {'Assigned', 'In Progress', 'Resolved', 'Closed'},
    'Assigned': {'In Progress', 'Under Review', 'Resolved', 'Closed'},
    'In Progress': {'Resolved', 'Under Review', 'Closed'},
    'Resolved': {'Closed', 'Reopened'},
    'Closed': {'Reopened'},
    'Reopened': {'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'}
}

def validate_registration(name: str, email: str, password: str, confirm_password: str,
                          department: str, student_id: str = None, role: str = 'student') -> Tuple[bool, List[str]]:
    """Validate user registration inputs."""
    errors = []
    
    name = (name or '').strip()
    email = (email or '').strip().lower()
    department = (department or '').strip()
    student_id = (student_id or '').strip() if student_id else None
    
    if not name or len(name) < 2 or len(name) > 100:
        errors.append("Full Name must be between 2 and 100 characters.")
        
    if not email or not EMAIL_REGEX.match(email) or len(email) > 120:
        errors.append("A valid email address is required (maximum 120 characters).")
        
    if not password or len(password) < 6 or len(password) > 128:
        errors.append("Password must be between 6 and 128 characters.")
        
    if password != confirm_password:
        errors.append("Passwords do not match.")
        
    if not department or len(department) < 2 or len(department) > 100:
        errors.append("Please specify a valid department.")
        
    if role not in ('student', 'admin'):
        errors.append("Invalid user role specified.")
        
    if role == 'student':
        if not student_id or not STUDENT_ID_REGEX.match(student_id):
            errors.append("Student ID is required and must contain 3-25 alphanumeric characters, hyphens, or underscores.")
            
    return len(errors) == 0, errors

def validate_complaint(title: str, description: str, category: str,
                       location: str, department: str, priority: str = 'Medium') -> Tuple[bool, List[str]]:
    """Validate new or edited complaint submission."""
    errors = []
    
    title = (title or '').strip()
    description = (description or '').strip()
    category = (category or '').strip()
    location = (location or '').strip()
    department = (department or '').strip()
    priority = (priority or '').strip()
    
    if not title or len(title) < 5 or len(title) > 150:
        errors.append("Title must be between 5 and 150 characters and cannot be blank.")
        
    if not description or len(description) < 10 or len(description) > 3000:
        errors.append("Detailed description must be between 10 and 3000 characters.")
        
    if category not in Config.COMPLAINT_CATEGORIES:
        errors.append(f"Category '{category}' is invalid. Choose from the official list.")
        
    if not location or len(location) < 2 or len(location) > 100:
        errors.append("Location/Building must be between 2 and 100 characters.")
        
    if not department or len(department) < 2 or len(department) > 100:
        errors.append("Responsible department must be between 2 and 100 characters.")
        
    if priority not in Config.COMPLAINT_PRIORITIES:
        errors.append(f"Priority '{priority}' is invalid. Choose Low, Medium, High, or Critical.")
        
    return len(errors) == 0, errors

def validate_status_transition(current_status: str, new_status: str) -> Tuple[bool, str]:
    """Validate whether changing from current_status to new_status is logically permitted."""
    if new_status == current_status:
        return True, "Status unchanged."
        
    if new_status not in Config.COMPLAINT_STATUSES:
        return False, f"Invalid target status: '{new_status}'."
        
    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        return False, f"Invalid status transition from '{current_status}' to '{new_status}'."
        
    return True, "Valid transition."


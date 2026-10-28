import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-campus-complaint-system-2026')
    DATABASE_PATH = os.environ.get('DATABASE_PATH', str(BASE_DIR / 'campus_complaints.db'))
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload/payload
    COMPLAINT_CATEGORIES = [
        "Classroom and infrastructure",
        "Laboratory equipment",
        "Hostel facilities",
        "Electricity and lighting",
        "Wi-Fi and internet",
        "Water and sanitation",
        "Library facilities",
        "Transportation",
        "Food and canteen",
        "Other"
    ]
    COMPLAINT_PRIORITIES = ["Low", "Medium", "High", "Critical"]
    COMPLAINT_STATUSES = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed",
        "Reopened"
    ]
    CAMPUS_DEPARTMENTS = [
        "Administration",
        "Computer Science",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Estate & Maintenance",
        "IT & Network Services",
        "Hostel & Welfare",
        "Library Services",
        "Transport Division"
    ]

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    DATABASE_PATH = ':memory:'
    SECRET_KEY = 'test-secret-key-campus'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


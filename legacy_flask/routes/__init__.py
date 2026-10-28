from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.error_handlers import error_bp

__all__ = ['auth_bp', 'student_bp', 'admin_bp', 'error_bp']


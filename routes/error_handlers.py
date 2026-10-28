from flask import Blueprint, render_template

error_bp = Blueprint('errors', __name__)

@error_bp.app_errorhandler(400)
def bad_request(error):
    description = getattr(error, 'description', 'The request could not be processed due to invalid syntax or security verification failure.')
    return render_template('errors/400.html', description=description), 400

@error_bp.app_errorhandler(403)
def forbidden(error):
    description = getattr(error, 'description', 'You do not have permission to view or access this resource.')
    return render_template('errors/403.html', description=description), 403

@error_bp.app_errorhandler(404)
def not_found(error):
    description = getattr(error, 'description', 'The requested page or record could not be found.')
    return render_template('errors/404.html', description=description), 404

@error_bp.app_errorhandler(500)
def internal_error(error):
    return render_template('errors/500.html', description="An internal server error occurred. Please contact the campus system administrator."), 500

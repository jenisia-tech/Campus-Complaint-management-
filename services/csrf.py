import secrets
from functools import wraps
from flask import session, request, abort, current_app

def generate_csrf_token() -> str:
    """Generate or retrieve the active session's CSRF token."""
    if '_csrf_token' not in session:
        session['_csrf_token'] = secrets.token_hex(32)
    return session['_csrf_token']

def csrf_protect(f):
    """Decorator to require a valid CSRF token on POST/PUT/DELETE requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ('POST', 'PUT', 'DELETE', 'PATCH'):
            # Allow skipping in test mode if configured
            if current_app.config.get('TESTING') and not current_app.config.get('WTF_CSRF_ENABLED', True):
                return f(*args, **kwargs)
                
            token = request.form.get('csrf_token') or request.headers.get('X-CSRFToken')
            expected = session.get('_csrf_token')
            
            if not token or not expected or token != expected:
                abort(400, description="Invalid or missing CSRF security token. Please refresh and try again.")
        return f(*args, **kwargs)
    return decorated_function

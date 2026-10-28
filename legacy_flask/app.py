import os
from flask import Flask, render_template, redirect, url_for, session
from config import config_by_name
from database.connection import close_db
from database.db_init import init_db
from services.csrf import generate_csrf_token

def create_app(config_name=None):
    """Application factory for Campus Complaint Management System."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
        
    app = Flask(__name__)
    config_obj = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_obj)
    
    # Initialize database tables if not already present
    with app.app_context():
        init_db(app.config['DATABASE_PATH'])
        
    # Register teardown
    app.teardown_appcontext(close_db)
    
    # Context processor for CSRF tokens and user info in Jinja templates
    @app.context_processor
    def inject_context():
        return {
            'csrf_token': generate_csrf_token,
            'current_user': session
        }
        
    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.student_routes import student_bp
    from routes.admin_routes import admin_bp
    from routes.error_handlers import error_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(error_bp)
    
    @app.route('/')
    def index():
        """Campus portal home page."""
        if 'user_id' in session:
            if session.get('role') == 'admin':
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('student.dashboard'))
        return render_template('index.html')
        
    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(host='127.0.0.1', port=5000, debug=True)


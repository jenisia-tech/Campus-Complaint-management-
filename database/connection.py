import sqlite3
from contextlib import contextmanager
from flask import current_app, g

def get_db(db_path=None):
    """Retrieve or create SQLite connection for the current Flask request context or standalone."""
    if db_path is None:
        try:
            db_path = current_app.config['DATABASE_PATH']
        except RuntimeError:
            db_path = 'campus_complaints.db'

    # If inside Flask request context, reuse connection in g
    try:
        if 'db' not in g:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            g.db = conn
        return g.db
    except RuntimeError:
        # Outside application context (CLI scripts, tests)
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

def close_db(e=None):
    """Close request context database connection."""
    try:
        db = g.pop('db', None)
        if db is not None:
            db.close()
    except RuntimeError:
        pass

@contextmanager
def db_transaction(db_path=None):
    """Context manager for explicit database transactions with automatic rollback on error."""
    conn = get_db(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise

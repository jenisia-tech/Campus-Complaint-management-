import os
import sys
import time
import threading
import tempfile
import pytest
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from app import create_app
from database.db_init import init_db
from models.user import UserModel
import sqlite3

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.edge.options import Options as EdgeOptions
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

@pytest.fixture(scope="module")
def live_server():
    """Start isolated live Flask server on localhost:5055 for browser automation."""
    db_fd, db_path = tempfile.mkstemp(suffix='_selenium.db')
    os.close(db_fd)
    
    init_db(db_path)
    
    # Pre-seed users
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    UserModel.create_user(
        name="Selenium Admin",
        email="sel_admin@campus.edu",
        password="AdminPassword123",
        role="admin",
        department="Administration",
        db_conn=conn
    )
    UserModel.create_user(
        name="Selenium Student",
        email="sel_student@campus.edu",
        password="StudentPassword123",
        role="student",
        department="Computer Science",
        student_id="STU-SEL-001",
        db_conn=conn
    )
    conn.close()

    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'DATABASE_PATH': db_path,
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'selenium-secret-key'
    })

    from werkzeug.serving import make_server
    server = make_server('127.0.0.1', 5055, app)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    time.sleep(1) # Allow server to bind

    yield "http://127.0.0.1:5055"

    server.shutdown()
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
    except Exception:
        pass

@pytest.fixture(scope="module")
def browser():
    """Initialize headless Chrome or Edge browser driver."""
    if not SELENIUM_AVAILABLE:
        pytest.skip("Selenium package not installed.")

    driver = None
    # Try Chrome first
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1280,800")
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e_chrome:
        # Try Edge fallback
        try:
            edge_options = EdgeOptions()
            edge_options.add_argument("--headless=new")
            edge_options.add_argument("--no-sandbox")
            edge_options.add_argument("--disable-dev-shm-usage")
            edge_options.add_argument("--disable-gpu")
            edge_options.add_argument("--window-size=1280,800")
            driver = webdriver.Edge(options=edge_options)
        except Exception as e_edge:
            pytest.skip(f"Could not initialize Chrome or Edge driver: Chrome err: {e_chrome}; Edge err: {e_edge}")

    yield driver

    if driver:
        driver.quit()

@pytest.mark.selenium
def test_full_browser_workflow(browser, live_server):
    """End-to-end browser test: Student login -> Submit Complaint -> History -> Logout -> Admin login -> Update Status."""
    wait = WebDriverWait(browser, 10)

    # 1. Open Login Page
    browser.get(f"{live_server}/login")
    assert "Sign In" in browser.title

    # 2. Student Login
    ident_input = wait.until(EC.presence_of_element_located((By.NAME, "identifier")))
    ident_input.send_keys("sel_student@campus.edu")
    browser.find_element(By.NAME, "password").send_keys("StudentPassword123")
    browser.find_element(By.CSS_SELECTOR, "form[action*='login'] button[type='submit']").click()

    # 3. Verify Student Dashboard
    wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Student Portal Dashboard')]")))
    assert "Student Portal Dashboard" in browser.page_source

    # 4. Navigate to Submit Complaint Form
    browser.get(f"{live_server}/student/complaints/new")
    wait.until(EC.presence_of_element_located((By.NAME, "title")))

    # Fill and submit complaint
    browser.find_element(By.NAME, "title").send_keys("Selenium Automated Test: Air conditioner failure")
    browser.find_element(By.NAME, "category").send_keys("Classroom and infrastructure")
    browser.find_element(By.NAME, "priority").send_keys("High")
    browser.find_element(By.NAME, "location").send_keys("Room 401, Engineering Wing")
    browser.find_element(By.NAME, "department").send_keys("Estate & Maintenance")
    browser.find_element(By.NAME, "description").send_keys("The split air conditioning unit is blowing warm air and leaking condensation.")
    
    # Scroll into view and click form submit
    submit_btn = browser.find_element(By.CSS_SELECTOR, "form[action*='complaints/new'] button[type='submit']")
    browser.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
    time.sleep(0.5)
    submit_btn.click()

    # 5. Verify Complaint Details Page
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'CMP-')]")))
    assert "Selenium Automated Test" in browser.page_source
    assert "Submitted" in browser.page_source

    # 6. Student Logout
    browser.get(f"{live_server}/logout")

    # 7. Administrator Login
    browser.get(f"{live_server}/login")
    ident_admin = wait.until(EC.presence_of_element_located((By.NAME, "identifier")))
    ident_admin.send_keys("sel_admin@campus.edu")
    browser.find_element(By.NAME, "password").send_keys("AdminPassword123")
    browser.find_element(By.CSS_SELECTOR, "form[action*='login'] button[type='submit']").click()

    # 8. Verify Admin Dashboard
    wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Campus Administration Dashboard')]")))
    assert "Campus Administration Dashboard" in browser.page_source

    # 9. Navigate to Complaints Directory & Open Details
    browser.get(f"{live_server}/admin/complaints")
    manage_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//a[contains(text(), 'Manage')]")))
    manage_btn.click()

    # 10. Update Complaint to In Progress
    wait.until(EC.presence_of_element_located((By.NAME, "status")))
    status_select = browser.find_element(By.NAME, "status")
    status_select.send_keys("In Progress")
    browser.find_element(By.NAME, "assigned_to").send_keys("HVAC Specialist Team")
    browser.find_element(By.NAME, "admin_remarks").send_keys("Technician dispatched with replacement refrigerant.")
    update_btn = browser.find_element(By.CSS_SELECTOR, "form[action*='update'] button[type='submit']")
    browser.execute_script("arguments[0].scrollIntoView(true);", update_btn)
    time.sleep(0.5)
    update_btn.click()

    # 11. Verify update success message
    wait.until(lambda d: "updated successfully" in d.page_source)
    assert "HVAC Specialist Team" in browser.page_source

    # 12. Admin Logout
    browser.get(f"{live_server}/logout")
    assert "Sign In" in browser.title or "CampusCare" in browser.page_source

import { test, expect } from '@playwright/test';

test.describe('Campus Complaint Management System - E2E User Journeys', () => {
  test('should render the public homepage with Academic Evaluation guide', async ({ page }) => {
    await page.goto('/');

    // Check main title
    await expect(page.locator('h1')).toContainText('Campus');
    await expect(page.locator('text=Complaint & Facility Management')).toBeVisible();

    // Check Academic Demonstration Matrix (CO1 - CO5)
    await expect(page.locator('text=Academic Project Demonstration Matrix')).toBeVisible();
    await expect(page.locator('text=CO1: Agile / Scrum')).toBeVisible();
    await expect(page.locator('text=CO2: UML & DB Design')).toBeVisible();
    await expect(page.locator('text=CO3: Testing Rigor')).toBeVisible();
    await expect(page.locator('text=CO4 & CO5: SCM & Metrics')).toBeVisible();

    // Check CTA buttons
    const studentRegBtn = page.locator('a:has-text("Student Registration")');
    await expect(studentRegBtn).toBeVisible();

    const signInBtn = page.locator('a:has-text("Sign In to Portal")');
    await expect(signInBtn).toBeVisible();
  });

  test('should navigate to login page and support evaluation demo fill', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h3:has-text("Welcome Back"), div:has-text("Welcome Back")').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify Quick Demo Fill buttons for examiners
    const studentDemoBtn = page.locator('button:has-text("Student Demo")');
    await expect(studentDemoBtn).toBeVisible();
    await studentDemoBtn.click();

    // Email and password should be filled
    await expect(page.locator('input[type="email"]')).toHaveValue('student@campus.edu');
    await expect(page.locator('input[type="password"]')).toHaveValue('Student@123456');

    // Test Admin Demo Fill
    const adminDemoBtn = page.locator('button:has-text("Admin Demo")');
    await expect(adminDemoBtn).toBeVisible();
    await adminDemoBtn.click();
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@campus.edu');
    await expect(page.locator('input[type="password"]')).toHaveValue('Admin@123456');
  });

  test('should navigate to registration page and display student fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('text=Student Registration')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="student_id"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="department"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirm_password"]')).toBeVisible();
  });
});

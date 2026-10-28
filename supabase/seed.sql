-- ====================================================================
-- Campus Complaint Management System - Supabase Demonstration Seed Data
-- File: supabase/seed.sql
-- ====================================================================

-- 1. Default Campus Departments
INSERT INTO public.departments (name, code, description) VALUES
    ('Administration', 'ADMIN', 'Central administrative governance and academic oversight'),
    ('Computer Science', 'CSE', 'Department of Computer Science and Engineering'),
    ('Electrical Engineering', 'EEE', 'Department of Electrical and Electronics Engineering'),
    ('Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
    ('Civil Engineering', 'CIVIL', 'Department of Civil Engineering'),
    ('Estate & Maintenance', 'ESTATE', 'Campus physical civil works, water supply, and building maintenance'),
    ('IT & Network Services', 'ITNET', 'Campus Wi-Fi, LAN, servers, and digital computing infrastructure'),
    ('Hostel & Welfare', 'HOSTEL', 'Student residential hostels, dining services, and student welfare'),
    ('Library Services', 'LIB', 'Central university library and reference departments'),
    ('Transport Division', 'TRANS', 'College transit buses, vehicle passes, and parking facilities')
ON CONFLICT (name) DO NOTHING;

-- Note on User Accounts & Initial Administrator Setup:
-- Supabase Auth stores user passwords securely in auth.users using bcrypt/argon2.
-- To set up an administrator account securely:
-- 1. Register a new user at your portal's /register page (e.g., admin@campus.edu).
-- 2. Run the following single SQL command in your Supabase SQL Editor:
--
--    UPDATE public.profiles
--    SET role = 'admin', department = 'Administration'
--    WHERE email = 'admin@campus.edu';
--
-- This strictly prevents non-admin users from escalating their own privileges via client forms.

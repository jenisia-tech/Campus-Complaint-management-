-- ====================================================================
-- Campus Complaint Management System - Supabase PostgreSQL Schema
-- Migration: 20261029000000_initial_schema.sql
-- ====================================================================

-- 1. Enable pgcrypto / uuid extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    student_id TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Classroom and infrastructure',
        'Laboratory equipment',
        'Hostel facilities',
        'Electricity and lighting',
        'Wi-Fi and internet',
        'Water and sanitation',
        'Library facilities',
        'Transportation',
        'Food and canteen',
        'Other'
    )),
    location TEXT NOT NULL,
    department TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened')),
    assigned_to TEXT,
    admin_remarks TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 5. Complaint Status History Audit Log
CREATE TABLE IF NOT EXISTS public.complaint_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id TEXT NOT NULL REFERENCES public.complaints(complaint_id) ON DELETE CASCADE,
    changed_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    changed_by_name TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaint_history_cid ON public.complaint_history(complaint_id);

-- 7. Sequence & Function for Concurrent-Safe CMP-YYYY-XXXX Reference Generation
CREATE SEQUENCE IF NOT EXISTS public.complaint_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.set_complaint_id()
RETURNS TRIGGER AS $$
DECLARE
    yr TEXT;
    seq_val BIGINT;
BEGIN
    IF NEW.complaint_id IS NULL OR NEW.complaint_id = '' THEN
        yr := to_char(now(), 'YYYY');
        seq_val := nextval('public.complaint_seq');
        NEW.complaint_id := 'CMP-' || yr || '-' || lpad(seq_val::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_complaint_id ON public.complaints;
CREATE TRIGGER trigger_set_complaint_id
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.set_complaint_id();

-- 8. Automated Trigger to Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, student_id, department, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Student User'),
        NEW.raw_user_meta_data->>'student_id',
        COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        student_id = EXCLUDED.student_id,
        department = EXCLUDED.department;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 9. Row Level Security (RLS) Enablement
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Departments
CREATE POLICY "Departments are readable by all users"
    ON public.departments FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Departments only editable by admins"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: Profiles
CREATE POLICY "Users can read own profile or admins can read all"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own non-role profile fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage any profile"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: Complaints
CREATE POLICY "Students can view own complaints"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can insert own complaints"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own complaints only if Submitted"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = user_id AND status = 'Submitted') OR public.is_admin()
    )
    WITH CHECK (
        (auth.uid() = user_id AND status = 'Submitted') OR public.is_admin()
    );

CREATE POLICY "Admins have full access to complaints"
    ON public.complaints FOR ALL
    TO authenticated
    USING (public.is_admin());

-- RLS: Complaint History
CREATE POLICY "Users can read history of complaints they own or admins can read all"
    ON public.complaint_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints
            WHERE complaints.complaint_id = complaint_history.complaint_id
              AND (complaints.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Authenticated users can record history on authorized complaints"
    ON public.complaint_history FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = changed_by_user_id AND
        (
            EXISTS (
                SELECT 1 FROM public.complaints
                WHERE complaints.complaint_id = complaint_history.complaint_id
                  AND complaints.user_id = auth.uid()
            )
            OR public.is_admin()
        )
    );


'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    email: '',
    department: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const name = formData.name.trim();
    const studentId = formData.student_id.trim();
    const email = formData.email.trim().toLowerCase();
    const department = formData.department.trim();
    const password = formData.password;
    const confirmPassword = formData.confirm_password;

    if (!name || !studentId || !email || !department || !password) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            student_id: studentId,
            department,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        setSuccessMessage('Registration successful! Redirecting...');

        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccessMessage(
          'Registration successful! Please check your email and confirm your account before signing in.'
        );
      }
    } catch {
      setErrorMessage(
        'Something went wrong while creating your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

  const labelClassName = 'block text-sm font-medium text-gray-700';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-sm">
            🎓
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an Account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Register to access the Campus Complaint Management System.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {successMessage}

              {!loading && (
                <div className="mt-2">
                  <Link
                    href="/login"
                    className="font-semibold underline"
                  >
                    Go to Sign In
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClassName}>
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="student_id" className={labelClassName}>
                Student ID
              </label>

              <input
                id="student_id"
                name="student_id"
                type="text"
                placeholder="Enter your student ID"
                value={formData.student_id}
                onChange={handleChange}
                className={inputClassName}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClassName}>
                College Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="department" className={labelClassName}>
                Department
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClassName}
                required
                disabled={loading}
              >
                <option value="">Select your department</option>
                <option value="Administration">Administration</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">
                  Electrical Engineering
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Estate & Maintenance">
                  Estate & Maintenance
                </option>
                <option value="IT & Network Services">
                  IT & Network Services
                </option>
                <option value="Hostel & Welfare">Hostel & Welfare</option>
                <option value="Library Services">Library Services</option>
                <option value="Transport Division">Transport Division</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password (minimum 8 characters)"
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className={labelClassName}>
                Confirm Password
              </label>

              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={formData.confirm_password}
                onChange={handleChange}
                className={inputClassName}
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-5 text-center text-sm text-gray-600">
            Already have an account?

            <Link
              href="/login"
              className="ml-1.5 font-semibold text-blue-600 hover:underline"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Your account is managed securely through Supabase authentication.
        </p>
      </div>
    </main>
  );
}
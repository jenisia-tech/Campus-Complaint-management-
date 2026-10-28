import { z } from 'zod';
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types/database';

export const COMPLAINT_CATEGORIES: [ComplaintCategory, ...ComplaintCategory[]] = [
  'Classroom and infrastructure',
  'Laboratory equipment',
  'Hostel facilities',
  'Electricity and lighting',
  'Wi-Fi and internet',
  'Water and sanitation',
  'Library facilities',
  'Transportation',
  'Food and canteen',
  'Other',
];

export const COMPLAINT_PRIORITIES: [ComplaintPriority, ...ComplaintPriority[]] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const COMPLAINT_STATUSES: [ComplaintStatus, ...ComplaintStatus[]] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
];

export const CAMPUS_DEPARTMENTS = [
  'Administration',
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Estate & Maintenance',
  'IT & Network Services',
  'Hostel & Welfare',
  'Library Services',
  'Transport Division',
] as const;

export const VALID_STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  Submitted: ['Under Review', 'Assigned', 'In Progress', 'Closed'],
  'Under Review': ['Assigned', 'In Progress', 'Resolved', 'Closed'],
  Assigned: ['In Progress', 'Under Review', 'Resolved', 'Closed'],
  'In Progress': ['Resolved', 'Under Review', 'Closed'],
  Resolved: ['Closed', 'Reopened'],
  Closed: ['Reopened'],
  Reopened: ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
};

export const complaintSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .refine((val) => val.trim().length >= 5, 'Title cannot consist solely of whitespace'),
  description: z
    .string()
    .min(10, 'Detailed description must be at least 10 characters')
    .max(3000, 'Description cannot exceed 3000 characters')
    .refine((val) => val.trim().length >= 10, 'Description cannot be blank'),
  category: z.enum(COMPLAINT_CATEGORIES, {
    errorMap: () => ({ message: 'Please select an official campus category' }),
  }),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location cannot exceed 100 characters'),
  department: z
    .string()
    .min(2, 'Please select a responsible department')
    .max(100),
  priority: z.enum(COMPLAINT_PRIORITIES).default('Medium'),
});

export const createComplaintSchema = complaintSchema;
export const complaintUpdateSchema = complaintSchema.partial();

export const adminUpdateSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
  department: z.string().min(2, 'Department is required').optional(),
  assigned_to: z.string().max(100).optional().nullable(),
  admin_remarks: z.string().max(1000).optional().nullable(),
  resolution_notes: z.string().max(2000).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid college email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    student_id: z
      .string()
      .min(3, 'Student ID must be at least 3 characters')
      .max(25, 'Student ID cannot exceed 25 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Student ID can only contain letters, numbers, hyphens, and underscores'),
    email: z.string().email('Please enter a valid college email address').max(120),
    department: z.string().min(2, 'Please select your department'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
  })
  .refine((data) => {
    const confirmation = data.confirm_password || data.confirmPassword;
    return confirmation && data.password === confirmation;
  }, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export function isValidTransition(currentStatus: ComplaintStatus, newStatus: ComplaintStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

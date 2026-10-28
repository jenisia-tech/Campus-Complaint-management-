import type { Complaint, ComplaintHistory, Profile } from '@/types/database';

export const DEMO_STUDENT: Profile = {
  id: 'd0000000-0000-0000-0000-000000000001',
  name: 'Alex Johnson',
  student_id: 'STU-2026-0042',
  email: 'student@campus.edu',
  role: 'student',
  department: 'Computer Science and Engineering',
  created_at: '2026-10-25T09:00:00Z',
  updated_at: '2026-10-25T09:00:00Z',
};

export const DEMO_ADMIN: Profile = {
  id: 'd0000000-0000-0000-0000-000000000002',
  name: 'Dr. Sarah Mitchell',
  student_id: null,
  email: 'admin@campus.edu',
  role: 'admin',
  department: 'General Administration',
  created_at: '2026-10-20T08:00:00Z',
  updated_at: '2026-10-20T08:00:00Z',
};

export const INITIAL_DEMO_COMPLAINTS: Complaint[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    complaint_id: 'CMP-2026-0001',
    user_id: DEMO_STUDENT.id,
    title: 'Ceiling projector mount loose and vibrating in Lab 302',
    description:
      'The overhead projector in Computer Lab 302 has a severely loosened ceiling bracket that vibrates during lectures. This poses an equipment safety hazard and interrupts screen viewing.',
    category: 'Laboratory equipment',
    location: 'Science Block B, Room 302',
    department: 'Campus IT & Wi-Fi Network',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'John Vance (Lead AV Technician)',
    admin_remarks: 'Technician dispatched with replacement ceiling anchors.',
    resolution_notes: null,
    created_at: '2026-10-27T10:15:00Z',
    updated_at: '2026-10-28T14:30:00Z',
    resolved_at: null,
    profiles: DEMO_STUDENT,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    complaint_id: 'CMP-2026-0002',
    user_id: DEMO_STUDENT.id,
    title: 'Water cooler leaking water onto main corridor floor',
    description:
      'Drinking water cooler near Room 204 is continuously leaking clean water, making the tiled hallway slippery and hazardous for walking.',
    category: 'Water and sanitation',
    location: 'Mechanical Block, 2nd Floor Corridor',
    department: 'Water Supply & Sanitation Facility',
    priority: 'Critical',
    status: 'Assigned',
    assigned_to: 'Maintenance Team B',
    admin_remarks: 'Emergency plumbing crew notified to inspect drain valve.',
    resolution_notes: null,
    created_at: '2026-10-28T08:45:00Z',
    updated_at: '2026-10-28T09:30:00Z',
    resolved_at: null,
    profiles: DEMO_STUDENT,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    complaint_id: 'CMP-2026-0003',
    user_id: DEMO_STUDENT.id,
    title: 'Campus Wi-Fi connectivity drops intermittently in Reading Hall',
    description:
      'The central library reading room Wi-Fi access point (CampusNet-West) disconnects students every 15 minutes during study sessions.',
    category: 'Wi-Fi and internet',
    location: 'Central Library, 1st Floor Reading Room',
    department: 'Campus IT & Wi-Fi Network',
    priority: 'Medium',
    status: 'Submitted',
    assigned_to: null,
    admin_remarks: null,
    resolution_notes: null,
    created_at: '2026-10-28T16:20:00Z',
    updated_at: '2026-10-28T16:20:00Z',
    resolved_at: null,
    profiles: DEMO_STUDENT,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    complaint_id: 'CMP-2026-0004',
    user_id: DEMO_STUDENT.id,
    title: 'Hostel 3 bathroom water heater switch sparked',
    description:
      'The power switch for geyser 2 in Hostel 3 second floor bathroom sparked when toggled on. Power was isolated immediately.',
    category: 'Electricity and lighting',
    location: 'Hostel Block 3, 2nd Floor Bathroom',
    department: 'Electrical & Power Systems',
    priority: 'Critical',
    status: 'Resolved',
    assigned_to: 'R. Sharma (Senior Electrician)',
    admin_remarks: 'Switchboard replaced with a high-rated 16A MCB isolator.',
    resolution_notes: 'Replaced charred switch assembly and load-tested safely at 220V.',
    created_at: '2026-10-26T07:30:00Z',
    updated_at: '2026-10-26T12:00:00Z',
    resolved_at: '2026-10-26T12:00:00Z',
    profiles: DEMO_STUDENT,
  },
];

export const INITIAL_DEMO_HISTORY: Record<string, ComplaintHistory[]> = {
  'CMP-2026-0001': [
    {
      id: 'h1',
      complaint_id: 'c0000000-0000-0000-0000-000000000001',
      changed_by_user_id: DEMO_STUDENT.id,
      changed_by_name: DEMO_STUDENT.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint lodged by student',
      created_at: '2026-10-27T10:15:00Z',
    },
    {
      id: 'h2',
      complaint_id: 'c0000000-0000-0000-0000-000000000001',
      changed_by_user_id: DEMO_ADMIN.id,
      changed_by_name: DEMO_ADMIN.name,
      old_status: 'Submitted',
      new_status: 'Under Review',
      remarks: 'Assessed during morning maintenance triage',
      created_at: '2026-10-27T11:00:00Z',
    },
    {
      id: 'h3',
      complaint_id: 'c0000000-0000-0000-0000-000000000001',
      changed_by_user_id: DEMO_ADMIN.id,
      changed_by_name: DEMO_ADMIN.name,
      old_status: 'Under Review',
      new_status: 'In Progress',
      remarks: 'Assigned to John Vance; technician on site',
      created_at: '2026-10-28T14:30:00Z',
    },
  ],
  'CMP-2026-0002': [
    {
      id: 'h4',
      complaint_id: 'c0000000-0000-0000-0000-000000000002',
      changed_by_user_id: DEMO_STUDENT.id,
      changed_by_name: DEMO_STUDENT.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint lodged by student',
      created_at: '2026-10-28T08:45:00Z',
    },
    {
      id: 'h5',
      complaint_id: 'c0000000-0000-0000-0000-000000000002',
      changed_by_user_id: DEMO_ADMIN.id,
      changed_by_name: DEMO_ADMIN.name,
      old_status: 'Submitted',
      new_status: 'Assigned',
      remarks: 'Assigned to Maintenance Team B for plumbing check',
      created_at: '2026-10-28T09:30:00Z',
    },
  ],
  'CMP-2026-0003': [
    {
      id: 'h6',
      complaint_id: 'c0000000-0000-0000-0000-000000000003',
      changed_by_user_id: DEMO_STUDENT.id,
      changed_by_name: DEMO_STUDENT.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint lodged by student',
      created_at: '2026-10-28T16:20:00Z',
    },
  ],
  'CMP-2026-0004': [
    {
      id: 'h7',
      complaint_id: 'c0000000-0000-0000-0000-000000000004',
      changed_by_user_id: DEMO_STUDENT.id,
      changed_by_name: DEMO_STUDENT.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint lodged by student',
      created_at: '2026-10-26T07:30:00Z',
    },
    {
      id: 'h8',
      complaint_id: 'c0000000-0000-0000-0000-000000000004',
      changed_by_user_id: DEMO_ADMIN.id,
      changed_by_name: DEMO_ADMIN.name,
      old_status: 'Submitted',
      new_status: 'In Progress',
      remarks: 'Emergency electrician assigned',
      created_at: '2026-10-26T08:00:00Z',
    },
    {
      id: 'h9',
      complaint_id: 'c0000000-0000-0000-0000-000000000004',
      changed_by_user_id: DEMO_ADMIN.id,
      changed_by_name: DEMO_ADMIN.name,
      old_status: 'In Progress',
      new_status: 'Resolved',
      remarks: 'Switchboard replaced with high-rated 16A MCB isolator',
      created_at: '2026-10-26T12:00:00Z',
    },
  ],
};

// Global in-memory cache for demo mode during current runtime session
declare global {
  var __CAMPUS_DEMO_COMPLAINTS: Complaint[] | undefined;
  var __CAMPUS_DEMO_HISTORY: Record<string, ComplaintHistory[]> | undefined;
}

export function getDemoComplaints(): Complaint[] {
  if (!globalThis.__CAMPUS_DEMO_COMPLAINTS) {
    globalThis.__CAMPUS_DEMO_COMPLAINTS = [...INITIAL_DEMO_COMPLAINTS];
  }
  return globalThis.__CAMPUS_DEMO_COMPLAINTS;
}

export function getDemoHistory(): Record<string, ComplaintHistory[]> {
  if (!globalThis.__CAMPUS_DEMO_HISTORY) {
    globalThis.__CAMPUS_DEMO_HISTORY = { ...INITIAL_DEMO_HISTORY };
  }
  return globalThis.__CAMPUS_DEMO_HISTORY;
}

export function addDemoComplaint(complaint: Partial<Complaint>): Complaint {
  const complaints = getDemoComplaints();
  const nextNum = complaints.length + 1;
  const year = new Date().getFullYear();
  const complaint_id = `CMP-${year}-${String(nextNum).padStart(4, '0')}`;
  const id = `c0000000-0000-0000-0000-${String(nextNum).padStart(12, '0')}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id,
    complaint_id,
    user_id: complaint.user_id || DEMO_STUDENT.id,
    title: complaint.title || 'Untitled Grievance',
    description: complaint.description || '',
    category: complaint.category || 'Other',
    location: complaint.location || 'Campus',
    department: complaint.department || 'General Administration',
    priority: complaint.priority || 'Medium',
    status: 'Submitted',
    assigned_to: null,
    admin_remarks: null,
    resolution_notes: null,
    created_at: now,
    updated_at: now,
    resolved_at: null,
    profiles: DEMO_STUDENT,
  };

  complaints.unshift(newComplaint);

  const history = getDemoHistory();
  history[complaint_id] = [
    {
      id: `h_${Date.now()}`,
      complaint_id: id,
      changed_by_user_id: newComplaint.user_id,
      changed_by_name: DEMO_STUDENT.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint lodged by student (Demo Mode)',
      created_at: now,
    },
  ];

  return newComplaint;
}

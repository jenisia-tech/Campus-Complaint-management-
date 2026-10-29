export type UserRole = 'student' | 'admin';

export type ComplaintType = 'Hostel' | 'College';

export type ComplaintCategory =
  | 'Classroom and infrastructure'
  | 'Laboratory equipment'
  | 'Hostel facilities'
  | 'Electricity and lighting'
  | 'Wi-Fi and internet'
  | 'Water and sanitation'
  | 'Library facilities'
  | 'Transportation'
  | 'Food and canteen'
  | 'Plumbing and water supply'
  | 'Cleanliness and housekeeping'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export interface Profile {
  id: string;
  name: string;
  student_id: string | null;
  email: string;
  role: UserRole;
  department: string;
  course?: string | null;
  year_of_study?: string | null;
  hostel_block?: string | null;
  floor?: string | null;
  room_number?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_id: string;
  user_id: string;
  title: string;
  description: string;
  complaint_type: ComplaintType;
  category: ComplaintCategory;
  location: string;
  department: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  hostel_block?: string | null;
  floor?: string | null;
  room_number?: string | null;
  building?: string | null;
  facility?: string | null;
  assigned_to: string | null;
  admin_remarks: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  // Joined relation:
  profiles?: Profile;
}

export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  changed_by_user_id: string;
  changed_by_name: string;
  old_status: string | null;
  new_status: string;
  remarks: string | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  critical: number;
  avg_resolution_hours: number;
  categories: { category: string; count: number }[];
  statuses: { status: string; count: number }[];
  priorities: { priority: string; count: number }[];
  departments: { department: string; count: number }[];
  recent: Complaint[];
}

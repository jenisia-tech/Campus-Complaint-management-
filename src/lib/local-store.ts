import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Complaint, ComplaintHistory, Profile, ComplaintType, ComplaintCategory } from '@/types/database';

const STORE_PATH = path.join(process.cwd(), 'data', 'campus-store.json');

export interface StoredUser extends Profile {
  password_hash?: string;
}

export interface CampusStoreData {
  users: StoredUser[];
  complaints: Complaint[];
  history: Record<string, ComplaintHistory[]>;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`campus_salt_2026_${password}`).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const DEFAULT_ADMIN: StoredUser = {
  id: 'd0000000-0000-0000-0000-000000000002',
  name: 'Chief Administrator',
  student_id: null,
  email: 'admin@campus.edu',
  password_hash: hashPassword('Admin@123456'),
  role: 'admin',
  department: 'General Administration',
  phone: '+91 98765 00001',
  created_at: '2026-10-20T08:00:00Z',
  updated_at: '2026-10-20T08:00:00Z',
};

// Clean initial state: zero fake complaints, zero fake activity
const INITIAL_COMPLAINTS: Complaint[] = [];
const INITIAL_HISTORY: Record<string, ComplaintHistory[]> = {};

function ensureDataDirectory() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadStore(): CampusStoreData {
  ensureDataDirectory();
  if (!fs.existsSync(STORE_PATH)) {
    const initialData: CampusStoreData = {
      users: [DEFAULT_ADMIN],
      complaints: INITIAL_COMPLAINTS,
      history: INITIAL_HISTORY,
    };
    saveStore(initialData);
    return initialData;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const data = JSON.parse(raw) as CampusStoreData;
    if (!Array.isArray(data.users)) data.users = [DEFAULT_ADMIN];
    if (!Array.isArray(data.complaints)) data.complaints = [];
    if (!data.history) data.history = {};
    return data;
  } catch (err) {
    console.error('Failed to parse campus-store.json, creating clean fallback:', err);
    const fallback: CampusStoreData = {
      users: [DEFAULT_ADMIN],
      complaints: [],
      history: {},
    };
    saveStore(fallback);
    return fallback;
  }
}

export function saveStore(data: CampusStoreData) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write campus-store.json:', err);
  }
}

// User & Profile Management
export function findUserByEmail(email: string): StoredUser | null {
  const store = loadStore();
  return store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export function findUserById(id: string): StoredUser | null {
  const store = loadStore();
  return store.users.find((u) => u.id === id) || null;
}

export function verifyUserCredentials(email: string, password: string): { user: StoredUser | null; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { user: null, error: 'Account not found with this email address.' };
  }
  if (!user.password_hash) {
    return { user, error: undefined };
  }
  if (!verifyPassword(password, user.password_hash)) {
    return { user: null, error: 'Invalid password. Please check your credentials.' };
  }
  return { user, error: undefined };
}

export function saveOrUpdateUser(user: Partial<StoredUser> & { email: string; password?: string }): StoredUser {
  const store = loadStore();
  const existingIndex = store.users.findIndex(
    (u) => u.email.toLowerCase() === user.email.toLowerCase() || (user.id && u.id === user.id)
  );

  const now = new Date().toISOString();
  const passwordHash = user.password ? hashPassword(user.password) : undefined;

  if (existingIndex >= 0) {
    const existing = store.users[existingIndex];
    const updated: StoredUser = {
      ...existing,
      ...user,
      password_hash: passwordHash || existing.password_hash,
      updated_at: now,
    };
    delete (updated as { password?: string }).password;
    store.users[existingIndex] = updated;
    saveStore(store);
    return updated;
  }

  const newUser: StoredUser = {
    id: user.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: user.name || user.email.split('@')[0],
    student_id: user.student_id || null,
    email: user.email.toLowerCase().trim(),
    password_hash: passwordHash || hashPassword('Student@123456'),
    role: user.role || 'student',
    department: user.department || 'Computer Science and Engineering',
    course: user.course || 'B.Tech Information Technology',
    year_of_study: user.year_of_study || '3rd Year',
    hostel_block: user.hostel_block || null,
    floor: user.floor || null,
    room_number: user.room_number || null,
    phone: user.phone || null,
    created_at: now,
    updated_at: now,
  };
  delete (newUser as { password?: string }).password;

  store.users.push(newUser);
  saveStore(store);
  return newUser;
}

// Complaint Querying (Calculates actual statistics, strictly filters by userId for students)
export function getStoredComplaints(options?: {
  userId?: string;
  type?: ComplaintType | 'All';
}): Complaint[] {
  const store = loadStore();
  let list: Complaint[] = store.complaints.map((c) => {
    if (!c.profiles) {
      const u = store.users.find((user) => user.id === c.user_id);
      if (u) {
        const { password_hash, ...profileOnly } = u;
        return {
          ...c,
          profiles: profileOnly,
        };
      }
    }
    return c;
  });

  if (options?.userId) {
    list = list.filter((c) => c.user_id === options.userId);
  }

  if (options?.type && options.type !== 'All') {
    list = list.filter((c) => (c.complaint_type || 'College') === options.type);
  }

  return list;
}

export function getStoredComplaintById(id: string): Complaint | null {
  const store = loadStore();
  const c = store.complaints.find((comp) => comp.id === id || comp.complaint_id === id);
  if (!c) return null;
  if (!c.profiles) {
    const u = store.users.find((user) => user.id === c.user_id);
    if (u) {
      const { password_hash, ...profileOnly } = u;
      return {
        ...c,
        profiles: profileOnly,
      };
    }
  }
  return c;
}

export function getStoredHistory(complaintRefOrId: string): ComplaintHistory[] {
  const store = loadStore();
  const complaint = getStoredComplaintById(complaintRefOrId);
  if (!complaint) return [];
  return store.history[complaint.complaint_id] || store.history[complaint.id] || [];
}

export function addStoredComplaint(
  complaintData: Partial<Complaint>,
  userProfile: Profile
): Complaint {
  const store = loadStore();
  const year = new Date().getFullYear();
  const nextNum = store.complaints.length + 1;
  const complaint_id = `CMP-${year}-${String(nextNum).padStart(4, '0')}`;
  const id = `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let complaintType: ComplaintType = complaintData.complaint_type || 'College';
  if (!complaintData.complaint_type) {
    if (
      complaintData.category === 'Hostel facilities' ||
      complaintData.category === 'Plumbing and water supply' ||
      complaintData.location?.toLowerCase().includes('hostel') ||
      complaintData.title?.toLowerCase().includes('hostel')
    ) {
      complaintType = 'Hostel';
    }
  }

  const newComplaint: Complaint = {
    id,
    complaint_id,
    user_id: userProfile.id,
    title: complaintData.title || 'Untitled Grievance',
    description: complaintData.description || '',
    complaint_type: complaintType,
    category: (complaintData.category as ComplaintCategory) || 'Other',
    location: complaintData.location || (complaintType === 'Hostel' ? 'Hostel Campus' : 'Academic Block'),
    department: complaintData.department || 'General Administration',
    priority: complaintData.priority || 'Medium',
    status: 'Submitted',
    hostel_block: complaintData.hostel_block || null,
    floor: complaintData.floor || null,
    room_number: complaintData.room_number || null,
    building: complaintData.building || null,
    facility: complaintData.facility || null,
    assigned_to: null,
    admin_remarks: null,
    resolution_notes: null,
    created_at: now,
    updated_at: now,
    resolved_at: null,
    profiles: userProfile,
  };

  store.complaints.unshift(newComplaint);

  store.history[complaint_id] = [
    {
      id: `h_${Date.now()}`,
      complaint_id: id,
      changed_by_user_id: userProfile.id,
      changed_by_name: userProfile.name,
      old_status: null,
      new_status: 'Submitted',
      remarks: 'Complaint registered in campus ledger',
      created_at: now,
    },
  ];

  saveStore(store);
  return newComplaint;
}

export function updateStoredComplaint(
  id: string,
  updates: Partial<Complaint>,
  changedBy?: { id: string; name: string }
): Complaint | null {
  const store = loadStore();
  const index = store.complaints.findIndex((c) => c.id === id || c.complaint_id === id);
  if (index === -1) return null;

  const existing = store.complaints[index];
  const oldStatus = existing.status;
  const now = new Date().toISOString();

  const updated: Complaint = {
    ...existing,
    ...updates,
    updated_at: now,
    resolved_at:
      updates.status === 'Resolved' || updates.status === 'Closed'
        ? existing.resolved_at || now
        : existing.resolved_at,
  };

  store.complaints[index] = updated;

  // Record audit history entry
  if (updates.status && updates.status !== oldStatus) {
    if (!store.history[existing.complaint_id]) {
      store.history[existing.complaint_id] = [];
    }
    store.history[existing.complaint_id].push({
      id: `h_${Date.now()}`,
      complaint_id: existing.id,
      changed_by_user_id: changedBy?.id || 'system',
      changed_by_name: changedBy?.name || 'Administrator',
      old_status: oldStatus,
      new_status: updates.status,
      remarks: updates.admin_remarks || updates.resolution_notes || `Status transitioned to ${updates.status}`,
      created_at: now,
    });
  }

  saveStore(store);
  return updated;
}

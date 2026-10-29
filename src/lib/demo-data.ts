import type { Complaint, ComplaintHistory, Profile } from '@/types/database';
import { DEMO_STUDENT, DEMO_ADMIN } from './auth-demo';
import {
  getStoredComplaints,
  loadStore,
  addStoredComplaint,
} from './local-store';

export { DEMO_STUDENT, DEMO_ADMIN };

export function getDemoComplaints(): Complaint[] {
  return getStoredComplaints();
}

export function getDemoHistory(): Record<string, ComplaintHistory[]> {
  const store = loadStore();
  return store.history;
}

export function addDemoComplaint(complaint: Partial<Complaint>): Complaint {
  return addStoredComplaint(complaint, DEMO_STUDENT);
}

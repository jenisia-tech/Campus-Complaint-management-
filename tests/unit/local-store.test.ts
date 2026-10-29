import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  saveOrUpdateUser,
  findUserByEmail,
  findUserById,
  verifyUserCredentials,
  getStoredComplaints,
  addStoredComplaint,
  updateStoredComplaint,
  getStoredHistory,
  loadStore,
  saveStore,
  DEFAULT_ADMIN,
} from '@/lib/local-store';
import { isValidTransition } from '@/lib/validations/complaint';
import type { Profile } from '@/types/database';

describe('Local Store & Business Logic Unit Tests', () => {
  beforeEach(() => {
    // Reset store to a clean test state before each test
    saveStore({
      users: [DEFAULT_ADMIN],
      complaints: [],
      history: {},
    });
  });

  describe('Password Hashing & Authentication', () => {
    it('hashes passwords securely and does not store plaintext', () => {
      const plain = 'SecretPassword@123';
      const hashed = hashPassword(plain);
      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBe(64); // SHA-256 hex string
      expect(verifyPassword(plain, hashed)).toBe(true);
      expect(verifyPassword('WrongPassword', hashed)).toBe(false);
    });

    it('verifies user credentials accurately', () => {
      saveOrUpdateUser({
        name: 'Test Student',
        email: 'test.student@campus.edu',
        password: 'Password@123456',
        role: 'student',
      });

      const validLogin = verifyUserCredentials('test.student@campus.edu', 'Password@123456');
      expect(validLogin.user).not.toBeNull();
      expect(validLogin.user?.email).toBe('test.student@campus.edu');

      const invalidLogin = verifyUserCredentials('test.student@campus.edu', 'WrongPass');
      expect(invalidLogin.user).toBeNull();
      expect(invalidLogin.error).toContain('Invalid password');
    });
  });

  describe('Zero Junk Records & Strict Isolation', () => {
    it('guarantees a newly registered user starts with zero complaints', () => {
      const student = saveOrUpdateUser({
        name: 'New Student',
        email: 'new.student@campus.edu',
        role: 'student',
      });

      const complaints = getStoredComplaints({ userId: student.id });
      expect(complaints).toEqual([]);
      expect(complaints.length).toBe(0);
    });

    it('strictly isolates complaints between different student accounts', () => {
      const student1: Profile = {
        id: 'student-id-001',
        name: 'Student One',
        email: 'student1@campus.edu',
        role: 'student',
        student_id: 'STU-001',
        department: 'Computer Science',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const student2: Profile = {
        id: 'student-id-002',
        name: 'Student Two',
        email: 'student2@campus.edu',
        role: 'student',
        student_id: 'STU-002',
        department: 'Electrical Engineering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Student 1 logs a complaint
      addStoredComplaint(
        {
          title: 'Wi-Fi broken in Hostel Room 101',
          description: 'Router not responding',
          complaint_type: 'Hostel',
          category: 'Wi-Fi and internet',
          location: 'Hostel Block A, Room 101',
          department: 'IT & Network Services',
          priority: 'High',
        },
        student1
      );

      // Student 1 sees 1 complaint
      const list1 = getStoredComplaints({ userId: student1.id });
      expect(list1.length).toBe(1);
      expect(list1[0].user_id).toBe(student1.id);

      // Student 2 sees 0 complaints
      const list2 = getStoredComplaints({ userId: student2.id });
      expect(list2.length).toBe(0);

      // Admin sees all complaints
      const adminList = getStoredComplaints();
      expect(adminList.length).toBe(1);
    });
  });

  describe('Hostel vs. College Grievance Segmentation', () => {
    it('categorizes and filters Hostel and College complaints correctly', () => {
      const testStudent: Profile = {
        id: 'test-stu-id',
        name: 'Test Student',
        email: 'test@campus.edu',
        role: 'student',
        student_id: 'STU-100',
        department: 'Civil Engineering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Hostel complaint
      addStoredComplaint(
        {
          title: 'Hostel geyser not working',
          description: 'No hot water in bathroom',
          complaint_type: 'Hostel',
          category: 'Hostel facilities',
          location: 'Hostel Block 2, Room 205',
          department: 'Hostel & Welfare',
          priority: 'High',
        },
        testStudent
      );

      // College complaint
      addStoredComplaint(
        {
          title: 'Classroom projector broken',
          description: 'Projector bulb fused in Hall 101',
          complaint_type: 'College',
          category: 'Classroom and infrastructure',
          location: 'Main Academic Block, Room 101',
          department: 'IT & Network Services',
          priority: 'Medium',
        },
        testStudent
      );

      const all = getStoredComplaints({ userId: testStudent.id });
      expect(all.length).toBe(2);

      const hostelOnly = getStoredComplaints({ userId: testStudent.id, type: 'Hostel' });
      expect(hostelOnly.length).toBe(1);
      expect(hostelOnly[0].complaint_type).toBe('Hostel');

      const collegeOnly = getStoredComplaints({ userId: testStudent.id, type: 'College' });
      expect(collegeOnly.length).toBe(1);
      expect(collegeOnly[0].complaint_type).toBe('College');
    });
  });

  describe('Sequential Reference ID & Audit Trail', () => {
    it('generates sequential complaint reference IDs and records history', () => {
      const student: Profile = {
        id: 'student-id-999',
        name: 'Alex Johnson',
        email: 'alex@campus.edu',
        role: 'student',
        student_id: 'STU-999',
        department: 'Mechanical Engineering',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const c1 = addStoredComplaint(
        {
          title: 'First complaint title text',
          description: 'First complaint description exceeding ten chars',
          category: 'Other',
          location: 'Library',
          department: 'Library Services',
        },
        student
      );

      const currentYear = new Date().getFullYear();
      expect(c1.complaint_id).toMatch(new RegExp(`^CMP-${currentYear}-\\d{4}$`));

      const history = getStoredHistory(c1.complaint_id);
      expect(history.length).toBe(1);
      expect(history[0].new_status).toBe('Submitted');

      // Admin updates status
      const updated = updateStoredComplaint(
        c1.id,
        {
          status: 'In Progress',
          admin_remarks: 'Technician assigned to inspect issue',
        },
        { id: DEFAULT_ADMIN.id, name: DEFAULT_ADMIN.name }
      );

      expect(updated?.status).toBe('In Progress');
      const updatedHistory = getStoredHistory(c1.complaint_id);
      expect(updatedHistory.length).toBe(2);
      expect(updatedHistory[1].old_status).toBe('Submitted');
      expect(updatedHistory[1].new_status).toBe('In Progress');
    });
  });

  describe('Workflow State Machine Restrictions', () => {
    it('validates allowed status transitions', () => {
      expect(isValidTransition('Submitted', 'Under Review')).toBe(true);
      expect(isValidTransition('Submitted', 'Assigned')).toBe(true);
      expect(isValidTransition('Assigned', 'In Progress')).toBe(true);
      expect(isValidTransition('In Progress', 'Resolved')).toBe(true);
      expect(isValidTransition('Resolved', 'Closed')).toBe(true);
      expect(isValidTransition('Resolved', 'Reopened')).toBe(true);

      // Disallowed direct transitions
      expect(isValidTransition('Submitted', 'Resolved')).toBe(false);
      expect(isValidTransition('Closed', 'In Progress')).toBe(false);
    });
  });
});


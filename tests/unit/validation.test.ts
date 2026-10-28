import { describe, it, expect } from 'vitest';
import {
  createComplaintSchema,
  complaintUpdateSchema,
  loginSchema,
  registerSchema,
  isValidTransition,
} from '@/lib/validations/complaint';

describe('Validation Schemas & Workflow Rules', () => {
  describe('createComplaintSchema', () => {
    it('should validate a complete valid complaint submission', () => {
      const validPayload = {
        title: 'Projector ceiling bracket broken in Lab 302',
        description:
          'The ceiling mount vibrating dangerously during lab practicals. Needs urgent bolt replacement.',
        category: 'Laboratory equipment',
        location: 'Science Block B, Room 302',
        department: 'Campus IT & Wi-Fi Network',
        priority: 'High',
      };

      const result = createComplaintSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject a submission with title shorter than 5 characters', () => {
      const invalid = {
        title: 'Fix',
        description: 'Detailed description exceeding ten chars',
        category: 'Hostel facilities',
        location: 'Hostel Block 1',
        department: 'Hostel Administration & Housing',
        priority: 'Low',
      };

      const result = createComplaintSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 5 characters');
      }
    });

    it('should reject invalid categories outside permitted domain enum', () => {
      const invalid = {
        title: 'Random non-category complaint',
        description: 'Detailed description exceeding ten chars',
        category: 'Quantum Teleportation Unit',
        location: 'Physics Lab',
        department: 'Estate Maintenance & Civil Works',
        priority: 'Medium',
      };

      const result = createComplaintSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema and registerSchema', () => {
    it('should accept valid campus login credentials', () => {
      const creds = { email: 'student@campus.edu', password: 'Student@123456' };
      const result = loginSchema.safeParse(creds);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format in login', () => {
      const creds = { email: 'invalid-email', password: 'Password123' };
      const result = loginSchema.safeParse(creds);
      expect(result.success).toBe(false);
    });

    it('should enforce password match on registration', () => {
      const mismatched = {
        name: 'Jane Doe',
        student_id: 'STU-2026-99',
        email: 'jane@campus.edu',
        department: 'Computer Science and Engineering',
        password: 'Password123!',
        confirm_password: 'DifferentPassword456!',
      };

      const result = registerSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Passwords do not match');
      }
    });
  });

  describe('Workflow Status State Machine (isValidTransition)', () => {
    it('should allow sequential advancement: Submitted -> Under Review', () => {
      expect(isValidTransition('Submitted', 'Under Review')).toBe(true);
    });

    it('should allow direct assignment: Submitted -> Assigned', () => {
      expect(isValidTransition('Submitted', 'Assigned')).toBe(true);
    });

    it('should allow progression from Assigned -> In Progress', () => {
      expect(isValidTransition('Assigned', 'In Progress')).toBe(true);
    });

    it('should allow resolution from In Progress -> Resolved', () => {
      expect(isValidTransition('In Progress', 'Resolved')).toBe(true);
    });

    it('should allow closure from Resolved -> Closed', () => {
      expect(isValidTransition('Resolved', 'Closed')).toBe(true);
    });

    it('should allow reopening from Resolved -> Reopened', () => {
      expect(isValidTransition('Resolved', 'Reopened')).toBe(true);
    });

    it('should reject illicit transition: Submitted -> Resolved directly', () => {
      expect(isValidTransition('Submitted', 'Resolved')).toBe(false);
    });

    it('should reject backward transition: Closed -> Submitted', () => {
      expect(isValidTransition('Closed', 'Submitted')).toBe(false);
    });
  });
});


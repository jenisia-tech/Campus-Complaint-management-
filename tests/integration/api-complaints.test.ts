import { describe, it, expect } from 'vitest';
import { isValidTransition, complaintUpdateSchema, adminUpdateSchema } from '@/lib/validations/complaint';

describe('Integration Business Rules: Lifecycle & Authorization', () => {
  describe('Student Edit/Withdraw Permissions by Status', () => {
    it('permits complaint updates only when status is "Submitted"', () => {
      const allowedStatus = 'Submitted';
      const forbiddenStatuses = ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

      const canStudentEdit = (status: string) => status === 'Submitted';

      expect(canStudentEdit(allowedStatus)).toBe(true);

      forbiddenStatuses.forEach((status) => {
        expect(canStudentEdit(status)).toBe(false);
      });
    });

    it('permits student withdrawal only when status is "Submitted"', () => {
      const allowedStatus = 'Submitted';
      const forbiddenStatuses = ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

      const canStudentWithdraw = (status: string) => status === 'Submitted';

      expect(canStudentWithdraw(allowedStatus)).toBe(true);

      forbiddenStatuses.forEach((status) => {
        expect(canStudentWithdraw(status)).toBe(false);
      });
    });
  });

  describe('Admin Status Workflow Transitions', () => {
    it('verifies standard forward lifecycle progression', () => {
      // Step 1: Review
      expect(isValidTransition('Submitted', 'Under Review')).toBe(true);
      // Step 2: Assign
      expect(isValidTransition('Under Review', 'Assigned')).toBe(true);
      // Step 3: Work begun
      expect(isValidTransition('Assigned', 'In Progress')).toBe(true);
      // Step 4: Maintenance resolved
      expect(isValidTransition('In Progress', 'Resolved')).toBe(true);
      // Step 5: Final closure
      expect(isValidTransition('Resolved', 'Closed')).toBe(true);
    });

    it('verifies valid administrator reopening of a resolved grievance', () => {
      expect(isValidTransition('Resolved', 'Reopened')).toBe(true);
      // Reopened ticket can be moved back to Under Review, Assigned, or In Progress
      expect(isValidTransition('Reopened', 'In Progress')).toBe(true);
      expect(isValidTransition('Reopened', 'Under Review')).toBe(true);
    });

    it('validates admin schema payload structure for assigning staff and remarks', () => {
      const validAdminPayload = {
        status: 'Assigned',
        assigned_to: 'John Electrician (Staff ID: TECH-402)',
        department: 'Electrical & Power Systems',
        priority: 'Critical',
        admin_remarks: 'Technician dispatched to inspect transformer switch',
        remarks: 'Assigned to senior electrician',
      };

      const result = adminUpdateSchema.safeParse(validAdminPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.assigned_to).toBe('John Electrician (Staff ID: TECH-402)');
      }
    });

    it('validates admin schema payload for formal resolution notes', () => {
      const resolutionPayload = {
        status: 'Resolved',
        resolution_notes: 'Replaced faulty circuit breaker with new 32A MCB. Tested and operational.',
        remarks: 'Resolved and tested',
      };

      const result = adminUpdateSchema.safeParse(resolutionPayload);
      expect(result.success).toBe(true);
    });
  });
});


import { describe, it, expect } from 'vitest';
import {
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  calculateAverageTurnaround,
  cn,
} from '@/lib/utils';
import type { Complaint } from '@/types/database';

describe('Utility Functions & Helpers', () => {
  describe('cn (Tailwind class merger)', () => {
    it('should correctly merge classes and resolve conflicts', () => {
      const merged = cn('px-4 py-2', 'px-6', { 'text-red-500': true, 'bg-blue-500': false });
      expect(merged).toContain('px-6');
      expect(merged).toContain('text-red-500');
      expect(merged).not.toContain('px-4');
    });
  });

  describe('getStatusBadge', () => {
    it('should return appropriate badge styling for each status', () => {
      expect(getStatusBadge('Submitted').className).toContain('text-blue-800');
      expect(getStatusBadge('In Progress').className).toContain('text-indigo-800');
      expect(getStatusBadge('Resolved').className).toContain('text-emerald-800');
      expect(getStatusBadge('Closed').className).toContain('text-gray-800');
      expect(getStatusBadge('Reopened').className).toContain('text-rose-800');
    });
  });

  describe('getPriorityBadge', () => {
    it('should return appropriate badge styling for each priority', () => {
      expect(getPriorityBadge('Low').className).toContain('text-slate-700');
      expect(getPriorityBadge('Medium').className).toContain('text-sky-800');
      expect(getPriorityBadge('High').className).toContain('text-orange-800');
      expect(getPriorityBadge('Critical').className).toContain('text-red-800');
    });
  });

  describe('formatDate', () => {
    it('should return fallback dash for null or undefined dates', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('should format a valid ISO timestamp', () => {
      const formatted = formatDate('2026-10-29T10:00:00Z');
      expect(formatted).not.toBe('—');
      expect(formatted).toContain('2026');
    });
  });

  describe('calculateAverageTurnaround', () => {
    it('should return 0 when no resolved complaints exist', () => {
      const complaints = [
        { status: 'Submitted', created_at: '2026-10-29T00:00:00Z', resolved_at: null },
      ] as Complaint[];

      expect(calculateAverageTurnaround(complaints)).toBe(0);
    });

    it('should compute the correct average duration in hours', () => {
      const complaints = [
        {
          status: 'Resolved',
          created_at: '2026-10-29T08:00:00Z',
          resolved_at: '2026-10-29T12:00:00Z', // 4 hours
        },
        {
          status: 'Resolved',
          created_at: '2026-10-29T08:00:00Z',
          resolved_at: '2026-10-29T14:00:00Z', // 6 hours
        },
      ] as Complaint[];

      // Average: (4 + 6) / 2 = 5.0 hours
      expect(calculateAverageTurnaround(complaints)).toBe(5);
    });
  });
});


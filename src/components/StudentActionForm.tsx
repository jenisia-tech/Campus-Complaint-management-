'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Complaint } from '@/types/database';
import { Button } from './ui/Button';
import { Pencil, XCircle, AlertTriangle } from 'lucide-react';

interface StudentActionFormProps {
  complaint: Complaint;
}

export function StudentActionForm({ complaint }: StudentActionFormProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEligible = complaint.status === 'Submitted';

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/complaints/${complaint.complaint_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to withdraw complaint.');
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error withdrawing complaint.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEligible) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Modification Restricted</p>
        <p className="mt-0.5">
          This complaint is currently in <strong>{complaint.status}</strong> status. Editing and withdrawal are restricted to grievances in the initial <strong>Submitted</strong> state.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/complaints/${complaint.complaint_id}/edit`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5 text-primary-600" />
            Edit Complaint
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          Withdraw Complaint
        </Button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Withdraw Complaint</h3>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to withdraw complaint <strong>{complaint.complaint_id}</strong>? Its status will be marked as <strong>Closed</strong>.
            </p>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for withdrawal (Optional):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Problem resolved on its own..."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" isLoading={isLoading}>
                  Confirm Withdrawal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createComplaintSchema } from '@/lib/validations/complaint';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send, AlertCircle, Sparkles, Home, Building2, FileEdit } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, ComplaintType } from '@/types/database';

const HOSTEL_CATEGORIES: ComplaintCategory[] = [
  'Hostel facilities',
  'Plumbing and water supply',
  'Electricity and lighting',
  'Cleanliness and housekeeping',
  'Wi-Fi and internet',
  'Water and sanitation',
  'Other',
];

const COLLEGE_CATEGORIES: ComplaintCategory[] = [
  'Classroom and infrastructure',
  'Laboratory equipment',
  'Wi-Fi and internet',
  'Electricity and lighting',
  'Water and sanitation',
  'Library facilities',
  'Transportation',
  'Food and canteen',
  'Other',
];

const DEPARTMENTS = [
  'Estate Maintenance & Civil Works',
  'Electrical & Power Systems',
  'Campus IT & Wi-Fi Network',
  'Laboratory & Workshop Management',
  'Hostel Administration & Housing',
  'Water Supply & Sanitation Facility',
  'Central Library Services',
  'Campus Transport & Logistics',
  'Canteen & Food Quality Control',
  'General Administration',
];

const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function NewComplaintPage() {
  const router = useRouter();

  const [complaintType, setComplaintType] = useState<ComplaintType>('Hostel');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complaint_type: 'Hostel' as ComplaintType,
    category: 'Hostel facilities' as ComplaintCategory,
    location: '',
    hostel_block: '',
    floor: '',
    room_number: '',
    building: '',
    facility: '',
    department: 'Hostel Administration & Housing',
    priority: 'Medium' as ComplaintPriority,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTypeSwitch = (type: ComplaintType) => {
    setComplaintType(type);
    setFormData((prev) => ({
      ...prev,
      complaint_type: type,
      category: type === 'Hostel' ? 'Hostel facilities' : 'Classroom and infrastructure',
      department: type === 'Hostel' ? 'Hostel Administration & Housing' : 'Estate Maintenance & Civil Works',
      location: '',
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Compute location if empty from subfields
    let finalLocation = formData.location.trim();
    if (!finalLocation) {
      if (complaintType === 'Hostel') {
        const parts = [formData.hostel_block, formData.floor, formData.room_number].filter(Boolean);
        finalLocation = parts.join(', ');
      } else {
        const parts = [formData.building, formData.facility].filter(Boolean);
        finalLocation = parts.join(' - ');
      }
    }

    if (!finalLocation) {
      setErrorMessage('Please specify the location or fill the hostel/building fields.');
      return;
    }

    const submissionPayload = {
      ...formData,
      location: finalLocation,
    };

    const validation = createComplaintSchema.safeParse(submissionPayload);
    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please verify form fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit complaint');
      }

      router.push(`/complaints/${result.complaint.id}`);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'An error occurred while submitting.');
      setLoading(false);
    }
  };

  const fillSample = () => {
    if (complaintType === 'Hostel') {
      setFormData({
        title: 'Geyser switchboard sparking and hot water tap leaking in Room 304',
        description:
          'In Ganga Hostel Block B, Room 304 second floor bathroom, the switch for geyser unit 2 produces visible sparks when turned on. The inlet tap is also leaking water continuously, creating slippery flooring.',
        complaint_type: 'Hostel',
        category: 'Electricity and lighting',
        location: 'Ganga Hostel Block B, 2nd Floor Bathroom & Room 304',
        hostel_block: 'Ganga Hostel Block B',
        floor: '2nd Floor',
        room_number: 'Room 304',
        building: '',
        facility: '',
        department: 'Hostel Administration & Housing',
        priority: 'Critical',
      });
    } else {
      setFormData({
        title: 'Overhead projector ceiling mount vibrating and Wi-Fi dropping in Lab 302',
        description:
          'The ceiling bracket for the projector in Computer Lab 302 is loose and shakes during practicals. Additionally, students lose connection to the CampusNet-Lab router every 15 minutes during lab classes.',
        complaint_type: 'College',
        category: 'Laboratory equipment',
        location: 'Science Block B, Room 302 (Lab)',
        hostel_block: '',
        floor: '',
        room_number: '',
        building: 'Science Block B',
        facility: 'Computer Lab 302',
        department: 'Campus IT & Wi-Fi Network',
        priority: 'High',
      });
    }
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={fillSample}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fill Sample {complaintType} Issue
        </button>
      </div>

      <Card className="border-notepad-border dark:border-notepad-darkBorder bg-white dark:bg-notepad-darkCard shadow-xs relative overflow-hidden">
        {/* Top Notepad Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-teal-600 to-teal-400" />

        <CardHeader className="pt-6 border-b border-notepad-border dark:border-notepad-darkBorder">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <FileEdit className="w-5 h-5" />
            </span>
            <CardTitle className="text-xl font-bold text-navy-900 dark:text-slate-100">
              Lodge Campus Grievance Entry
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Select the issue type below. Your entry will be recorded in the persistent ledger with a unique ticket reference.
          </CardDescription>

          {/* Type Selector Tabs (Hostel vs College) */}
          <div className="mt-4 pt-3 border-t border-notepad-border dark:border-notepad-darkBorder">
            <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 font-mono">
              Choose Grievance Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeSwitch('Hostel')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  complaintType === 'Hostel'
                    ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 dark:border-teal-600 ring-2 ring-teal-400/30'
                    : 'bg-slate-50/60 dark:bg-campus-darkSurface/40 border-notepad-border dark:border-notepad-darkBorder hover:bg-slate-100 dark:hover:bg-campus-darkSurface'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    complaintType === 'Hostel'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Hostel Complaint</span>
                    {complaintType === 'Hostel' && (
                      <span className="text-[10px] bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-1.5 py-0.2 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hostel rooms, mess food, washrooms &amp; heaters
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSwitch('College')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  complaintType === 'College'
                    ? 'bg-navy-50/70 dark:bg-campus-darkSurface border-navy-400 dark:border-navy-600 ring-2 ring-navy-400/30'
                    : 'bg-slate-50/60 dark:bg-campus-darkSurface/40 border-notepad-border dark:border-notepad-darkBorder hover:bg-slate-100 dark:hover:bg-campus-darkSurface'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    complaintType === 'College'
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>College Complaint</span>
                    {complaintType === 'College' && (
                      <span className="text-[10px] bg-navy-200 dark:bg-navy-800 text-navy-900 dark:text-teal-200 px-1.5 py-0.2 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Classrooms, labs, library &amp; transport
                  </div>
                </div>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-[#FDA4AF] text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Grievance Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={
                  complaintType === 'Hostel'
                    ? 'e.g., Geyser not heating and tap loose in Hostel 3 bathroom'
                    : 'e.g., Overhead projector vibrating and Wi-Fi dropping in Lab 302'
                }
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                >
                  {(complaintType === 'Hostel' ? HOSTEL_CATEGORIES : COLLEGE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Specific Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={
                    complaintType === 'Hostel'
                      ? 'e.g., Ganga Block B, Room 204'
                      : 'e.g., Science Block B, Room 302'
                  }
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Conditional Fields based on Complaint Type */}
            {complaintType === 'Hostel' ? (
              <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 rounded-xl space-y-3">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                  Hostel Residence Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hostel Block
                    </label>
                    <input
                      type="text"
                      name="hostel_block"
                      value={formData.hostel_block}
                      onChange={handleChange}
                      placeholder="e.g. Block B / Hostel 3"
                      className="w-full px-3 py-2 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-xs text-navy-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      placeholder="e.g. 2nd Floor"
                      className="w-full px-3 py-2 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-xs text-navy-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Room Number
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      placeholder="e.g. Room 304"
                      className="w-full px-3 py-2 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-xs text-navy-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-navy-50/60 dark:bg-navy-950/20 border border-navy-200/80 dark:border-navy-900/40 rounded-xl space-y-3">
                <div className="text-xs font-bold text-navy-900 dark:text-teal-200 uppercase tracking-wider">
                  Academic Building &amp; Facility Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Building / Block
                    </label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      placeholder="e.g. Science Block B / Library Building"
                      className="w-full px-3 py-2 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-xs text-navy-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Facility / Lab / Room
                    </label>
                    <input
                      type="text"
                      name="facility"
                      value={formData.facility}
                      onChange={handleChange}
                      placeholder="e.g. Computer Lab 302 / Seminar Hall"
                      className="w-full px-3 py-2 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-xs text-navy-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Responsible Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Urgency / Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what is wrong, when it started, and any safety hazards or practical disruption..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-campus-darkSurface border border-notepad-border dark:border-notepad-darkBorder rounded-lg text-sm text-navy-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold py-3 shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Entry...' : `Record ${complaintType} Grievance`}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

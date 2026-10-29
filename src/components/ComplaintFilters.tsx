'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from './ui/Button';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES, CAMPUS_DEPARTMENTS } from '@/lib/validations/complaint';

interface ComplaintFiltersProps {
  basePath?: string;
  showDepartment?: boolean;
  showDepartmentFilter?: boolean;
}

export function ComplaintFilters({
  basePath,
  showDepartment = false,
  showDepartmentFilter,
}: ComplaintFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePath = basePath || pathname;
  const isDeptVisible = showDepartmentFilter !== undefined ? showDepartmentFilter : showDepartment;

  const search = searchParams.get('q') || searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const priority = searchParams.get('priority') || '';
  const department = searchParams.get('department') || '';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${activePath}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    handleFilterChange('q', query);
  };

  const clearFilters = () => {
    router.push(activePath);
  };

  const hasActiveFilters = Boolean(search || status || category || priority || department);

  return (
    <div className="bg-white dark:bg-notepad-darkCard p-4 rounded-xl border border-notepad-border dark:border-notepad-darkBorder shadow-xs mb-6 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-1">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search keywords, ID..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Status */}
        <div>
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-navy-900 dark:text-slate-100 transition-colors"
          >
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-navy-900 dark:text-slate-100 transition-colors"
          >
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-navy-900 dark:text-slate-100 transition-colors"
          >
            <option value="">All Priorities</option>
            {COMPLAINT_PRIORITIES.map((prio) => (
              <option key={prio} value={prio}>
                {prio}
              </option>
            ))}
          </select>
        </div>

        {/* Department (If admin) */}
        {isDeptVisible ? (
          <div>
            <select
              value={department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full py-2 px-3 text-sm border border-notepad-border dark:border-notepad-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-campus-darkSurface text-navy-900 dark:text-slate-100 transition-colors"
            >
              <option value="">All Departments</option>
              {CAMPUS_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        ) : (
          hasActiveFilters && (
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
                <X className="w-3.5 h-3.5" /> Clear Filters
              </Button>
            </div>
          )
        )}
      </div>

      {isDeptVisible && hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-notepad-border dark:border-notepad-darkBorder flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300">
            <X className="w-3.5 h-3.5" /> Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

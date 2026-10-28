import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <div>
          &copy; {new Date().getFullYear()} CampusCare. All rights reserved.
        </div>
        <div className="text-gray-400">
          Campus Facility &amp; Infrastructure Portal
        </div>
      </div>
    </footer>
  );
}

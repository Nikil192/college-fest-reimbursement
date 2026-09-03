'use client';

import { Printer } from 'lucide-react';

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex min-h-11 items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow"
    >
      <Printer className="w-4 h-4" /> Print / Save as PDF
    </button>
  );
}

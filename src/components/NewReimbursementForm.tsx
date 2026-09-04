'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Save } from 'lucide-react';
import { submitReimbursement, type ReimbursementFormState } from '@/actions/reimbursements';

const initialState: ReimbursementFormState = {};

type Props = {
  festivals: Array<{ id: string; name: string }>;
  defaultExpenseDate: string;
};

const inputClassName = 'min-h-11 w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function NewReimbursementForm({ festivals, defaultExpenseDate }: Props) {
  const [state, formAction, isPending] = useActionState(submitReimbursement, initialState);

  return (
    <form action={formAction} className="p-4 sm:p-6 space-y-8" aria-busy={isPending}>
      <section>
        <h2 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="festivalId" className="block text-sm font-medium mb-1">Festival</label>
            <select id="festivalId" name="festivalId" required disabled={isPending} className={inputClassName}>
              <option value="">Select a festival...</option>
              {festivals.map((festival) => (
                <option key={festival.id} value={festival.id}>{festival.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Expense Category</label>
            <select id="category" name="category" required disabled={isPending} className={inputClassName}>
              <option value="">Select category...</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Decorations">Decorations</option>
              <option value="Sound & Venue">Sound & Venue</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <input id="description" name="description" type="text" required disabled={isPending} placeholder="e.g. Traditional flowers for stage decoration" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (₹)</label>
            <input id="amount" name="amount" type="number" required disabled={isPending} step="0.01" min="0.01" placeholder="0.00" className={inputClassName} />
          </div>
          <div>
            <label htmlFor="expenseDate" className="block text-sm font-medium mb-1">Expense Date</label>
            <input id="expenseDate" name="expenseDate" type="date" defaultValue={defaultExpenseDate} required disabled={isPending} className={inputClassName} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Payee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="payeeName" className="block text-sm font-medium mb-1">Payee Name</label>
            <input id="payeeName" name="payeeName" type="text" required disabled={isPending} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium mb-1">Student / Staff ID</label>
            <input id="studentId" name="studentId" type="text" disabled={isPending} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number (For WhatsApp)</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required disabled={isPending} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium mb-1">UPI ID</label>
            <input id="upiId" name="upiId" type="text" disabled={isPending} placeholder="e.g. name@bank" className={inputClassName} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Documents (Bill / Invoice)</h2>
        <div className="border border-[var(--card-border)] rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
          <label htmlFor="file" className="block text-sm font-medium mb-2">Upload File <span className="font-normal text-gray-500">(Optional)</span></label>
          <input
            id="file"
            type="file"
            name="file"
            disabled={isPending}
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="block min-h-11 w-full min-w-0 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
          />
          <p className="mt-2 text-xs text-gray-500">PDF, JPEG, PNG, or WebP. Maximum 10 MB. You can also attach an invoice after creating the reimbursement.</p>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border-t border-[var(--card-border)] flex flex-col-reverse sm:flex-row sm:justify-end gap-3 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
        <Link href="/reimbursements" aria-disabled={isPending} className={`flex min-h-11 items-center justify-center px-5 py-2 border border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isPending ? 'pointer-events-none opacity-60' : ''}`}>
          Cancel
        </Link>
        <button type="submit" disabled={isPending} className="flex min-h-11 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white px-5 py-2 rounded-lg font-medium transition-colors">
          {isPending ? <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
          {isPending ? 'Submitting reimbursement...' : 'Submit Reimbursement'}
        </button>
      </div>
    </form>
  );
}

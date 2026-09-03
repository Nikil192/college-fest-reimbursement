import { ArrowLeft, CalendarDays, IndianRupee, Save } from 'lucide-react';
import Link from 'next/link';
import { createFestival } from '@/actions/festivals';

const inputClass = 'min-h-11 w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900';

export default function NewFestivalPage() {
  return (
    <div className="page-container mx-auto max-w-5xl">
      <div className="mb-7 flex items-center gap-4">
        <Link
          href="/festivals"
          aria-label="Back to festivals"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Festival ledger</p>
          <h1 className="text-2xl font-bold">Create Festival</h1>
          <p className="mt-1 text-gray-500">Set the event identity, operating dates, and approved budget.</p>
        </div>
      </div>

      <form action={createFestival} className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
        <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-7">
            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold">Festival Details</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium md:col-span-2">
                  Festival Name
                  <input name="name" required autoFocus className={`${inputClass} mt-1.5`} placeholder="e.g. Onam 2027" />
                </label>
                <label className="text-sm font-medium md:col-span-2">
                  Organizing Group
                  <input name="organization" required className={`${inputClass} mt-1.5`} placeholder="Student association or department" />
                </label>
                <label className="text-sm font-medium">
                  Academic Year
                  <input name="academicYear" required className={`${inputClass} mt-1.5`} placeholder="2027-28" pattern="[0-9]{4}-[0-9]{2}" />
                </label>
                <label className="text-sm font-medium">
                  Status
                  <select name="status" defaultValue="PLANNED" className={`${inputClass} mt-1.5`}>
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Festival Date
                  <input type="date" name="festivalDate" className={`${inputClass} mt-1.5`} />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Start Date
                    <input type="date" name="startDate" className={`${inputClass} mt-1.5`} />
                  </label>
                  <label className="text-sm font-medium">
                    End Date
                    <input type="date" name="endDate" className={`${inputClass} mt-1.5`} />
                  </label>
                </div>
                <label className="text-sm font-medium md:col-span-2">
                  Description
                  <textarea name="description" rows={4} className={`${inputClass} mt-1.5 resize-y`} placeholder="Purpose, scope, or notes for the finance team" />
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-7">
            <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-950/20">
              <div className="mb-4 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold">Budget</h2>
              </div>
              <label className="text-sm font-medium">
                Allocated Budget (INR)
                <input type="number" name="allocatedBudget" required min="0" step="0.01" className={`${inputClass} mt-1.5`} placeholder="0.00" />
              </label>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">This amount contributes directly to the dashboard&apos;s total budget.</p>
            </section>

            <section>
              <h2 className="mb-4 border-b border-[var(--card-border)] pb-3 font-semibold">Coordinator</h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Name
                  <input name="coordinatorName" className={`${inputClass} mt-1.5`} />
                </label>
                <label className="block text-sm font-medium">
                  Phone
                  <input type="tel" name="coordinatorPhone" className={`${inputClass} mt-1.5`} />
                </label>
                <label className="block text-sm font-medium">
                  Email
                  <input type="email" name="coordinatorEmail" className={`${inputClass} mt-1.5`} />
                </label>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--card-border)] bg-gray-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 dark:bg-gray-800/40">
          <Link href="/festivals" className="flex min-h-11 items-center justify-center rounded-lg border border-[var(--card-border)] px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancel
          </Link>
          <button type="submit" className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Create Festival
          </button>
        </div>
      </form>
    </div>
  );
}

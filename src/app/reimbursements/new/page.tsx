import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { submitReimbursement } from "@/actions/reimbursements";
import { getIndiaDateInputValue } from "@/lib/dates";

export const dynamic = 'force-dynamic';

export default async function NewReimbursementPage() {
  const festivals = await prisma.festival.findMany({
    where: { status: { in: ['PLANNED', 'ACTIVE'] } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/reimbursements" className="mr-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Reimbursement</h1>
          <p className="text-gray-500">Create a new reimbursement request.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <form action={submitReimbursement} className="p-6 space-y-8">
          
          {/* Section: Basic Information */}
          <section>
            <h3 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Festival</label>
                <select name="festivalId" required className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a festival...</option>
                  {festivals.map(fest => (
                    <option key={fest.id} value={fest.id}>{fest.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expense Category</label>
                <select name="category" required className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category...</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Decorations">Decorations</option>
                  <option value="Sound & Venue">Sound & Venue</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text" 
                  name="description"
                  required
                  placeholder="e.g. Traditional flowers for stage decoration"
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount"
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expense Date</label>
                <input 
                  type="date" 
                  name="expenseDate"
                  defaultValue={getIndiaDateInputValue()}
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Section: Payee Information */}
          <section>
            <h3 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Payee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium mb-1">Payee Name</label>
                <input 
                  type="text" 
                  name="payeeName"
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Student / Staff ID</label>
                <input 
                  type="text" 
                  name="studentId"
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (For WhatsApp)</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">UPI ID</label>
                <input 
                  type="text" 
                  name="upiId"
                  placeholder="e.g. name@bank"
                  className="w-full border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Section: Documents */}
          <section>
            <h3 className="text-lg font-medium border-b border-[var(--card-border)] pb-2 mb-4">Documents (Bill / Invoice)</h3>
            <div className="border border-[var(--card-border)] rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
              <label className="block text-sm font-medium mb-2">Upload File</label>
              <input type="file" name="file" required accept="application/pdf,image/jpeg,image/png,image/webp" className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" 
              />
              <p className="mt-2 text-xs text-gray-500">PDF, JPEG, PNG, or WebP. Maximum 10 MB.</p>
            </div>
          </section>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-[var(--card-border)] flex justify-end gap-3 -mx-6 -mb-6">
            <Link href="/reimbursements" className="px-5 py-2 border border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </Link>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" />
              Submit Reimbursement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

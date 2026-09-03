import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ReimbursementsPage() {
  const reimbursements = await prisma.reimbursement.findMany({
    include: {
      payee: true,
      festival: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Reimbursements</h1>
          <p className="text-gray-500">Track and manage all reimbursement requests.</p>
        </div>
        <Link href="/reimbursements/new" className="touch-target flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Reimbursement
        </Link>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-[var(--card-border)] flex flex-wrap gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800/30 rounded-t-xl">
          <div className="relative w-full flex-1 max-w-md">
            <Search aria-hidden="true" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <label htmlFor="reimbursement-search" className="sr-only">Search reimbursements</label>
            <input 
              id="reimbursement-search"
              name="reimbursementSearch"
              type="text" 
              placeholder="Search ID, Payee, Festival..." 
              className="touch-target w-full pl-10 pr-4 py-2 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button type="button" className="touch-target flex items-center justify-center gap-2 border border-[var(--card-border)] bg-white dark:bg-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <span>Filters</span>
            </button>
            <select name="status" aria-label="Filter by reimbursement status" className="touch-target min-w-0 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Status: All</option>
              <option>Under Verification</option>
              <option>Approved</option>
              <option>Payment Pending</option>
              <option>Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="responsive-table w-full text-sm text-left">
            <caption className="sr-only">All reimbursement requests</caption>
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Festival</th>
                <th scope="col" className="px-6 py-3">Payee</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Submitted</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reimbursements.map(r => (
                <tr key={r.id} className="border-b border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td data-label="ID" className="px-6 py-4 font-medium text-blue-600 hover:underline">
                    <Link className="inline-flex min-h-11 items-center" href={`/reimbursements/${r.reimbursementNumber}`}>{r.reimbursementNumber}</Link>
                  </td>
                  <td data-label="Festival" className="px-6 py-4">{r.festival?.name}</td>
                  <td data-label="Payee" className="px-6 py-4">{r.payee?.name}</td>
                  <td data-label="Amount" className="px-6 py-4 font-medium">₹{r.requestedAmount.toLocaleString()}</td>
                  <td data-label="Submitted" className="px-6 py-4 text-gray-500">{r.submittedDate.toLocaleDateString()}</td>
                  <td data-label="Status" className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${r.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${r.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                        ${r.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${['SUBMITTED', 'UNDER_VERIFICATION'].includes(r.status) ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      `}>
                        {r.status.replace('_', ' ')}
                      </span>
                  </td>
                  <td data-label="Actions" className="px-6 py-4 text-right">
                      <Link href={`/reimbursements/${r.reimbursementNumber}`} className="inline-flex min-h-11 items-center text-blue-600 hover:underline font-medium">
                      {['SUBMITTED', 'UNDER_VERIFICATION'].includes(r.status) ? 'Verify' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
              {reimbursements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No reimbursements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Plus, Search, MoreVertical } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function FestivalsPage() {
  const festivals = await prisma.festival.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reimbursements: true
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Festivals</h1>
          <p className="text-gray-500">Manage all college festivals and their budgets.</p>
        </div>
        <Link href="/festivals/new" className="touch-target flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Festival
        </Link>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-[var(--card-border)] flex flex-wrap gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800/30 rounded-t-xl">
          <div className="relative w-full sm:w-auto">
            <Search aria-hidden="true" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <label htmlFor="festival-search" className="sr-only">Search festivals</label>
            <input 
              id="festival-search"
              name="festivalSearch"
              type="text" 
              placeholder="Search festivals..." 
              className="touch-target w-full pl-10 pr-4 py-2 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
            />
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto">
            <select id="academic-year-filter" name="academicYear" aria-label="Filter by academic year" className="touch-target min-w-0 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Years</option>
              <option>2026-27</option>
              <option>2025-26</option>
            </select>
            <select id="festival-status-filter" name="status" aria-label="Filter by festival status" className="touch-target min-w-0 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Status: All</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="responsive-table w-full text-sm text-left">
            <caption className="sr-only">Festival budgets and status</caption>
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Festival</th>
                <th scope="col" className="px-6 py-3">Group</th>
                <th scope="col" className="px-6 py-3">Budget</th>
                <th scope="col" className="px-6 py-3">Spent</th>
                <th scope="col" className="px-6 py-3">Remaining</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {festivals.map(festival => {
                const spent = festival.reimbursements.filter(r => r.status === 'PAID').reduce((sum, r) => sum + (r.paidAmount || 0), 0);
                const remaining = festival.allocatedBudget - spent;
                
                return (
                  <tr key={festival.id} className="border-b border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td data-label="Festival" className="px-6 py-4 font-medium">
                      {festival.name}
                    </td>
                    <td data-label="Group" className="px-6 py-4">{festival.organization}</td>
                    <td data-label="Budget" className="px-6 py-4">₹{festival.allocatedBudget.toLocaleString()}</td>
                    <td data-label="Spent" className="px-6 py-4">₹{spent.toLocaleString()}</td>
                    <td data-label="Remaining" className="px-6 py-4 font-medium text-green-600">₹{remaining.toLocaleString()}</td>
                    <td data-label="Status" className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {festival.status}
                      </span>
                    </td>
                    <td data-label="Actions" className="px-6 py-4 text-right">
                      <button type="button" aria-label={`Actions for ${festival.name}`} className="inline-flex h-11 w-11 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {festivals.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No festivals found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

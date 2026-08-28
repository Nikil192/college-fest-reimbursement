import { Plus, Search, MoreVertical } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function FestivalsPage() {
  const festivals = await prisma.festival.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reimbursements: true
    }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Festivals</h1>
          <p className="text-gray-500">Manage all college festivals and their budgets.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Festival
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-[var(--card-border)] flex flex-wrap gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800/30 rounded-t-xl">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search festivals..." 
              className="pl-10 pr-4 py-2 border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Years</option>
              <option>2026-27</option>
              <option>2025-26</option>
            </select>
            <select className="border border-[var(--card-border)] rounded-lg bg-white dark:bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Status: All</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Festival</th>
                <th className="px-6 py-3">Group</th>
                <th className="px-6 py-3">Budget</th>
                <th className="px-6 py-3">Spent</th>
                <th className="px-6 py-3">Remaining</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {festivals.map(festival => {
                const spent = festival.reimbursements.filter(r => r.status === 'PAID').reduce((sum, r) => sum + (r.paidAmount || 0), 0);
                const remaining = festival.allocatedBudget - spent;
                
                return (
                  <tr key={festival.id} className="border-b border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline">
                      <Link href={`/festivals/${festival.id}`}>{festival.name}</Link>
                    </td>
                    <td className="px-6 py-4">{festival.organization}</td>
                    <td className="px-6 py-4">₹{festival.allocatedBudget.toLocaleString()}</td>
                    <td className="px-6 py-4">₹{spent.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-green-600">₹{remaining.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {festival.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

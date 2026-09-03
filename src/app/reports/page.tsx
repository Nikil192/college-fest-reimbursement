import prisma from "@/lib/prisma";
import { Download, BarChart3, PieChart } from "lucide-react";

export default async function ReportsPage() {
  const festivals = await prisma.festival.findMany({
    include: { reimbursements: true }
  });

  const allReimbursements = await prisma.reimbursement.findMany({
    include: { festival: true, payee: true }
  });

  const totalSpent = allReimbursements
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

  const categoryTotals: Record<string, number> = {};
  allReimbursements.forEach(r => {
    if (r.status === 'PAID' && r.paidAmount) {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.paidAmount;
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports & Export</h1>
          <p className="text-gray-500">Analyze festival expenditures, budget utilization, and download audit reports.</p>
        </div>
        
        <a 
          href="/api/export/csv" 
          download
          className="flex min-h-11 items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export All Data (CSV)
        </a>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Festival Budget Breakdown */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Budget Utilization by Festival
          </h2>
          <div className="space-y-4">
            {festivals.map(fest => {
              const spent = fest.reimbursements
                .filter(r => r.status === 'PAID')
                .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
              const percentage = Math.min(100, Math.round((spent / fest.allocatedBudget) * 100));

              return (
                <div key={fest.id}>
                  <div className="flex flex-col gap-1 text-sm mb-1 sm:flex-row sm:justify-between">
                    <span className="break-words font-medium">{fest.name}</span>
                    <span className="text-gray-500 sm:text-right">₹{spent.toLocaleString()} / ₹{fest.allocatedBudget.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${percentage > 85 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-label={`${fest.name} budget utilization`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percentage}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" /> Spending by Category
          </h2>
          <div className="space-y-3">
            {Object.keys(categoryTotals).length > 0 ? (
              Object.entries(categoryTotals).map(([cat, amount]) => {
                const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                return (
                  <div key={cat} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{cat}</p>
                      <p className="text-xs text-gray-500">{percentage}% of total disbursements</p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100">₹{amount.toLocaleString()}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 py-4">No completed disbursements recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

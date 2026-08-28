import prisma from "@/lib/prisma";
import { Download, BarChart3, PieChart, TrendingUp } from "lucide-react";

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports & Export</h1>
          <p className="text-gray-500">Analyze festival expenditures, budget utilization, and download audit reports.</p>
        </div>
        
        <a 
          href="/api/export/csv" 
          download
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export All Data (CSV)
        </a>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Festival Budget Breakdown */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Budget Utilization by Festival
          </h3>
          <div className="space-y-4">
            {festivals.map(fest => {
              const spent = fest.reimbursements
                .filter(r => r.status === 'PAID')
                .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
              const percentage = Math.min(100, Math.round((spent / fest.allocatedBudget) * 100));

              return (
                <div key={fest.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{fest.name}</span>
                    <span className="text-gray-500">₹{spent.toLocaleString()} / ₹{fest.allocatedBudget.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${percentage > 85 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" /> Spending by Category
          </h3>
          <div className="space-y-3">
            {Object.keys(categoryTotals).length > 0 ? (
              Object.entries(categoryTotals).map(([cat, amount]) => {
                const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                return (
                  <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
                    <div>
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

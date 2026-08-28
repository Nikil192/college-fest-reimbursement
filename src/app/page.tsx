import { PartyPopper, Receipt, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Dashboard() {
  // Fetch real data from Prisma
  const festivals = await prisma.festival.findMany();
  
  const totalBudget = festivals.reduce((sum, fest) => sum + fest.allocatedBudget, 0);

  const reimbursements = await prisma.reimbursement.findMany({
    include: {
      payee: true,
      festival: true,
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  });

  // Calculate totals from database
  const allReimbs = await prisma.reimbursement.findMany();
  const totalApproved = allReimbs
    .filter(r => r.approvedAmount != null)
    .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

  const totalPaid = allReimbs
    .filter(r => r.status === 'PAID' && r.paidAmount != null)
    .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  
  const pendingPayment = allReimbs
    .filter(r => r.status === 'PAYMENT_PENDING' && r.approvedAmount != null)
    .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

  const pendingVerificationCount = allReimbs.filter(r => r.status === 'UNDER_VERIFICATION' || r.status === 'SUBMITTED').length;
  const approvedCount = allReimbs.filter(r => r.status === 'PAYMENT_PENDING' || r.status === 'APPROVED').length;
  
  const nearLimitFestivals = festivals.filter(f => {
    // mock calculation
    return false;
  }).length;

  // Format Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Financial status of all festivals for the 2026-27 academic year.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Budget</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalBudget)}</h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Approved</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalApproved)}</h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <PartyPopper className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Payment</p>
              <h3 className="text-2xl font-bold text-[var(--color-warning)]">{formatCurrency(pendingPayment)}</h3>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Needs Attention Panel */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm col-span-1">
          <div className="p-6 border-b border-[var(--card-border)]">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Needs Attention</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-xs">{pendingVerificationCount}</span>
                <span className="ml-3 text-sm">reimbursements awaiting verification</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs">{approvedCount}</span>
                <span className="ml-3 text-sm">approved reimbursements awaiting payment</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs">{nearLimitFestivals}</span>
                <span className="ml-3 text-sm">budgets nearing their limit</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm col-span-1 lg:col-span-2">
          <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Reimbursements</h3>
            <Link href="/reimbursements" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Payee</th>
                  <th className="px-6 py-3">Festival</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reimbursements.length > 0 ? reimbursements.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline">
                      <Link href={`/reimbursements/${r.reimbursementNumber}`}>{r.reimbursementNumber}</Link>
                    </td>
                    <td className="px-6 py-4">{r.payee?.name}</td>
                    <td className="px-6 py-4">{r.festival?.name}</td>
                    <td className="px-6 py-4">{formatCurrency(r.requestedAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${r.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${r.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                        ${r.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${['SUBMITTED', 'UNDER_VERIFICATION'].includes(r.status) ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      `}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No reimbursements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

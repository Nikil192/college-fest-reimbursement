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
  
  const nearLimitFestivals = festivals.filter((festival) => {
    const paidAmount = allReimbs
      .filter((reimbursement) => reimbursement.festivalId === festival.id && reimbursement.status === 'PAID')
      .reduce((sum, reimbursement) => sum + (reimbursement.paidAmount || 0), 0);

    return festival.allocatedBudget > 0 && paidAmount / festival.allocatedBudget >= 0.9;
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
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Financial status of all festivals for the 2026-27 academic year.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-sm min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Budget</p>
              <p className="text-2xl font-bold break-words">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-sm min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Approved</p>
              <p className="text-2xl font-bold break-words">{formatCurrency(totalApproved)}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <PartyPopper className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-sm min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold break-words">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-sm min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Payment</p>
              <p className="text-2xl font-bold text-[var(--color-warning)] break-words">{formatCurrency(pendingPayment)}</p>
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
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Needs Attention</h2>
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
          <div className="p-4 sm:p-6 border-b border-[var(--card-border)] flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg font-semibold">Recent Reimbursements</h2>
            <Link href="/reimbursements" className="inline-flex min-h-11 items-center text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="responsive-table w-full text-sm text-left">
              <caption className="sr-only">Five most recently updated reimbursements</caption>
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Payee</th>
                  <th scope="col" className="px-6 py-3">Festival</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reimbursements.length > 0 ? reimbursements.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--card-border)] hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td data-label="ID" className="px-6 py-4 font-medium text-blue-600 hover:underline">
                      <Link className="inline-flex min-h-11 items-center" href={`/reimbursements/${r.reimbursementNumber}`}>{r.reimbursementNumber}</Link>
                    </td>
                    <td data-label="Payee" className="px-6 py-4">{r.payee?.name}</td>
                    <td data-label="Festival" className="px-6 py-4">{r.festival?.name}</td>
                    <td data-label="Amount" className="px-6 py-4">{formatCurrency(r.requestedAmount)}</td>
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

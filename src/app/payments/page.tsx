import prisma from "@/lib/prisma";
import Link from "next/link";
import { CreditCard, FileText } from "lucide-react";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      reimbursement: {
        include: {
          payee: true,
          festival: true
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Payments Ledger</h1>
          <p className="text-gray-500">History of all disbursement transactions and receipts.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Payment Ref</th>
                <th className="px-6 py-3">Reimbursement ID</th>
                <th className="px-6 py-3">Payee</th>
                <th className="px-6 py-3">Festival</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Transaction / UTR</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment Date</th>
                <th className="px-6 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 font-mono font-medium text-xs">{p.paymentNumber}</td>
                  <td className="px-6 py-4 font-medium text-blue-600 hover:underline">
                    <Link href={`/reimbursements/${p.reimbursement.reimbursementNumber}`}>
                      {p.reimbursement.reimbursementNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{p.reimbursement.payee.name}</td>
                  <td className="px-6 py-4">{p.reimbursement.festival.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{p.transactionId}</td>
                  <td className="px-6 py-4 font-bold text-green-600">₹{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/reimbursements/${p.reimbursement.reimbursementNumber}/receipt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs font-medium inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Receipt
                    </a>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No payment records found.
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

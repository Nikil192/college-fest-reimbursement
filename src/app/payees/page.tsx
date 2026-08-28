import prisma from "@/lib/prisma";
import { Smartphone, Search } from "lucide-react";

export default async function PayeesPage() {
  const payees = await prisma.payee.findMany({
    include: {
      reimbursements: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Payee Directory</h1>
          <p className="text-gray-500">Manage students, staff, and vendor payees receiving festival reimbursements.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search payees..." 
              className="w-full pl-9 pr-4 py-1.5 border border-[var(--card-border)] rounded-lg text-sm bg-white dark:bg-gray-900"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">Total Payees: {payees.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Payee Name</th>
                <th className="px-6 py-3">Student / Staff ID</th>
                <th className="px-6 py-3">Phone (WhatsApp)</th>
                <th className="px-6 py-3">UPI ID</th>
                <th className="px-6 py-3">Total Claims</th>
                <th className="px-6 py-3">Total Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {payees.map(payee => {
                const totalPaid = payee.reimbursements
                  .filter(r => r.status === 'PAID')
                  .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

                return (
                  <tr key={payee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        {payee.name.charAt(0)}
                      </div>
                      {payee.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{payee.studentId || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-green-600" />
                        {payee.phone || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-mono text-xs">{payee.upiId || '-'}</td>
                    <td className="px-6 py-4">{payee.reimbursements.length}</td>
                    <td className="px-6 py-4 font-bold text-green-600">₹{totalPaid.toLocaleString()}</td>
                  </tr>
                );
              })}

              {payees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No payees registered yet.
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

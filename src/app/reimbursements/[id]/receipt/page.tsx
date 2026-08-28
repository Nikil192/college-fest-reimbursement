import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";

export default async function PrintableReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const reimbursement = await prisma.reimbursement.findUnique({
    where: { reimbursementNumber: resolvedParams.id },
    include: {
      festival: true,
      payee: true,
      payments: true,
    }
  });

  if (!reimbursement || reimbursement.status !== 'PAID') {
    notFound();
  }

  const payment = reimbursement.payments[0];

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center justify-start print:p-0 print:bg-white">
      
      {/* Print Controls bar (Hidden during print) */}
      <div className="max-w-2xl w-full mb-6 flex justify-between items-center print:hidden">
        <a href={`/reimbursements/${reimbursement.reimbursementNumber}`} className="text-sm text-blue-600 hover:underline">
          &larr; Back to Reimbursement
        </a>
        <button 
          onClick={() => {}} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-white text-gray-900 border border-gray-300 rounded-xl p-8 max-w-2xl w-full shadow-lg print:shadow-none print:border-none print:w-full">
        
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">Payment Receipt</h1>
            <p className="text-sm text-gray-500 font-medium">College Festival Reimbursement System</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-green-100 text-green-800 font-bold px-3 py-1 rounded text-xs tracking-wider uppercase mb-1">
              PAID & CONFIRMED
            </span>
            <p className="text-xs text-gray-500">Receipt No: REC-{reimbursement.reimbursementNumber}</p>
            <p className="text-xs text-gray-500">Date: {payment ? new Date(payment.paymentDate).toLocaleDateString() : '-'}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Paid To (Payee)</p>
            <p className="font-bold text-gray-800 text-base">{reimbursement.payee.name}</p>
            <p className="text-gray-600">ID: {reimbursement.payee.studentId || 'N/A'}</p>
            <p className="text-gray-600">Phone: {reimbursement.payee.phone || 'N/A'}</p>
            <p className="text-gray-600">UPI: {reimbursement.payee.upiId || 'N/A'}</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Festival & Event</p>
            <p className="font-bold text-gray-800 text-base">{reimbursement.festival.name}</p>
            <p className="text-gray-600">{reimbursement.festival.organization}</p>
            <p className="text-gray-600">Academic Year: {reimbursement.festival.academicYear}</p>
          </div>
        </div>

        {/* Expense Summary Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{reimbursement.description}</p>
                  <p className="text-xs text-gray-500">Ref: {reimbursement.reimbursementNumber}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{reimbursement.category}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(reimbursement.requestedAmount)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 font-bold">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right uppercase text-xs text-gray-500">Total Amount Paid</td>
                <td className="px-4 py-3 text-right text-lg text-green-700">{formatCurrency(reimbursement.paidAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Transaction Reference */}
        {payment && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 flex justify-between items-center text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Payment Mode</p>
              <p className="font-medium">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Transaction Reference / UTR</p>
              <p className="font-mono text-xs bg-white border border-gray-300 px-2 py-1 rounded font-bold text-gray-800">{payment.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Payment Ref No</p>
              <p className="font-medium">{payment.paymentNumber}</p>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs text-gray-500">
          <div>
            <div className="border-b border-gray-400 mb-2 h-8"></div>
            <p className="font-medium">Festival Coordinator Signature</p>
          </div>
          <div>
            <div className="border-b border-gray-400 mb-2 h-8"></div>
            <p className="font-medium">Finance & Accounts Administrator</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
          This is a computer-generated receipt issued by the College Festival Reimbursement & Expense Management System.
        </div>
      </div>
    </div>
  );
}

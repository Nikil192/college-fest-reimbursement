import { ArrowLeft, FileText, Smartphone, MessageSquare } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReimbursementActions from "@/components/ReimbursementActions";

export default async function ReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const reimbursement = await prisma.reimbursement.findUnique({
    where: { reimbursementNumber: resolvedParams.id },
    include: {
      festival: true,
      payee: true,
      documents: true,
      payments: true,
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!reimbursement) {
    notFound();
  }

  const isPaid = reimbursement.status === 'PAID';

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/reimbursements" className="mr-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{reimbursement.reimbursementNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                  ${reimbursement.status === 'PAYMENT_PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                  ${reimbursement.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  ${['SUBMITTED', 'UNDER_VERIFICATION'].includes(reimbursement.status) ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                  ${reimbursement.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                `}>
                {reimbursement.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{reimbursement.festival.name} • {reimbursement.category}</p>
          </div>
        </div>
        
        {/* Mount Client Actions Component */}
        <ReimbursementActions reimbursement={reimbursement} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Docs & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--card-border)] flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Attached Documents
              </h3>
            </div>
            <div className="p-6">
              {reimbursement.documents.length > 0 ? (
                <div className="space-y-4">
                  {reimbursement.documents.map(doc => (
                    <div key={doc.id} className="flex justify-between items-center p-4 border border-[var(--card-border)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a href={doc.driveUrl || '#'} target="_blank" className="text-blue-600 text-sm hover:underline font-medium">
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No documents attached.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Activity Logs & Notes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reimbursement.comments.map(comment => (
                  <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-[var(--card-border)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-xs text-gray-500">Administrator</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))}

                {reimbursement.comments.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No notes recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details */}
        <div className="space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-semibold">Financial Summary</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between pb-3 border-b border-[var(--card-border)]">
                <span className="text-gray-500 text-sm">Requested</span>
                <span className="font-medium">{formatCurrency(reimbursement.requestedAmount)}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-[var(--card-border)]">
                <span className="text-gray-500 text-sm">Approved</span>
                <span className="font-medium text-blue-600">{formatCurrency(reimbursement.approvedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(reimbursement.paidAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--card-border)] bg-gray-50 dark:bg-gray-800/30">
              <h3 className="font-semibold">Payee Details</h3>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="font-medium text-sm">{reimbursement.payee.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Student / Staff ID</p>
                <p className="font-medium text-sm">{reimbursement.payee.studentId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone (WhatsApp)</p>
                <p className="font-medium text-sm flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-green-600" />
                  {reimbursement.payee.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">UPI ID</p>
                <p className="font-medium text-sm text-blue-600">{reimbursement.payee.upiId || '-'}</p>
              </div>
            </div>
          </div>

          {reimbursement.payments.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300">Payment Information</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{reimbursement.payments[0].paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium font-mono text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{reimbursement.payments[0].transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid Date</span>
                  <span className="font-medium">{new Date(reimbursement.payments[0].paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

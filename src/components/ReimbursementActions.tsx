'use client';

import { useState } from 'react';
import { Check, X, CreditCard, FileText } from 'lucide-react';
import { approveReimbursement, rejectReimbursement, recordPayment } from '@/actions/reimbursements';

interface Props {
  reimbursement: {
    id: string;
    reimbursementNumber: string;
    requestedAmount: number;
    approvedAmount: number | null;
    status: string;
  };
}

export default function ReimbursementActions({ reimbursement }: Props) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [approveAmount, setApproveAmount] = useState(reimbursement.requestedAmount);
  const [approveNotes, setApproveNotes] = useState('');

  const [rejectReason, setRejectReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await approveReimbursement(reimbursement.id, approveAmount, approveNotes);
      setShowApproveModal(false);
    } catch {
      alert('Failed to approve reimbursement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await rejectReimbursement(reimbursement.id, rejectReason);
      setShowRejectModal(false);
    } catch {
      alert('Failed to reject reimbursement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await recordPayment(reimbursement.id, formData);
      setShowPaymentModal(false);
    } catch {
      alert('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingVerification = ['SUBMITTED', 'UNDER_VERIFICATION'].includes(reimbursement.status);
  const isPaymentPending = reimbursement.status === 'PAYMENT_PENDING';
  const isPaid = reimbursement.status === 'PAID';

  return (
    <div>
      <div className="flex gap-3">
        {isPaid && (
          <a
            href={`/reimbursements/${reimbursement.reimbursementNumber}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" /> Print Receipt
          </a>
        )}

        {isPaymentPending && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Record Payment
          </button>
        )}

        {isPendingVerification && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Approve Reimbursement</h3>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Approved Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(parseFloat(e.target.value))}
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Approval Notes (Optional)</label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Verification confirmed with bills..."
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-red-600">Reject Reimbursement</h3>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  placeholder="Invalid receipt or missing approval..."
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Record Payment</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={reimbursement.approvedAmount || reimbursement.requestedAmount}
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select name="paymentMethod" required className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">NEFT / RTGS / IMPS</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction Ref / UTR / Cheque No.</label>
                <input
                  type="text"
                  name="transactionId"
                  required
                  placeholder="e.g. UTR1092837492"
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  name="remarks"
                  placeholder="Payment completed by Dean Office..."
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment & Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

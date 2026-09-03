'use client';

import { useEffect, useState } from 'react';
import { Check, X, CreditCard, FileText, MessageCircle } from 'lucide-react';
import { approveReimbursement, rejectReimbursement, recordPayment } from '@/actions/reimbursements';
import { sendWhatsAppConfirmation } from '@/actions/integrations';
import { getIndiaDateInputValue } from '@/lib/dates';

interface Props {
  reimbursement: {
    id: string;
    reimbursementNumber: string;
    requestedAmount: number;
    approvedAmount: number | null;
    status: string;
    payee: {
      phone: string | null;
    };
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
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppResult, setWhatsAppResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  useEffect(() => {
    if (!showApproveModal && !showRejectModal && !showPaymentModal) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowPaymentModal(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showApproveModal, showPaymentModal, showRejectModal]);

  const handleWhatsAppNotification = async () => {
    if (!window.confirm(`Send payment confirmation to ${reimbursement.payee.phone}?`)) {
      return;
    }

    setIsSendingWhatsApp(true);
    setWhatsAppResult(null);

    try {
      const result = await sendWhatsAppConfirmation(reimbursement.id);
      setWhatsAppResult({
        type: result.success ? 'success' : 'error',
        message: result.success
          ? 'WhatsApp notification sent successfully.'
          : result.error || 'Failed to send WhatsApp notification.'
      });
    } catch {
      setWhatsAppResult({
        type: 'error',
        message: 'Failed to send WhatsApp notification.'
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        {isPaid && (
          <>
            <button
              type="button"
              onClick={handleWhatsAppNotification}
              disabled={isSendingWhatsApp || !reimbursement.payee.phone}
              title={reimbursement.payee.phone ? undefined : 'Add a phone number to the payee first'}
              className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp Notification'}
            </button>
            <a
              href={`/reimbursements/${reimbursement.reimbursementNumber}/receipt`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 border border-[var(--card-border)] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-600" /> Print Receipt
            </a>
          </>
        )}

        {isPaymentPending && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Record Payment
          </button>
        )}

        {isPendingVerification && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex min-h-11 items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {whatsAppResult && (
        <p
          role="status"
          className={`mt-2 text-right text-sm ${
            whatsAppResult.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {whatsAppResult.message}
        </p>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="approve-title" className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl space-y-4">
            <h2 id="approve-title" className="text-lg font-bold">Approve Reimbursement</h2>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label htmlFor="approved-amount" className="block text-sm font-medium mb-1">Approved Amount (₹)</label>
                <input
                  id="approved-amount"
                  autoFocus
                  type="number"
                  step="0.01"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(parseFloat(e.target.value))}
                  required
                  className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="approval-notes" className="block text-sm font-medium mb-1">Approval Notes (Optional)</label>
                <textarea
                  id="approval-notes"
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="Verification confirmed with bills..."
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="min-h-11 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="reject-title" className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl space-y-4">
            <h2 id="reject-title" className="text-lg font-bold text-red-600">Reject Reimbursement</h2>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="block text-sm font-medium mb-1">Reason for Rejection</label>
                <textarea
                  id="rejection-reason"
                  autoFocus
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  placeholder="Invalid receipt or missing approval..."
                  className="w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="min-h-11 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="payment-title" className="bg-white dark:bg-gray-900 border border-[var(--card-border)] rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl space-y-4">
            <h2 id="payment-title" className="text-lg font-bold text-green-700 dark:text-green-400">Record Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="paid-amount" className="block text-sm font-medium mb-1">Paid Amount (₹)</label>
                <input
                  id="paid-amount"
                  autoFocus
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={reimbursement.approvedAmount || reimbursement.requestedAmount}
                  required
                  className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="payment-method" className="block text-sm font-medium mb-1">Payment Method</label>
                <select id="payment-method" name="paymentMethod" required className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">NEFT / RTGS / IMPS</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label htmlFor="transaction-id" className="block text-sm font-medium mb-1">Transaction Ref / UTR / Cheque No.</label>
                <input
                  id="transaction-id"
                  type="text"
                  name="transactionId"
                  required
                  placeholder="e.g. UTR1092837492"
                  className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="payment-date" className="block text-sm font-medium mb-1">Payment Date</label>
                <input
                  id="payment-date"
                  type="date"
                  name="paymentDate"
                  defaultValue={getIndiaDateInputValue()}
                  required
                  className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="payment-remarks" className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                <input
                  id="payment-remarks"
                  type="text"
                  name="remarks"
                  placeholder="Payment completed by Dean Office..."
                  className="min-h-11 w-full border border-[var(--card-border)] rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="min-h-11 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

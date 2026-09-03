import prisma from "@/lib/prisma";
import { CheckCircle, Clock3, XCircle } from "lucide-react";

export default async function NotificationsPage() {
  const messages = await prisma.whatsAppMessage.findMany({
    include: {
      reimbursement: {
        include: {
          payee: true
        }
      }
    },
    orderBy: { sentAt: 'desc' }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Dispatch Log</h1>
          <p className="text-gray-500">History of automated WhatsApp messages sent to payees via wacli.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="responsive-table w-full text-sm text-left">
            <caption className="sr-only">WhatsApp message delivery history</caption>
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Recipient Phone</th>
                <th scope="col" className="px-6 py-3">Payee Name</th>
                <th scope="col" className="px-6 py-3">Reimbursement ID</th>
                <th scope="col" className="px-6 py-3">Message Content / Driver</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {messages.map(msg => {
                const isSent = ['SENT', 'DELIVERED'].includes(msg.status);
                const isFailed = msg.status === 'FAILED';
                const StatusIcon = isSent ? CheckCircle : isFailed ? XCircle : Clock3;

                return (
                  <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td data-label="Recipient Phone" className="px-6 py-4 font-medium text-green-600 font-mono text-xs">{msg.recipientPhone}</td>
                    <td data-label="Payee Name" className="px-6 py-4">{msg.reimbursement.payee.name}</td>
                    <td data-label="Reimbursement ID" className="px-6 py-4 font-medium">{msg.reimbursement.reimbursementNumber}</td>
                    <td data-label="Message" className="px-6 py-4 max-w-md break-words text-gray-600 dark:text-gray-300 text-xs">{msg.messageTemplate}</td>
                    <td data-label="Status" className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        isSent
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : isFailed
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        <StatusIcon className="w-3 h-3" /> {msg.status}
                      </span>
                    </td>
                    <td data-label="Timestamp" className="px-6 py-4 text-gray-500 text-xs">{msg.sentAt ? new Date(msg.sentAt).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No WhatsApp notifications logged yet.
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

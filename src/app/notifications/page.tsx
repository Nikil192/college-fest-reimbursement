import prisma from "@/lib/prisma";
import { CheckCircle } from "lucide-react";

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Dispatch Log</h1>
          <p className="text-gray-500">History of automated WhatsApp messages sent to payees via wacli.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">Recipient Phone</th>
                <th className="px-6 py-3">Payee Name</th>
                <th className="px-6 py-3">Reimbursement ID</th>
                <th className="px-6 py-3">Message Content / Driver</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {messages.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 font-medium text-green-600 font-mono text-xs">{msg.recipientPhone}</td>
                  <td className="px-6 py-4">{msg.reimbursement.payee.name}</td>
                  <td className="px-6 py-4 font-medium">{msg.reimbursement.reimbursementNumber}</td>
                  <td className="px-6 py-4 max-w-md truncate text-gray-600 dark:text-gray-300 text-xs">{msg.messageTemplate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{msg.sentAt ? new Date(msg.sentAt).toLocaleString() : '-'}</td>
                </tr>
              ))}

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

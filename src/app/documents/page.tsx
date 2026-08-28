import prisma from "@/lib/prisma";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      reimbursement: {
        include: {
          festival: true,
          payee: true
        }
      }
    },
    orderBy: { uploadedAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Document Repository</h1>
          <p className="text-gray-500">Centralized Google Drive bill and receipt archives.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Reimbursement ID</th>
                <th className="px-6 py-3">Payee</th>
                <th className="px-6 py-3">Festival</th>
                <th className="px-6 py-3">Uploaded Date</th>
                <th className="px-6 py-3 text-right">Drive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {doc.fileName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600 hover:underline">
                    <Link href={`/reimbursements/${doc.reimbursement.reimbursementNumber}`}>
                      {doc.reimbursement.reimbursementNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{doc.reimbursement.payee.name}</td>
                  <td className="px-6 py-4">{doc.reimbursement.festival.name}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={doc.driveUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs font-medium inline-flex items-center gap-1"
                    >
                      Open Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}

              {documents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No documents uploaded yet.
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

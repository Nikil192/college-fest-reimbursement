import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getIndiaDateInputValue } from "@/lib/dates";
import NewReimbursementForm from "@/components/NewReimbursementForm";

export const dynamic = 'force-dynamic';

export default async function NewReimbursementPage() {
  const festivals = await prisma.festival.findMany({
    where: { status: { in: ['PLANNED', 'ACTIVE'] } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/reimbursements" aria-label="Back to reimbursements" className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Reimbursement</h1>
          <p className="text-gray-500">Create a new reimbursement request.</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-sm overflow-hidden">
        <NewReimbursementForm festivals={festivals} defaultExpenseDate={getIndiaDateInputValue()} />
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const reimbursements = await prisma.reimbursement.findMany({
    include: {
      festival: true,
      payee: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const headers = [
    'Reimbursement ID',
    'Festival',
    'Payee Name',
    'Student/Staff ID',
    'Phone',
    'UPI ID',
    'Category',
    'Description',
    'Expense Date',
    'Requested Amount (INR)',
    'Approved Amount (INR)',
    'Paid Amount (INR)',
    'Status',
    'Payment Method',
    'Transaction Ref'
  ];

  const rows = reimbursements.map(r => [
    r.reimbursementNumber,
    `"${r.festival.name}"`,
    `"${r.payee.name}"`,
    r.payee.studentId || '',
    r.payee.phone || '',
    r.payee.upiId || '',
    `"${r.category}"`,
    `"${r.description.replace(/"/g, '""')}"`,
    new Date(r.expenseDate).toISOString().split('T')[0],
    r.requestedAmount,
    r.approvedAmount || '',
    r.paidAmount || '',
    r.status,
    r.payments[0]?.paymentMethod || '',
    r.payments[0]?.transactionId || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="reimbursements_export.csv"'
    }
  });
}

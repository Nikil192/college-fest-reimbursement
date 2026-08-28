'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadBillToDrive, sendWhatsAppConfirmation } from './integrations';

export async function submitReimbursement(formData: FormData) {
  const festivalId = formData.get('festivalId') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const expenseDate = formData.get('expenseDate') as string;

  const payeeName = formData.get('payeeName') as string;
  const studentId = formData.get('studentId') as string;
  const phone = formData.get('phone') as string;
  const upiId = formData.get('upiId') as string;
  
  const file = formData.get('file') as File;

  // Check if payee already exists or create new
  let payee = await prisma.payee.findFirst({
    where: {
      OR: [
        { phone: phone || undefined },
        { studentId: studentId || undefined }
      ]
    }
  });

  if (!payee) {
    payee = await prisma.payee.create({
      data: {
        name: payeeName,
        studentId: studentId || null,
        phone: phone || null,
        upiId: upiId || null,
        payeeType: 'Student'
      }
    });
  }

  // Create Reimbursement
  const reimbursementNumber = `REIM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const reimbursement = await prisma.reimbursement.create({
    data: {
      reimbursementNumber,
      festivalId,
      payeeId: payee.id,
      category,
      description,
      expenseDate: new Date(expenseDate),
      requestedAmount: amount,
      status: 'SUBMITTED'
    }
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: 'Reimbursement',
      entityId: reimbursement.id,
      action: 'SUBMITTED',
      newValue: 'SUBMITTED',
      reason: 'New reimbursement request submitted'
    }
  });

  // Handle File Upload
  if (file && file.size > 0) {
    const uploadResult = await uploadBillToDrive(formData);
    if (uploadResult.success) {
      await prisma.document.create({
        data: {
          reimbursementId: reimbursement.id,
          documentType: 'BILL',
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          driveUrl: uploadResult.driveUrl,
          driveFileId: uploadResult.driveFileId
        }
      });
    }
  }

  revalidatePath('/reimbursements');
  redirect(`/reimbursements/${reimbursementNumber}`);
}

export async function approveReimbursement(reimbursementId: string, approvedAmount: number, notes?: string) {
  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: reimbursementId } });
  if (!reimbursement) throw new Error("Reimbursement not found");

  await prisma.reimbursement.update({
    where: { id: reimbursementId },
    data: {
      status: 'PAYMENT_PENDING',
      approvedAmount: approvedAmount
    }
  });

  if (notes) {
    await prisma.comment.create({
      data: {
        reimbursementId,
        comment: `Approval Note: ${notes}`,
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      entityType: 'Reimbursement',
      entityId: reimbursementId,
      action: 'APPROVED',
      oldValue: reimbursement.status,
      newValue: 'PAYMENT_PENDING',
      reason: `Approved amount ₹${approvedAmount}. Notes: ${notes || 'None'}`
    }
  });

  revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
  revalidatePath('/reimbursements');
  revalidatePath('/');
  return { success: true };
}

export async function rejectReimbursement(reimbursementId: string, reason: string) {
  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: reimbursementId } });
  if (!reimbursement) throw new Error("Reimbursement not found");

  await prisma.reimbursement.update({
    where: { id: reimbursementId },
    data: { status: 'REJECTED' }
  });

  await prisma.comment.create({
    data: {
      reimbursementId,
      comment: `Rejection Reason: ${reason}`,
    }
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Reimbursement',
      entityId: reimbursementId,
      action: 'REJECTED',
      oldValue: reimbursement.status,
      newValue: 'REJECTED',
      reason
    }
  });

  revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
  revalidatePath('/reimbursements');
  revalidatePath('/');
  return { success: true };
}

export async function recordPayment(reimbursementId: string, formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const paymentMethod = formData.get('paymentMethod') as string;
  const transactionId = formData.get('transactionId') as string;
  const paymentDate = formData.get('paymentDate') as string;
  const remarks = formData.get('remarks') as string;

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: reimbursementId } });
  if (!reimbursement) throw new Error("Reimbursement not found");

  const paymentNumber = `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        paymentNumber,
        reimbursementId,
        amount,
        paymentMethod,
        transactionId,
        paymentDate: new Date(paymentDate),
        paymentRemarks: remarks || null
      }
    }),
    prisma.reimbursement.update({
      where: { id: reimbursementId },
      data: {
        status: 'PAID',
        paidAmount: amount
      }
    }),
    prisma.auditLog.create({
      data: {
        entityType: 'Reimbursement',
        entityId: reimbursementId,
        action: 'PAID',
        oldValue: reimbursement.status,
        newValue: 'PAID',
        reason: `Paid ₹${amount} via ${paymentMethod}. Transaction ID: ${transactionId}`
      }
    })
  ]);

  // Trigger WhatsApp notification via wacli integration
  try {
    await sendWhatsAppConfirmation(reimbursementId);
  } catch (err) {
    console.error("WhatsApp trigger error:", err);
  }

  revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
  revalidatePath('/reimbursements');
  revalidatePath('/payments');
  revalidatePath('/');
  return { success: true };
}

export async function addComment(reimbursementId: string, comment: string) {
  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: reimbursementId } });
  if (!reimbursement) throw new Error("Reimbursement not found");

  await prisma.comment.create({
    data: {
      reimbursementId,
      comment
    }
  });

  revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
  return { success: true };
}

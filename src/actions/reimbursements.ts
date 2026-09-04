'use server';

import prisma from '@/lib/prisma';
import { deleteStoredDocument, storeDocument } from '@/lib/document-storage';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ReimbursementFormState = {
  error?: string;
  success?: string;
};

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function documentErrorMessage(error: unknown) {
  if (error instanceof Error && [
    'A document is required.',
    'Documents must be 10 MB or smaller.',
    'Only PDF, JPEG, PNG, and WebP documents are supported.',
  ].includes(error.message)) {
    return error.message;
  }

  return null;
}

export async function submitReimbursement(
  _previousState: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  const festivalId = requiredString(formData, 'festivalId');
  const category = requiredString(formData, 'category');
  const description = requiredString(formData, 'description');
  const amount = Number(requiredString(formData, 'amount'));
  const expenseDate = requiredString(formData, 'expenseDate');

  const payeeName = requiredString(formData, 'payeeName');
  const studentId = requiredString(formData, 'studentId');
  const phone = requiredString(formData, 'phone');
  const upiId = requiredString(formData, 'upiId');
  const file = formData.get('file');
  const hasDocument = file instanceof File && file.size > 0;

  if (!festivalId || !category || !description || !payeeName || !phone || !expenseDate) {
    return { error: 'Please complete all required fields.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Enter a valid reimbursement amount.' };
  }

  const festival = await prisma.festival.findFirst({
    where: { id: festivalId, status: { in: ['PLANNED', 'ACTIVE'] } },
    select: { id: true },
  });

  if (!festival) {
    return { error: 'The selected festival is no longer available.' };
  }

  let storedDocument: Awaited<ReturnType<typeof storeDocument>> | null = null;
  const reimbursementNumber = `REIM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    if (hasDocument) {
      storedDocument = await storeDocument(file);
    }

    await prisma.$transaction(async (tx) => {
      let payee = await tx.payee.findFirst({
        where: {
          OR: [
            { phone },
            ...(studentId ? [{ studentId }] : []),
          ],
        }
      });

      if (!payee) {
        payee = await tx.payee.create({
          data: {
            name: payeeName,
            studentId: studentId || null,
            phone: phone || null,
            upiId: upiId || null,
            payeeType: 'Student'
          }
        });
      }

      const reimbursement = await tx.reimbursement.create({
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

      await tx.auditLog.create({
        data: {
          entityType: 'Reimbursement',
          entityId: reimbursement.id,
          action: 'SUBMITTED',
          newValue: 'SUBMITTED',
          reason: 'New reimbursement request submitted'
        }
      });

      if (storedDocument && file instanceof File) {
        await tx.document.create({
          data: {
            reimbursementId: reimbursement.id,
            documentType: 'BILL',
            fileName: file.name,
            fileType: storedDocument.fileType,
            fileSize: storedDocument.fileSize,
            storageKey: storedDocument.storageKey
          }
        });
      }
    });
  } catch (error) {
    if (storedDocument) {
      try {
        await deleteStoredDocument(storedDocument.storageKey);
      } catch (cleanupError) {
        console.error('Failed to clean up document after reimbursement error:', cleanupError);
      }
    }

    console.error('Failed to submit reimbursement:', error);
    return {
      error: documentErrorMessage(error) || 'Unable to submit the reimbursement. Please try again.',
    };
  }

  revalidatePath('/');
  revalidatePath('/documents');
  revalidatePath('/payees');
  revalidatePath('/reimbursements');
  redirect(`/reimbursements/${reimbursementNumber}`);
}

export async function uploadReimbursementDocument(
  _previousState: ReimbursementFormState,
  formData: FormData,
): Promise<ReimbursementFormState> {
  const reimbursementId = requiredString(formData, 'reimbursementId');
  const file = formData.get('file');

  if (!reimbursementId || !(file instanceof File) || file.size === 0) {
    return { error: 'Choose an invoice document to upload.' };
  }

  const reimbursement = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
    select: { reimbursementNumber: true },
  });

  if (!reimbursement) {
    return { error: 'Reimbursement not found.' };
  }

  let storedDocument: Awaited<ReturnType<typeof storeDocument>> | null = null;

  try {
    storedDocument = await storeDocument(file);
    await prisma.document.create({
      data: {
        reimbursementId,
        documentType: 'BILL',
        fileName: file.name,
        fileType: storedDocument.fileType,
        fileSize: storedDocument.fileSize,
        storageKey: storedDocument.storageKey,
      },
    });
  } catch (error) {
    if (storedDocument) {
      try {
        await deleteStoredDocument(storedDocument.storageKey);
      } catch (cleanupError) {
        console.error('Failed to clean up document after upload error:', cleanupError);
      }
    }

    console.error('Failed to upload reimbursement document:', error);
    return {
      error: documentErrorMessage(error) || 'Unable to upload the invoice. Please try again.',
    };
  }

  revalidatePath('/documents');
  revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
  return { success: 'Invoice attached successfully.' };
}

export async function deleteReimbursement(reimbursementId: string) {
  const reimbursement = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
    select: {
      reimbursementNumber: true,
      status: true,
      documents: { select: { storageKey: true } },
    },
  });

  if (!reimbursement) {
    return { success: false, error: 'Reimbursement not found.' };
  }

  try {
    await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          entityType: 'Reimbursement',
          entityId: reimbursementId,
          action: 'DELETED',
          oldValue: reimbursement.status,
          reason: `Deleted reimbursement ${reimbursement.reimbursementNumber}`,
        },
      }),
      prisma.reimbursement.delete({ where: { id: reimbursementId } }),
    ]);
  } catch (error) {
    console.error('Failed to delete reimbursement:', error);
    return { success: false, error: 'Unable to delete the reimbursement. Please try again.' };
  }

  const cleanupResults = await Promise.allSettled(
    reimbursement.documents.flatMap((document) =>
      document.storageKey ? [deleteStoredDocument(document.storageKey)] : [],
    ),
  );

  for (const result of cleanupResults) {
    if (result.status === 'rejected') {
      console.error('Failed to delete stored reimbursement document:', result.reason);
    }
  }

  revalidatePath('/');
  revalidatePath('/documents');
  revalidatePath('/payees');
  revalidatePath('/payments');
  revalidatePath('/reimbursements');
  return { success: true };
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

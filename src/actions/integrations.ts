'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface PaymentData {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentDate: string | Date;
  remarks?: string;
}

/**
 * WhatsApp Integration using wacli
 * The user requested to use wacli instead of the official WhatsApp API.
 */
export async function sendWhatsAppConfirmation(reimbursementId: string) {
  const reimbursement = await prisma.reimbursement.findUnique({
    where: { id: reimbursementId },
    include: {
      payee: true,
      festival: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  if (!reimbursement) {
    return { success: false, error: 'Reimbursement not found.' };
  }

  if (reimbursement.status !== 'PAID' || reimbursement.paidAmount === null) {
    return { success: false, error: 'The reimbursement must be marked as paid first.' };
  }

  if (!reimbursement.payee.phone) {
    return { success: false, error: 'The payee does not have a WhatsApp number.' };
  }

  const payment = reimbursement.payments[0];
  if (!payment) {
    return { success: false, error: 'Payment details could not be found.' };
  }

  const phoneDigits = reimbursement.payee.phone.replace(/\D/g, '');
  const recipientPhone = phoneDigits.length === 10
    ? `91${phoneDigits}`
    : phoneDigits.startsWith('00')
      ? phoneDigits.slice(2)
      : phoneDigits;

  if (recipientPhone.length < 8 || recipientPhone.length > 15) {
    return { success: false, error: 'The payee WhatsApp number is invalid.' };
  }

  const amount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: reimbursement.currency,
    maximumFractionDigits: 2
  }).format(reimbursement.paidAmount);
  const paymentDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(payment.paymentDate);
  const messageText = [
    `Hi ${reimbursement.payee.name},`,
    '',
    `${amount} has been transferred to you for reimbursement ${reimbursement.reimbursementNumber}.`,
    '',
    `Festival: ${reimbursement.festival.name}`,
    `Category: ${reimbursement.category}`,
    `Payment method: ${payment.paymentMethod}`,
    `Transaction reference: ${payment.transactionId || 'N/A'}`,
    `Payment date: ${paymentDate}`,
    '',
    'Please contact the festival administration team if you have any questions.'
  ].join('\n');
  const messageRecord = await prisma.whatsAppMessage.create({
    data: {
      reimbursementId: reimbursement.id,
      recipientPhone,
      messageTemplate: messageText,
      status: 'QUEUED'
    }
  });
  const wacliCommand = process.env.WACLI_COMMAND || 'wacli';

  try {
    await execFileAsync(
      wacliCommand,
      [
        '--json',
        '--timeout',
        '30s',
        'send',
        'text',
        '--to',
        recipientPhone,
        '--message',
        messageText
      ],
      { timeout: 45_000 }
    );

    await prisma.$transaction([
      prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      }),
      prisma.auditLog.create({
        data: {
          entityType: 'WhatsAppMessage',
          entityId: messageRecord.id,
          action: 'SENT_CONFIRMATION_WACLI',
          newValue: 'SENT',
          reason: `Payment confirmation sent to ${recipientPhone} via wacli.`
        }
      })
    ]);

    revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
    revalidatePath('/notifications');
    return { success: true };
  } catch (error) {
    console.error('WhatsApp Integration Error (wacli):', error);

    const failureReason = error instanceof Error
      ? error.message.slice(0, 500)
      : 'Unknown wacli error';

    await prisma.whatsAppMessage.update({
      where: { id: messageRecord.id },
      data: {
        status: 'FAILED',
        failureReason
      }
    });

    revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
    revalidatePath('/notifications');
    return {
      success: false,
      error: 'wacli could not send the message. Check its authentication and connection.'
    };
  }
}

/**
 * Update Payment Status
 */
export async function markAsPaid(reimbursementId: string, paymentData: PaymentData) {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({ where: { id: reimbursementId }});
    if (!reimbursement) throw new Error("Not found");

    // Start Transaction
    await prisma.$transaction(async (tx) => {
      // Create Payment Record
      await tx.payment.create({
        data: {
          paymentNumber: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          reimbursementId: reimbursement.id,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          paymentDate: new Date(paymentData.paymentDate),
          paymentRemarks: paymentData.remarks
        }
      });

      // Update Reimbursement Status
      await tx.reimbursement.update({
        where: { id: reimbursement.id },
        data: { 
          status: 'PAID',
          paidAmount: paymentData.amount
        }
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          entityType: 'Reimbursement',
          entityId: reimbursement.id,
          action: 'MARKED_AS_PAID',
          oldValue: reimbursement.status,
          newValue: 'PAID',
          reason: 'Administrator marked the reimbursement as paid.'
        }
      });
    });

    revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
    return { success: true };
  } catch (error) {
    console.error("Payment Update Error:", error);
    return { success: false, error: "Failed to mark as paid." };
  }
}

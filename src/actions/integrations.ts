'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * WhatsApp Integration using wacli
 * The user requested to use wacli instead of the official WhatsApp API.
 */
export async function sendWhatsAppConfirmation(reimbursementId: string) {
  try {
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id: reimbursementId },
      include: { payee: true, festival: true, payments: true }
    });

    if (!reimbursement || !reimbursement.payee.phone) {
      throw new Error("Missing required data for WhatsApp message.");
    }

    const messageText = `Payment Confirmation: Your reimbursement of Rs. ${reimbursement.paidAmount} for ${reimbursement.festival.name} has been processed. Transaction ID: ${reimbursement.payments[0]?.transactionId || 'N/A'}`;
    
    // Execute wacli to send the message
    // Note: This requires wacli to be configured locally in the environment
    await execAsync(`npx wacli send --phone "${reimbursement.payee.phone}" --message "${messageText}"`);

    // Record the message in our database
    await prisma.whatsAppMessage.create({
      data: {
        reimbursementId: reimbursement.id,
        recipientPhone: reimbursement.payee.phone,
        messageTemplate: messageText,
        status: "DELIVERED",
        sentAt: new Date(),
        deliveredAt: new Date()
      }
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'WhatsAppMessage',
        entityId: reimbursement.id,
        action: 'SENT_CONFIRMATION_WACLI',
        newValue: 'DELIVERED',
        reason: 'Automated payment confirmation sent to payee via wacli.'
      }
    });

    revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
    return { success: true };
  } catch (error) {
    console.error("WhatsApp Integration Error (wacli):", error);
    return { success: false, error: "Failed to send message via wacli." };
  }
}

/**
 * Google Drive API Integration (Stub)
 */
export async function uploadBillToDrive(formData: FormData) {
  try {
    // const file = formData.get('file') as File;
    // const reimbursementId = formData.get('reimbursementId') as string;

    // Real implementation would use googleapis:
    // const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/drive.file'] });
    // const drive = google.drive({ version: 'v3', auth });
    // const response = await drive.files.create({
    //    requestBody: { name: file.name, parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID] },
    //    media: { mimeType: file.type, body: Readable.from(await file.arrayBuffer()) }
    // });

    return { 
      success: true, 
      driveUrl: "https://drive.google.com/file/d/mock-id/view",
      driveFileId: "mock-id"
    };
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    return { success: false, error: "Upload failed." };
  }
}

/**
 * Update Payment Status
 */
export async function markAsPaid(reimbursementId: string, paymentData: any) {
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

    // Optionally trigger WhatsApp message async
    await sendWhatsAppConfirmation(reimbursement.id);

    revalidatePath(`/reimbursements/${reimbursement.reimbursementNumber}`);
    return { success: true };
  } catch (error) {
    console.error("Payment Update Error:", error);
    return { success: false, error: "Failed to mark as paid." };
  }
}

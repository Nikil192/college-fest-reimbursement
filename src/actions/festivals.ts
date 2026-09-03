'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function requiredText(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function optionalText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function optionalDate(formData: FormData, field: string) {
  const value = optionalText(formData, field);
  return value ? new Date(`${value}T00:00:00`) : null;
}

export async function createFestival(formData: FormData) {
  const allocatedBudget = Number(requiredText(formData, 'allocatedBudget'));

  if (!Number.isFinite(allocatedBudget) || allocatedBudget < 0) {
    throw new Error('allocatedBudget must be a non-negative number.');
  }

  const startDate = optionalDate(formData, 'startDate');
  const endDate = optionalDate(formData, 'endDate');

  if (startDate && endDate && endDate < startDate) {
    throw new Error('endDate cannot be before startDate.');
  }

  const festival = await prisma.festival.create({
    data: {
      name: requiredText(formData, 'name'),
      organization: requiredText(formData, 'organization'),
      academicYear: requiredText(formData, 'academicYear'),
      allocatedBudget,
      status: requiredText(formData, 'status'),
      festivalDate: optionalDate(formData, 'festivalDate'),
      startDate,
      endDate,
      description: optionalText(formData, 'description'),
      coordinatorName: optionalText(formData, 'coordinatorName'),
      coordinatorPhone: optionalText(formData, 'coordinatorPhone'),
      coordinatorEmail: optionalText(formData, 'coordinatorEmail'),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'Festival',
      entityId: festival.id,
      action: 'CREATED',
      newValue: festival.status,
      reason: `Created festival ${festival.name}`,
    },
  });

  revalidatePath('/');
  revalidatePath('/festivals');
  revalidatePath('/reimbursements/new');
  redirect('/festivals');
}

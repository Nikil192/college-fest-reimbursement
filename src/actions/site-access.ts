'use server';

import { timingSafeEqual } from 'node:crypto';

type VerificationResult =
  | { success: true }
  | { success: false; error: string };

export async function verifySitePassword(password: string): Promise<VerificationResult> {
  const configuredPassword = process.env.SITE_PASSWORD;

  if (!configuredPassword) {
    console.error('SITE_PASSWORD is not configured.');
    return { success: false, error: 'Access is temporarily unavailable.' };
  }

  const supplied = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  const isValid = supplied.length === expected.length && timingSafeEqual(supplied, expected);

  return isValid
    ? { success: true }
    : { success: false, error: 'That password is incorrect. Please try again.' };
}

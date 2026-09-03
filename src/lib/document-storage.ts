import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const storageKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function getStorageDirectory() {
  return path.resolve(/* turbopackIgnore: true */ process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), 'storage', 'documents'));
}

function detectFileType(bytes: Uint8Array) {
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return 'application/pdf';
  }

  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return 'image/png';
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  throw new Error('Only PDF, JPEG, PNG, and WebP documents are supported.');
}

export function getStoredDocumentPath(storageKey: string) {
  if (!storageKeyPattern.test(storageKey)) {
    throw new Error('Invalid document storage key.');
  }

  return path.join(/* turbopackIgnore: true */ getStorageDirectory(), storageKey);
}

export async function storeDocument(file: File) {
  if (file.size === 0) {
    throw new Error('A document is required.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Documents must be 10 MB or smaller.');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const fileType = detectFileType(bytes);
  const storageKey = randomUUID();
  const directory = getStorageDirectory();
  const temporaryPath = path.join(directory, `${storageKey}.tmp`);

  await mkdir(directory, { recursive: true, mode: 0o700 });

  try {
    await writeFile(temporaryPath, bytes, { flag: 'wx', mode: 0o600 });
    await rename(temporaryPath, getStoredDocumentPath(storageKey));
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }

  return { storageKey, fileSize: bytes.byteLength, fileType };
}

export async function deleteStoredDocument(storageKey: string) {
  await rm(getStoredDocumentPath(storageKey), { force: true });
}

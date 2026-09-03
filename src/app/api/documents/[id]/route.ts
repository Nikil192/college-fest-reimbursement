import { readFile } from 'node:fs/promises';
import prisma from '@/lib/prisma';
import { getStoredDocumentPath } from '@/lib/document-storage';

function contentDisposition(fileName: string) {
  const fallback = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    select: { fileName: true, fileType: true, storageKey: true },
  });

  if (!document?.storageKey) {
    return new Response('Document not found.', { status: 404 });
  }

  try {
    const file = await readFile(getStoredDocumentPath(document.storageKey));

    return new Response(file, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': contentDisposition(document.fileName),
        'Content-Length': String(file.byteLength),
        'Content-Type': document.fileType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return new Response('Document file is missing.', { status: 404 });
    }

    throw error;
  }
}

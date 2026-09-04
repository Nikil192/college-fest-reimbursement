'use client';

import { useActionState, useEffect, useRef } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { uploadReimbursementDocument, type ReimbursementFormState } from '@/actions/reimbursements';

const initialState: ReimbursementFormState = {};

export default function DocumentUploadForm({ reimbursementId }: { reimbursementId: string }) {
  const [state, formAction, isPending] = useActionState(uploadReimbursementDocument, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} aria-busy={isPending} className="space-y-3">
      <input type="hidden" name="reimbursementId" value={reimbursementId} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="invoice-file" className="sr-only">Choose invoice document</label>
        <input
          id="invoice-file"
          type="file"
          name="file"
          required
          disabled={isPending}
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="block min-h-11 min-w-0 flex-1 text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
        />
        <button type="submit" disabled={isPending} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-400">
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {isPending ? 'Uploading...' : 'Attach invoice'}
        </button>
      </div>
      <p className="text-xs text-gray-500">PDF, JPEG, PNG, or WebP, up to 10 MB.</p>
      {(state.error || state.success) && (
        <p role={state.error ? 'alert' : 'status'} className={`text-sm ${state.error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {state.error || state.success}
        </p>
      )}
    </form>
  );
}

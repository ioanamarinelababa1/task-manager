'use client';

import { useEffect, useState } from 'react';

interface DeleteModalProps {
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteModal({ taskTitle, onClose, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
        setHasOpened(true);
      });
    });
  }, []);

  function handleClose() {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  }

  async function handleConfirm() {
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
      setDeleting(false);
    }
  }

  const transitionCls = hasOpened
    ? isAnimating
      ? 'transition-all duration-300 ease-out'
      : 'transition-all duration-200 ease-in'
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${transitionCls} ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 ${transitionCls} ${
          isAnimating
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-full opacity-0 sm:translate-y-0 sm:scale-95'
        }`}
      >
        {/* Handle bar — mobile only */}
        <div className="flex justify-center -mt-2 mb-4 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h2 className="text-center text-lg font-semibold text-gray-900 mb-1">Delete Task</h2>
        <p className="text-center text-sm text-gray-500 mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-center text-sm font-medium text-gray-800 mb-5 truncate px-4">
          &ldquo;{taskTitle}&rdquo;
        </p>
        <p className="text-center text-xs text-gray-400 mb-5">This action cannot be undone.</p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 text-center ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {deleting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting…
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

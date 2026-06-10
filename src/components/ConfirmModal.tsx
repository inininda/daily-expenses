import { useEffect } from 'react';
import { btnCls } from '../utils/cn';

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[200] flex items-center justify-center p-4 animate-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-[380px] p-6 animate-modal-in"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="mb-1 text-[16px] font-semibold text-tx-heading">{title}</div>
        {description && (
          <p className="text-[13px] text-tx-muted mb-5">{description}</p>
        )}
        <div className="flex gap-2 justify-end mt-5">
          <button className={btnCls('secondary')} onClick={onCancel}>Cancel</button>
          <button className={btnCls('danger')} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

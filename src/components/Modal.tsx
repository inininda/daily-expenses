import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { btnCls } from '../utils/cn';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[200] flex items-center justify-center p-4 animate-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto animate-modal-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="text-[16px] font-semibold text-tx-heading">{title}</span>
          <button className={btnCls('ghost', 'icon')} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type?: 'default' | 'danger' | 'info';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  type = 'default',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className={`text-xl font-semibold ${type === 'danger' ? 'text-destructive' : 'text-foreground'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-6 text-muted-foreground">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-0">
            {footer}
          </div>
        )}
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>,
    document.body
  );
}

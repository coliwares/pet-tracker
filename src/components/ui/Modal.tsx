'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
  maxWidthClassName?: string;
  bodyClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  maxWidthClassName = 'max-w-md',
  bodyClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative z-10 mt-14 flex max-h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl sm:mt-8 ${maxWidthClassName}`}>
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="pr-4 text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={`overflow-y-auto overscroll-contain px-6 py-4 ${bodyClassName}`}>
            {children}
          </div>

          {onConfirm && (
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
                {loading ? 'Procesando...' : confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

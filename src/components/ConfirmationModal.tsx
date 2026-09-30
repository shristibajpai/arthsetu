import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-white/60 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isDestructive
                ? 'bg-secondary-container/50 text-secondary'
                : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              {title}
            </h3>
            <span className="font-label-sm text-xs text-on-surface-variant font-medium">
              Confirmation Required
            </span>
          </div>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl font-label-md font-semibold cursor-pointer shadow-md transition-all ${
              isDestructive
                ? 'bg-secondary hover:bg-secondary-container text-on-secondary'
                : 'bg-primary hover:bg-primary-container text-on-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

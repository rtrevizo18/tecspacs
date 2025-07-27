import React from 'react';
import StickyNote from './StickyNote';
import OutlineButton from './OutlineButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const getStickyVariant = () => {
    switch (variant) {
      case 'danger': return 'pink';
      case 'warning': return 'default';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger': return '⚠️';
      case 'warning': return '❓';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="animate-in zoom-in-95 duration-200">
        <StickyNote variant={getStickyVariant()} className="shadow-2xl max-w-md">
          <div className="text-center">
            <div className="text-3xl mb-4">{getIcon()}</div>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              {title}
            </h3>
            <p className="text-text-primary mb-6 leading-relaxed">
              {message}
            </p>
            <div className="flex gap-3 justify-center">
              <OutlineButton
                size="medium"
                variant="secondary"
                onClick={onCancel}
              >
                {cancelText}
              </OutlineButton>
              <OutlineButton
                size="medium"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
              >
                {confirmText}
              </OutlineButton>
            </div>
          </div>
        </StickyNote>
      </div>
    </div>
  );
};

export default ConfirmDialog;
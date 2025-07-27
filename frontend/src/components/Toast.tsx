import React, { useEffect } from 'react';
import StickyNote from './StickyNote';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getVariant = () => {
    switch (type) {
      case 'success': return 'green';
      case 'error': return 'pink';
      case 'warning': return 'default';
      case 'info': return 'blue';
      default: return 'blue';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
      <StickyNote variant={getVariant()} className="shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0 mt-0.5">{getIcon()}</span>
          <div className="flex-1">
            <p className="text-text-primary text-sm font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-accent hover:text-text-primary transition-colors ml-2 flex-shrink-0"
          >
            ×
          </button>
        </div>
      </StickyNote>
    </div>
  );
};

export default Toast;
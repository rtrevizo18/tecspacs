import React from 'react';

interface OutlineButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const OutlineButton: React.FC<OutlineButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onClick,
  children,
  className = '',
  disabled = false
}) => {
  const variantClasses = {
    primary: 'border-pen-black text-text-primary hover:bg-gray-50',
    secondary: 'border-text-accent text-text-accent hover:bg-gray-50',
    danger: 'border-red-500 text-red-500 hover:bg-red-50'
  };

  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        border-2 rounded-lg font-bold transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
import React from 'react';

interface NotebookInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const NotebookInput: React.FC<NotebookInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-baseline">
        <span className="text-text-primary font-medium mr-2 min-w-fit">
          {label}:
        </span>
        <div className="flex-1 relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 outline-none text-text-primary placeholder-text-accent py-1 px-1"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to right,
                transparent,
                transparent 4px,
                #000000 4px,
                #000000 8px
              )`,
              backgroundPosition: '0 100%',
              backgroundSize: '100% 1px',
              backgroundRepeat: 'repeat-x',
              paddingBottom: '2px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotebookInput;
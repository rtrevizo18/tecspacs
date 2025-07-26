import React from 'react';

interface UnderlineInputProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UnderlineInput: React.FC<UnderlineInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-text-primary font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b-2 border-pen-black bg-transparent px-0 py-2 text-text-primary placeholder-text-accent focus:outline-none focus:border-b-4"
      />
    </div>
  );
};

export default UnderlineInput;
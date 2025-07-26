import React from 'react';

interface LanguageTagProps {
  language: string;
  removable?: boolean;
  onRemove?: () => void;
}

const LanguageTag: React.FC<LanguageTagProps> = ({
  language,
  removable = false,
  onRemove
}) => {
  const getVariantColor = (lang: string) => {
    const hash = lang.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = ['bg-sticky-default', 'bg-sticky-pink', 'bg-sticky-blue', 'bg-sticky-green'];
    return variants[hash % variants.length];
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
        border border-pen-black ${getVariantColor(language)}
        text-text-primary
      `}
    >
      {language}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-text-accent hover:text-text-primary"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default LanguageTag;
import React from "react";

interface LanguageTagProps {
  language: string;
  removable?: boolean;
  onRemove?: () => void;
}

const LanguageTag: React.FC<LanguageTagProps> = ({
  language,
  removable = false,
  onRemove,
}) => {
  const getVariantColor = (lang: string) => {
    const hash = lang
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = [
      "bg-sticky-default",
      "bg-sticky-pink",
      "bg-sticky-blue",
      "bg-sticky-green",
    ];
    return variants[hash % variants.length];
  };

  return (
    <span
      className={`
        relative inline-flex items-center gap-1 pl-5 pr-3 py-1 text-xs font-medium
        border border-pen-black 
        text-text-primary ${getVariantColor(language)}
      `}
    >
      <span className="absolute left-0 top-0 h-full w-3 bg-white/80 border-r border-pen-black" />

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

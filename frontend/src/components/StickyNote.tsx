import React from "react";

interface StickyNoteProps {
  variant?: "default" | "pink" | "blue" | "green";
  size?: "small" | "medium" | "large";
  shadow?: boolean;
  children: React.ReactNode;
  className?: string;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  variant = "default",
  size = "medium",
  shadow = true,
  children,
  className = "",
}) => {
  const variantClasses = {
    default: "bg-sticky-default",
    pink: "bg-sticky-pink",
    blue: "bg-sticky-blue",
    green: "bg-sticky-green",
  };

  const sizeClasses = {
    small: "p-3 text-sm",
    medium: "p-4 text-base",
    large: "p-6 text-lg",
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${shadow ? "shadow-sticky" : ""}
        border border-pen-black
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default StickyNote;

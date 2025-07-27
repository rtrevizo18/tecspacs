import React from "react";
import StickyNote from "./StickyNote";

interface LoadingCardProps {
  message?: string;
  variant?: "default" | "pink" | "blue" | "green";
  size?: "small" | "medium" | "large";
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  message = "Loading...",
  variant = "blue",
  size = "medium",
}) => {
  return (
    <StickyNote variant={variant} size={size} className="text-center">
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-text-primary font-medium text-base">{message}</p>

        <div className="flex gap-1 mt-3">
          <div className="w-1.5 h-1.5 bg-text-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-text-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-text-accent rounded-full animate-bounce"></div>
        </div>
      </div>
    </StickyNote>
  );
};

export default LoadingCard;

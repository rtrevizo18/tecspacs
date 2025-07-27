import React from 'react';
import StickyNote from './StickyNote';

interface LoadingCardProps {
  message?: string;
  variant?: 'default' | 'pink' | 'blue' | 'green';
  size?: 'small' | 'medium' | 'large';
}

const LoadingCard: React.FC<LoadingCardProps> = ({ 
  message = 'Loading...', 
  variant = 'blue',
  size = 'medium'
}) => {
  return (
    <StickyNote variant={variant} size={size} className="text-center">
      <div className="flex flex-col items-center justify-center p-6">
        {/* Spinning loader */}
        <div className="relative mb-4">
          <div className="w-8 h-8 border-3 border-pen-black border-t-transparent rounded-full animate-spin"></div>
          {/* Inner dot for more visual appeal */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pen-black rounded-full"></div>
        </div>
        
        <p className="text-text-primary font-medium text-base">
          {message}
        </p>
        
        {/* Optional loading dots animation */}
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
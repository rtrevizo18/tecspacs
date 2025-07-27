import { useEffect } from 'react';

export const usePenCursor = () => {
  useEffect(() => {
    // Set the cursor for the entire document
    const setCursor = () => {
      const penCursor = "url('/Pen.png') 16 16, auto";
      const penPointer = "url('/Pen.png') 16 16, pointer";
      const penText = "url('/Pen.png') 16 16, text";

      // Apply to body and all elements
      document.body.style.cursor = penCursor;
      document.documentElement.style.cursor = penCursor;

      // Create a style element to apply cursor to all elements
      const style = document.createElement('style');
      style.textContent = `
        * {
          cursor: ${penCursor} !important;
        }
        
        button, a, input[type="button"], input[type="submit"], input[type="reset"], 
        select, [role="button"], [tabindex], .clickable {
          cursor: ${penPointer} !important;
        }
        
        input[type="text"], input[type="email"], input[type="password"], 
        input[type="search"], textarea, [contenteditable] {
          cursor: ${penText} !important;
        }
      `;
      
      // Add the style to the head
      document.head.appendChild(style);

      // Store reference to remove later
      return style;
    };

    const styleElement = setCursor();

    // Cleanup function
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);
};
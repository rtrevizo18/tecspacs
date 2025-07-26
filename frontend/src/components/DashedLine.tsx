import React from "react";

interface DashedLineProps {
  text: string;
  className?: string;
}

const DashedLine: React.FC<DashedLineProps> = ({ text, className = "" }) => {
  return (
    <div
      className={`text-text-accent text-base mb-2 relative ${className}`}
      style={{
        textDecorationLine: "underline",
        textDecorationStyle: "dashed",
        textDecorationColor: "#000000",
        textDecorationThickness: "1px",
        textUnderlineOffset: "2px",
      }}
    >
      {text}
    </div>
  );
};

export default DashedLine;

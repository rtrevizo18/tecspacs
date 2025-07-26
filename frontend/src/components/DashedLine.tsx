import React from "react";

interface DashedLineProps {
  text: string;
}

const DashedLine: React.FC<DashedLineProps> = ({ text }) => {
  return (
    <div
      className="text-text-accent text-sm mb-2 relative"
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

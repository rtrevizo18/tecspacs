import React from "react";

interface TypeBookmarkProps {
  type: "TEC" | "PAC";
}

const TypeBookmark: React.FC<TypeBookmarkProps> = ({ type }) => {
  const getTypeColor = (type: "TEC" | "PAC") => {
    return type === "TEC" ? "bg-white" : "bg-black";
  };

  const getTextColor = (type: "TEC" | "PAC") => {
    return type === "TEC" ? "text-black" : "text-white";
  };

  const getBrackets = (type: "TEC" | "PAC") => {
    return type === "TEC" ? "{ }" : "[ ]";
  };

  return (
    <div
      className={`
        absolute -top-1 -right-0 z-0
        ${getTypeColor(type)} bg-opacity-50
        border border-pen-black
        ${getTextColor(type)} text-xs font-bold
        px-3 py-2
        shadow-md
      `}
    >
      {getBrackets(type)} {type}
    </div>
  );
};

export default TypeBookmark;

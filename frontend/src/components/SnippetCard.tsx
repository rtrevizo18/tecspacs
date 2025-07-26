import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "./StickyNote";
import LanguageTag from "./LanguageTag";
import { Snippet, User } from "../types";
import DashedLine from "./DashedLine";
interface SnippetCardProps {
  snippet: Snippet;
  authorName: string;
  authorInitial?: string;
}

const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  authorName,
  authorInitial,
}) => {
  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const truncateCode = (code: string, maxLines: number = 6) => {
    const lines = code.split("\n");
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join("\n") + "\n...";
    }
    return code;
  };
  // random for now might change
  const getRandomVariant = () => {
    const variants = ["default", "pink", "blue", "green"] as const;
    return variants[Math.floor(Math.random() * variants.length)];
  };

  return (
    <Link to={`/view/${snippet.id}`}>
      <div className="flex items-center justify-between text-sm text-text-accent mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold">
            {authorInitial}
          </div>
          <div className="font-bold">{authorName}</div>
          <span>{formatDistanceToNow(snippet.createdAt)} ago</span>
        </div>

        <button className="text-text-accent hover:text-red-500 text-lg">
          ♡
        </button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {snippet.tags.map((tag) => (
          <LanguageTag key={tag} language={tag.trim()} />
        ))}
      </div>

      <StickyNote
        variant={getRandomVariant()}
        className="h-64 transition-transform hover:scale-105 cursor-pointer flex flex-col"
      >
        <h3 className="font-bold text-text-primary text-lg">
          {truncateTitle(snippet.title)}
        </h3>

        <DashedLine text={snippet.description} />

        {/* Code Preview */}
        <div className="mt-4 flex-1 bg-white border border-pen-black rounded p-2 overflow-auto">
          <pre className="text-xs font-code text-text-primary whitespace-pre-wrap break-words">
            {truncateCode(snippet.code)}
          </pre>
        </div>
      </StickyNote>
    </Link>
  );
};

export default SnippetCard;

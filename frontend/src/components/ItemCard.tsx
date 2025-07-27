import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "./StickyNote";
import LanguageTag from "./LanguageTag";
import TypeBookmark from "./TypeBookmark";
import { TEC, PAC } from "../types";
import DashedLine from "./DashedLine";
import { getCreatedByDisplayName, getCreatedByDisplayInitial } from "../utils/userUtils";

interface ItemCardProps {
  item: TEC | PAC;
  type: 'TEC' | 'PAC';
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  type,
}) => {
  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const truncateContent = (content: string, maxLines: number = 6) => {
    const lines = content.split("\n");
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join("\n") + "\n...";
    }
    return content;
  };

  const getRandomVariant = () => {
    const variants = ["default", "pink", "blue", "green"] as const;
    return variants[Math.floor(Math.random() * variants.length)];
  };

  const isTEC = type === 'TEC';
  const isPAC = type === 'PAC';
  const tecItem = item as TEC;
  const pacItem = item as PAC;
  
  // Get display name and initial using utility functions
  const displayName = getCreatedByDisplayName(item.createdBy);
  const displayInitial = getCreatedByDisplayInitial(item.createdBy);

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-text-accent mb-2">
        <div className="flex items-center gap-2">
          <Link to={`/user/${item.createdBy._id}`}>
            <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
              {displayInitial}
            </div>
          </Link>
          <Link
            to={`/user/${item.createdBy._id}`}
            className="font-bold hover:underline"
          >
            {displayName}
          </Link>
          <span>{formatDistanceToNow(new Date(item.createdAt))} ago</span>
        </div>


        {/* Temporarily disabled save functionality */}
        {/* <button className="text-text-accent hover:opacity-80 transition-opacity opacity-50 cursor-not-allowed">
          <img src="/bookmark.png" alt="Bookmark" className="w-5 h-5" />
        </button> */}
      </div>
      
      <div className="mb-3 flex flex-wrap gap-2">
        {isTEC && tecItem.tags.map((tag) => (
          <LanguageTag key={tag} language={tag.trim()} />
        ))}
        {isPAC && pacItem.dependencies.map((dep) => (
          <LanguageTag key={dep} language={dep.trim()} />
        ))}
      </div>

      <Link to={isTEC ? `/view/${item._id}` : `/view-pac/${item._id}`}>
        <StickyNote
          variant={getRandomVariant()}
          className="h-64 transition-transform hover:scale-105 cursor-pointer flex flex-col relative"
        >
          {/* Type Bookmark */}
          <TypeBookmark type={type} />
          
          <h3 className="font-bold text-text-primary text-lg">
            {truncateTitle(isTEC ? tecItem.title : pacItem.name)}
          </h3>

          <DashedLine text={item.description} />

          {/* Content Preview */}
          <div className={`mt-4 flex-1 bg-white border border-pen-black rounded p-2 overflow-auto ${isTEC ? 'notebook-grid' : 'notebook-lines'}`}>
            {isTEC ? (
              <pre className="text-xs font-code text-text-primary whitespace-pre-wrap break-words">
                {truncateContent(tecItem.content)}
              </pre>
            ) : (
              <div className="text-xs text-text-primary">
                <div className="mb-2">
                  <strong>Files:</strong> {pacItem.files.slice(0, 3).join(", ")}
                  {pacItem.files.length > 3 && ` +${pacItem.files.length - 3} more`}
                </div>
                <div>
                  <strong>Dependencies:</strong> {pacItem.dependencies.slice(0, 3).join(", ")}
                  {pacItem.dependencies.length > 3 && ` +${pacItem.dependencies.length - 3} more`}
                </div>
              </div>
            )}
          </div>
        </StickyNote>
      </Link>
    </div>
  );
};

export default ItemCard;
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "../components/StickyNote";
import CodeBox from "../components/CodeBox";
import LanguageTag from "../components/LanguageTag";
import TypeBookmark from "../components/TypeBookmark";
import OutlineButton from "../components/OutlineButton";
import AIPanel from "../components/AIPanel";
import {
  getSnippetById,
  getCurrentUser,
  getTECById,
  getUserById,
} from "../data/mockData";
import { TEC, Snippet } from "../types";
import DashedLine from "../components/DashedLine";

const ViewSnippet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const snippet = id ? getSnippetById(id) : null;
  const tec = id ? getTECById(id) : null;
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  // AI Results State
  const [aiResults, setAiResults] = useState<
    Array<{
      id: string;
      type: "summary" | "improvement";
      title: string;
      content: string;
    }>
  >([]);

  // Determine what type of content we're viewing
  const content = snippet || tec;
  const isLegacySnippet = !!snippet;
  const isTEC = !!tec;

  // Look up author for TECs
  const tecAuthor = isTEC ? getUserById((content as TEC).author) : null;

  if (!content) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="pink">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Snippet Not Found
          </h2>
          <p className="text-text-accent">
            The snippet you're looking for doesn't exist or has been removed.
          </p>
        </StickyNote>
      </div>
    );
  }

  const isOwner =
    currentUser &&
    ((isLegacySnippet &&
      (currentUser.id === (content as Snippet).authorId ||
        currentUser.auth0Id === (content as Snippet).authorId)) ||
      (isTEC &&
        (currentUser.id === (content as TEC).author ||
          currentUser.auth0Id === (content as TEC).author)));
  const isSaved =
    currentUser &&
    isLegacySnippet &&
    currentUser.savedSnippets?.includes((content as Snippet).id);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Info Row - Outside sticky note */}
        <div className="flex items-center justify-between text-sm text-text-accent mb-2">
          <div className="flex items-center gap-2">
            <Link
              to={`/user/${
                isLegacySnippet
                  ? (content as Snippet).authorId
                  : (content as TEC).author
              }`}
            >
              <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
                {isLegacySnippet
                  ? (content as Snippet).authorName.charAt(0).toUpperCase()
                  : tecAuthor?.name.charAt(0).toUpperCase() || "U"}
              </div>
            </Link>
            <Link
              to={`/user/${
                isLegacySnippet
                  ? (content as Snippet).authorId
                  : (content as TEC).author
              }`}
              className="font-bold hover:underline"
            >
              {isLegacySnippet
                ? (content as Snippet).authorName
                : tecAuthor?.name || "Unknown"}
            </Link>
            <span>
              {formatDistanceToNow(
                isLegacySnippet
                  ? (content as Snippet).createdAt
                  : new Date((content as TEC).createdAt)
              )}{" "}
              ago
            </span>
            {((isLegacySnippet && !(content as Snippet).isPublic) ||
              (isTEC && (content as TEC).isPublic === false)) && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">Private</span>
              </>
            )}
          </div>

          {/* Heart and Action Buttons - Outside sticky note */}
          <div className="flex items-center gap-2">
            <button
              className={`transition-opacity ${
                isSaved ? "opacity-100" : "opacity-60 hover:opacity-80"
              }`}
            >
              <img
                src="/bookmark.png"
                alt="Bookmark"
                className={`w-6 h-6 ${isSaved ? "filter-none" : "grayscale"}`}
              />
            </button>
            {isOwner && (
              <>
                <OutlineButton
                  size="small"
                  onClick={() =>
                    navigate(
                      `/edit/${
                        isLegacySnippet
                          ? (content as Snippet).id
                          : (content as TEC)._id
                      }`
                    )
                  }
                >
                  Edit
                </OutlineButton>
                <OutlineButton size="small" variant="danger" onClick={() => {}}>
                  Delete
                </OutlineButton>
              </>
            )}
            <OutlineButton size="small" variant="secondary" onClick={() => {}}>
              Fork
            </OutlineButton>
          </div>
        </div>

        {/* Tags - Outside sticky note */}
        <div className="flex flex-wrap gap-2 mb-3">
          {isLegacySnippet
            ? (content as Snippet).tags.map((tag) => (
                <LanguageTag key={tag} language={tag.trim()} />
              ))
            : (content as TEC).tags.map((tag) => (
                <LanguageTag key={tag} language={tag.trim()} />
              ))}
        </div>

        {/* Main Content - Inside sticky note */}
        <StickyNote variant="default" className="mb-6 relative">
          {/* Type Bookmark - only show for TEC items */}
          {isTEC && <TypeBookmark type="TEC" />}

          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {isLegacySnippet
              ? (content as Snippet).title
              : (content as TEC).title}
          </h1>

          {/* Description if available */}
          {content.description && <DashedLine text={content.description} />}

          {/* Code */}
          <div className="mb-4">
            <CodeBox
              code={
                isLegacySnippet
                  ? (content as Snippet).code
                  : (content as TEC).content
              }
              language={
                isLegacySnippet
                  ? (content as Snippet).language
                  : (content as TEC).language
              }
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-text-accent border-t border-pen-black pt-4">
            <div className="flex gap-4">
              <span>👁️ 42 views</span>
              <span className="flex items-center gap-1">
                <img src="/bookmark.png" alt="Bookmark" className="w-4 h-4" />8
                saves
              </span>
              <span>🍴 3 forks</span>
            </div>
            <div>
              Last updated{" "}
              {formatDistanceToNow(
                isLegacySnippet
                  ? (content as Snippet).updatedAt
                  : new Date((content as TEC).updatedAt)
              )}{" "}
              ago
            </div>
          </div>
        </StickyNote>

        {/* Related Snippets */}
        <StickyNote variant="blue" size="small">
          <h3 className="font-bold text-text-primary mb-3">
            More from{" "}
            {isLegacySnippet
              ? (content as Snippet).authorName
              : tecAuthor?.name || "Unknown"}
          </h3>
          <div className="space-y-2">
            <Link
              to="/view/mock-1"
              className="group flex items-center justify-between text-sm text-text-primary hover:text-text-accent transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                  React Custom Hook for API
                </span>
              </div>
              <span className="text-text-accent text-xs ml-2">2 days ago</span>
            </Link>
            <Link
              to="/view/mock-2"
              className="group flex items-center justify-between text-sm text-text-primary hover:text-text-accent transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                  Express.js Basic Server Setup
                </span>
              </div>
              <span className="text-text-accent text-xs ml-2">1 week ago</span>
            </Link>
            <Link
              to="/view/mock-3"
              className="group flex items-center justify-between text-sm text-text-primary hover:text-text-accent transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                  Python List Comprehension Examples
                </span>
              </div>
              <span className="text-text-accent text-xs ml-2">2 weeks ago</span>
            </Link>
          </div>
        </StickyNote>
      </div>

      {/* Floating AI Assistant - Only for TECs */}
      {isTEC && (
        <AIPanel 
          type="TEC" 
          itemId={(content as TEC)._id}
          onSummarize={(id) => console.log('Summarizing TEC:', id)}
          onImprove={(id) => console.log('Improving TEC:', id)}
        />
      )}
    </div>
  );
};

export default ViewSnippet;

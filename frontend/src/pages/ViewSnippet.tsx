import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "../components/StickyNote";
import CodeBox from "../components/CodeBox";
import LanguageTag from "../components/LanguageTag";
import OutlineButton from "../components/OutlineButton";
import { getSnippetById, getCurrentUser } from "../data/mockData";
import DashedLine from "../components/DashedLine";

const ViewSnippet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const snippet = id ? getSnippetById(id) : null;
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  if (!snippet) {
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

  const isOwner = currentUser && currentUser.id === snippet.authorId;
  const isSaved = currentUser && currentUser.savedSnippets.includes(snippet.id);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Info Row - Outside sticky note */}
        <div className="flex items-center justify-between text-sm text-text-accent mb-2">
          <div className="flex items-center gap-2">
            <Link to={`/user/${snippet.authorId}`}>
              <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
                {snippet.authorName.charAt(0).toUpperCase()}
              </div>
            </Link>
            <Link
              to={`/user/${snippet.authorId}`}
              className="font-bold hover:underline"
            >
              {snippet.authorName}
            </Link>
            <span>{formatDistanceToNow(snippet.createdAt)} ago</span>
            {!snippet.isPublic && (
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
                <OutlineButton size="small" onClick={() => navigate(`/edit/${snippet.id}`)}>
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
          {snippet.tags.map((tag) => (
            <LanguageTag key={tag} language={tag.trim()} />
          ))}
        </div>

        {/* Main Content - Inside sticky note */}
        <StickyNote variant="default" className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {snippet.title}
          </h1>

          {/* Description if available */}
          {snippet.description && <DashedLine text={snippet.description} />}

          {/* Code */}
          <div className="mb-4">
            <CodeBox code={snippet.code} language={snippet.language} />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-text-accent border-t border-pen-black pt-4">
            <div className="flex gap-4">
              <span>👁️ 42 views</span>
              <span className="flex items-center gap-1">
                <img src="/bookmark.png" alt="Bookmark" className="w-4 h-4" />
                8 saves
              </span>
              <span>🍴 3 forks</span>
            </div>
            <div>Last updated {formatDistanceToNow(snippet.updatedAt)} ago</div>
          </div>
        </StickyNote>

        {/* Related Snippets */}
        <StickyNote variant="blue" size="small">
          <h3 className="font-bold text-text-primary mb-3">
            More from {snippet.authorName}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-primary">
                React Custom Hook for API
              </span>
              <span className="text-text-accent">2 days ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-primary">
                Express.js Basic Server Setup
              </span>
              <span className="text-text-accent">1 week ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-primary">
                Python List Comprehension Examples
              </span>
              <span className="text-text-accent">2 weeks ago</span>
            </div>
          </div>
        </StickyNote>
      </div>
    </div>
  );
};

export default ViewSnippet;

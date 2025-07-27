import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "../components/StickyNote";
import CodeBox from "../components/CodeBox";
import LanguageTag from "../components/LanguageTag";
import TypeBookmark from "../components/TypeBookmark";
import OutlineButton from "../components/OutlineButton";
import AIPanel from "../components/AIPanel";
import { getSnippetById, getUserById } from "../data/mockData";
import { TEC, Snippet, User } from "../types";
import DashedLine from "../components/DashedLine";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiService } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { getCreatedByDisplayName, getCreatedByDisplayInitial } from "../utils/userUtils";

const ViewSnippet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, accessToken } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // State for real TEC data
  const [tec, setTec] = useState<TEC | null>(null);
  const [userTecs, setUserTecs] = useState<TEC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Fallback to legacy snippet data for backward compatibility
  const snippet = id ? getSnippetById(id) : null;

  // AI Results State
  const [aiResults, setAiResults] = useState<
    Array<{
      id: string;
      type: "summary" | "improvement";
      title: string;
      content: string;
    }>
  >([]);

  // Fetch TEC data from API
  useEffect(() => {
    const fetchTEC = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch as TEC first
        const fetchedTec = await apiService.getTecById(id);
        setTec(fetchedTec);
        
        // Author info is now handled by utility functions using createdBy data

        // Fetch user's other TECs
        try {
          const userTecsResponse = await apiService.getUserTecs(fetchedTec.createdBy._id);
          // Filter out the current TEC and show only other TECs
          const otherTecs = userTecsResponse.tecs.filter(t => t._id !== fetchedTec._id);
          setUserTecs(otherTecs);
        } catch (tecsError) {
          console.warn('Could not fetch user TECs:', tecsError);
          setUserTecs([]);
        }
        
      } catch (error) {
        console.error('Error fetching TEC:', error);
        setError('TEC not found');
        // Don't set tec to null here - let it fall back to snippet data
      } finally {
        setIsLoading(false);
      }
    };

    fetchTEC();
  }, [id]);

  const handleDeleteTEC = async () => {
    if (!tec || !currentUser) return;
    
    try {
      if (!accessToken) {
        showError('Please log in to delete this TEC');
        return;
      }
      
      await apiService.deleteTec(accessToken, tec._id);
      showSuccess('TEC deleted successfully!');
      navigate('/'); // Navigate back to dashboard
    } catch (error) {
      console.error('Error deleting TEC:', error);
      showError('Failed to delete TEC. Please try again.');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleFork = async () => {
    if (!currentUser || !accessToken) {
      showError('Please log in to fork this TEC');
      return;
    }

    if (!isTEC) {
      showError('Forking is only available for TECs');
      return;
    }

    try {
      const tecContent = content as TEC;
      
      // Create a new TEC with the current content but new ownership
      const forkedTec = await apiService.createTec(accessToken, {
        title: `${tecContent.title} (Forked)`,
        description: tecContent.description,
        language: tecContent.language,
        content: tecContent.content,
        tags: [...tecContent.tags]
      });

      showSuccess('TEC forked successfully!');
      navigate(`/view/${forkedTec._id}`);
    } catch (error) {
      console.error('Error forking TEC:', error);
      showError('Failed to fork TEC. Please try again.');
    }
  };

  // Determine what type of content we're viewing
  const content = tec || snippet; // Prioritize TEC data over legacy snippet
  const isLegacySnippet = !tec && !!snippet;
  const isTEC = !!tec;
  
  // Get display names using utility functions
  const displayName = isTEC && tec 
    ? getCreatedByDisplayName(tec.createdBy)
    : isLegacySnippet && snippet 
      ? snippet.authorName 
      : 'Unknown User';
      
  const displayInitial = isTEC && tec
    ? getCreatedByDisplayInitial(tec.createdBy)
    : isLegacySnippet && snippet
      ? snippet.authorName.charAt(0).toUpperCase()
      : 'U';

  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="blue">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Loading TEC...
          </h2>
        </StickyNote>
      </div>
    );
  }

  // Show error or not found
  if (!content) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="pink">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {error || "Snippet Not Found"}
          </h2>
          <p className="text-text-accent">
            The snippet you're looking for doesn't exist or has been removed.
          </p>
          {error && (
            <p className="text-text-accent text-sm mt-2">
              Error: {error}
            </p>
          )}
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
        (currentUser.id === (content as TEC).createdBy._id ||
          currentUser.auth0Id === (content as TEC).createdBy._id)));
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
                  : (content as TEC).createdBy._id
              }`}
            >
              <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
                {displayInitial}
              </div>
            </Link>
            <Link
              to={`/user/${
                isLegacySnippet
                  ? (content as Snippet).authorId
                  : (content as TEC).createdBy._id
              }`}
              className="font-bold hover:underline"
            >
              {displayName}
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
                  onClick={() => {
                    if (isTEC) {
                      navigate(`/edit-tec/${(content as TEC)._id}`);
                    } else {
                      navigate(`/edit/${(content as Snippet).id}`);
                    }
                  }}
                >
                  Edit
                </OutlineButton>
                <OutlineButton size="small" variant="danger" onClick={confirmDelete}>
                  Delete
                </OutlineButton>
              </>
            )}
            {!isOwner && (
              <OutlineButton size="small" variant="secondary" onClick={handleFork}>
                Fork
              </OutlineButton>
            )}
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
            More from {displayName}
          </h3>
          <div className="space-y-2">
            {!isLegacySnippet && userTecs.length > 0 ? (
              userTecs.slice(0, 3).map((userTec) => (
                <Link
                  key={userTec._id}
                  to={`/view/${userTec._id}`}
                  className="group flex items-center justify-between text-sm text-text-primary hover:text-text-accent transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {userTec.title}
                    </span>
                  </div>
                  <span className="text-text-accent text-xs ml-2">
                    {formatDistanceToNow(new Date(userTec.createdAt))} ago
                  </span>
                </Link>
              ))
            ) : !isLegacySnippet ? (
              <div className="flex items-center justify-center text-text-accent text-sm py-4">
                <span>Coming soon...</span>
              </div>
            ) : (
              // Legacy snippet fallback - keep existing hardcoded data for now
              <>
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
              </>
            )}
          </div>
        </StickyNote>
      </div>

      {/* Floating AI Assistant - Only for TECs */}
      {isTEC && (
        <AIPanel 
          type="TEC" 
          itemId={(content as TEC)._id}
          onSummarize={() => {/* TEC summarized */}}
          onImprove={() => {/* TEC improved */}}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete TEC"
        message={`Are you sure you want to delete "${tec?.title || 'this TEC'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeleteTEC();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ViewSnippet;

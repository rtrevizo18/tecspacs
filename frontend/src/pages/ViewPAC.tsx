import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "../components/StickyNote";
import LanguageTag from "../components/LanguageTag";
import TypeBookmark from "../components/TypeBookmark";
import OutlineButton from "../components/OutlineButton";
import AIPanel from "../components/AIPanel";
import { getPACById, getUserById } from "../data/mockData";
import DashedLine from "../components/DashedLine";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiService } from "../services/api";
import { PAC, User } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";
import { getCreatedByDisplayName, getCreatedByDisplayInitial } from "../utils/userUtils";

const ViewPAC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, accessToken } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // State for real PAC data
  const [pac, setPac] = useState<PAC | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [userPacs, setUserPacs] = useState<PAC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Fallback to mock data for backward compatibility
  const mockPac = id ? getPACById(id) : null;

  // Fetch PAC data from API
  useEffect(() => {
    const fetchPAC = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch as PAC first
        const fetchedPac = await apiService.getPacById(id);
        setPac(fetchedPac);
        
        // Extract author info from createdBy object - no need for separate API call
        setAuthor({
          _id: fetchedPac.createdBy._id,
          auth0Id: fetchedPac.createdBy._id,
          username: fetchedPac.createdBy.username,
          email: '',
          createdAt: '',
          updatedAt: '',
          tecs: [],
          pacs: []
        });

        // Fetch user's other PACs
        try {
          const userPacsResponse = await apiService.getUserPacs(fetchedPac.createdBy._id);
          // Filter out the current PAC and show only other PACs
          const otherPacs = userPacsResponse.pacs.filter(p => p._id !== fetchedPac._id);
          setUserPacs(otherPacs);
        } catch (pacsError) {
          console.warn('Could not fetch user PACs:', pacsError);
          setUserPacs([]);
        }
        
      } catch (error) {
        console.error('Error fetching PAC:', error);
        setError('PAC not found');
        // Fall back to mock data if available
        if (mockPac) {
          setPac(mockPac);
          const mockAuthor = getUserById((mockPac as any).author);
          setAuthor(mockAuthor || null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPAC();
  }, [id, mockPac]);

  const handleDeletePAC = async () => {
    if (!pac || !currentUser) return;
    
    try {
      if (!accessToken) {
        showError('Please log in to delete this PAC');
        return;
      }
      
      await apiService.deletePac(accessToken, pac._id);
      showSuccess('PAC deleted successfully!');
      navigate('/'); // Navigate back to dashboard
    } catch (error) {
      console.error('Error deleting PAC:', error);
      showError('Failed to delete PAC. Please try again.');
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleFork = async () => {
    if (!currentUser || !accessToken) {
      showError('Please log in to fork this PAC');
      return;
    }

    if (!pac) {
      showError('PAC data not available for forking');
      return;
    }

    try {
      // Create a new PAC with the current content but new ownership
      const forkedPac = await apiService.createPac(accessToken, {
        name: `${pac.name} (Forked)`,
        description: pac.description,
        dependencies: [...pac.dependencies],
        files: [...pac.files]
      });

      showSuccess('PAC forked successfully!');
      navigate(`/view-pac/${forkedPac._id}`);
    } catch (error) {
      console.error('Error forking PAC:', error);
      showError('Failed to fork PAC. Please try again.');
    }
  };

  // Use real PAC data or fall back to mock
  const currentPac = pac || mockPac;
  
  // Get display names using utility functions
  const displayName = pac 
    ? getCreatedByDisplayName(pac.createdBy)
    : author?.username || author?.name || author?.email || 'Unknown User';
    
  const displayInitial = pac
    ? getCreatedByDisplayInitial(pac.createdBy)
    : (author?.username || author?.name || author?.email || 'U').charAt(0).toUpperCase();

  // Show loading state
  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="blue">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Loading PAC...
          </h2>
        </StickyNote>
      </div>
    );
  }

  if (!currentPac) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="pink">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {error || "PAC Not Found"}
          </h2>
          <p className="text-text-accent">
            The PAC you're looking for doesn't exist or has been removed.
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

  const isOwner = currentUser && pac && (currentUser.id === pac.createdBy._id || currentUser.auth0Id === pac.createdBy._id);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Info Row - Outside sticky note */}
        <div className="flex items-center justify-between text-sm text-text-accent mb-2">
          <div className="flex items-center gap-2">
            <Link to={`/user/${pac ? pac.createdBy._id : (currentPac as any)?.author}`}>
              <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
                {displayInitial}
              </div>
            </Link>
            <Link
              to={`/user/${pac ? pac.createdBy._id : (currentPac as any)?.author}`}
              className="font-bold hover:underline"
            >
              {displayName}
            </Link>
            <span>{formatDistanceToNow(new Date(currentPac.createdAt))} ago</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <OutlineButton size="small" onClick={() => navigate(`/edit-pac/${currentPac._id}`)}>
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

        {/* Dependencies Tags - Outside sticky note */}
        <div className="flex flex-wrap gap-2 mb-3">
          {currentPac.dependencies.map((dep) => (
            <LanguageTag key={dep} language={dep.trim()} />
          ))}
        </div>

        {/* Main Content - Inside sticky note */}
        <StickyNote variant="blue" className="mb-6 relative">
          {/* Type Bookmark */}
          <TypeBookmark type="PAC" />
          
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {currentPac.name}
          </h1>

          {/* Description */}
          <DashedLine text={currentPac.description} />

          {/* Package Details */}
          <div className="mb-4 bg-white border border-pen-black rounded p-4 notebook-lines">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dependencies */}
              <div>
                <h3 className="font-bold text-text-primary mb-2">Dependencies ({currentPac.dependencies.length})</h3>
                <div className="space-y-1 text-sm">
                  {currentPac.dependencies.length > 0 ? (
                    currentPac.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pen-black rounded-full"></span>
                        <code className="bg-gray-100 px-1 rounded text-xs">{dep}</code>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-accent">No dependencies</span>
                  )}
                </div>
              </div>

              {/* Files */}
              <div>
                <h3 className="font-bold text-text-primary mb-2">Files ({currentPac.files.length})</h3>
                <div className="space-y-1 text-sm">
                  {currentPac.files.length > 0 ? (
                    currentPac.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pen-black rounded-full"></span>
                        <code className="bg-gray-100 px-1 rounded text-xs">{file}</code>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-accent">No files specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-text-accent border-t border-pen-black pt-4">
            <div className="flex gap-4">
              <span>👁️ 12 views</span>
              <span>📦 {currentPac.dependencies.length} dependencies</span>
              <span>📁 {currentPac.files.length} files</span>
            </div>
            <div>Last updated {formatDistanceToNow(new Date(currentPac.updatedAt))} ago</div>
          </div>
        </StickyNote>

        {/* Related PACs */}
        <StickyNote variant="green" size="small">
          <h3 className="font-bold text-text-primary mb-3">
            More PACs from {displayName}
          </h3>
          <div className="space-y-2">
            {userPacs.length > 0 ? (
              userPacs.slice(0, 3).map((userPac) => (
                <Link
                  key={userPac._id}
                  to={`/view-pac/${userPac._id}`}
                  className="group flex items-center justify-between text-sm text-text-primary hover:text-text-accent transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {userPac.name}
                    </span>
                  </div>
                  <span className="text-text-accent text-xs ml-2">
                    {formatDistanceToNow(new Date(userPac.createdAt))} ago
                  </span>
                </Link>
              ))
            ) : (
              <div className="flex items-center justify-center text-text-accent text-sm py-4">
                <span>Coming soon...</span>
              </div>
            )}
          </div>
        </StickyNote>
      </div>

      {/* Floating AI Assistant */}
      <AIPanel 
        type="PAC" 
        itemId={currentPac._id}
        onSummarize={() => {/* PAC summarized */}}
        onImprove={() => {/* PAC improved */}}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete PAC"
        message={`Are you sure you want to delete "${pac?.name || 'this PAC'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeletePAC();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ViewPAC;
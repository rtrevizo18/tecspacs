import React, { useState } from "react";
import { useParams } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import SnippetCard from "../components/SnippetCard";
import OutlineButton from "../components/OutlineButton";
import { getUserById, mockSnippets, getCurrentUser } from "../data/mockData";

const UserProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const user = getUserById(uid || "");
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.id === user?.id;
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(user?.bio || "");
  const [pinnedSnippets, setPinnedSnippets] = useState<string[]>(
    user?.createdSnippets.slice(0, 3) || []
  );

  const handleSaveBio = () => {
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setEditedBio(user?.bio || "");
    setIsEditingBio(false);
  };

  const handleUnpinSnippet = (snippetId: string) => {
    setPinnedSnippets(prev => prev.filter(id => id !== snippetId));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-sketch-white bg-grid-pattern p-4">
        <div className="container mx-auto max-w-6xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">User not found</h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  const userSnippets = mockSnippets.filter(snippet => snippet.authorId === user.id);
  const featuredSnippets = userSnippets.filter(snippet => pinnedSnippets.includes(snippet.id));
  const regularSnippets = userSnippets.filter(snippet => !pinnedSnippets.includes(snippet.id));

  return (
    <div className="min-h-screen bg-sketch-white bg-grid-pattern p-4">
      <div className="container mx-auto max-w-6xl pt-20">
        <StickyNote variant="blue" size="large" className="mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-pen-black rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-pen-black mb-2">{user.name}</h1>
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full p-2 border-b-2 border-pen-black bg-transparent text-accent text-lg resize-none"
                    placeholder="Add a bio..."
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <OutlineButton variant="primary" size="small" onClick={handleSaveBio}>
                      Save
                    </OutlineButton>
                    <OutlineButton variant="secondary" size="small" onClick={handleCancelBio}>
                      Cancel
                    </OutlineButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-accent text-lg">{user.bio || "No bio available"}</p>
                  {isOwnProfile && (
                    <OutlineButton 
                      variant="secondary" 
                      size="small" 
                      onClick={() => setIsEditingBio(true)}
                    >
                      Edit
                    </OutlineButton>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-accent">
                <p>{userSnippets.length} snippets</p>
                <p>{user.savedSnippets.length} saved</p>
              </div>
            </div>
          </div>
        </StickyNote>

        {featuredSnippets.length > 0 && (
          <div className="mb-8">
            <StickyNote variant="green" className="mb-4">
              <h2 className="text-xl font-bold text-pen-black flex items-center gap-2">
                📌 Featured Snippets
              </h2>
            </StickyNote>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSnippets.map((snippet) => (
                <div key={snippet.id} className="relative">
                  {isOwnProfile && (
                    <button
                      onClick={() => handleUnpinSnippet(snippet.id)}
                      className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Unpin snippet"
                    >
                      ✕
                    </button>
                  )}
                  <SnippetCard 
                    snippet={snippet} 
                    authorName={snippet.authorName}
                    authorInitial={snippet.authorName.charAt(0).toUpperCase()}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {regularSnippets.length > 0 && (
          <div>
            <StickyNote variant="default" className="mb-4">
              <h2 className="text-xl font-bold text-pen-black">All Snippets</h2>
            </StickyNote>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularSnippets.map((snippet) => (
                <SnippetCard 
                  key={snippet.id} 
                  snippet={snippet} 
                  authorName={snippet.authorName}
                  authorInitial={snippet.authorName.charAt(0).toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}

        {userSnippets.length === 0 && (
          <StickyNote variant="pink" className="text-center">
            <h2 className="text-xl font-bold text-pen-black mb-2">No snippets yet</h2>
            <p className="text-accent">This user hasn't created any snippets.</p>
          </StickyNote>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
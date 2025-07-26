import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import OutlineButton from "../components/OutlineButton";
import { getUserById, mockSnippets, getCurrentUser } from "../data/mockData";
import DashedLine from "../components/DashedLine";

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
  const [activeTab, setActiveTab] = useState<"my" | "saved">("my");

  const handleSaveBio = () => {
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setEditedBio(user?.bio || "");
    setIsEditingBio(false);
  };

  const handleUnpinSnippet = (snippetId: string) => {
    setPinnedSnippets((prev) => prev.filter((id) => id !== snippetId));
  };

  if (!user) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-6xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">
              User not found
            </h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  const userSnippets = mockSnippets.filter(
    (snippet) => snippet.authorId === user.id
  );
  const savedSnippets = mockSnippets.filter((snippet) =>
    user.savedSnippets.includes(snippet.id)
  );

  const currentSnippets = activeTab === "my" ? userSnippets : savedSnippets;
  const featuredSnippets = isOwnProfile
    ? activeTab === "my"
      ? userSnippets.filter((snippet) => pinnedSnippets.includes(snippet.id))
      : []
    : userSnippets.slice(0, Math.min(3, userSnippets.length)); // Show first 3 snippets as featured for other users

  const regularSnippets = isOwnProfile
    ? activeTab === "my"
      ? userSnippets.filter((snippet) => !pinnedSnippets.includes(snippet.id))
      : savedSnippets
    : userSnippets; // Show all snippets for other users

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl pt-20">
        <div className="flex gap-8 mb-8">
          {/* Profile Picture - Left */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-pen-black rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Username and Bio - Right */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-pen-black mb-4">
              {user.name}
            </h1>

            <StickyNote variant="blue" size="medium">
              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full p-2 border-b-2 border-pen-black bg-transparent text-accent text-lg resize-none"
                    placeholder="Add a bio..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <OutlineButton
                      variant="primary"
                      size="small"
                      onClick={handleSaveBio}
                    >
                      Save
                    </OutlineButton>
                    <OutlineButton
                      variant="secondary"
                      size="small"
                      onClick={handleCancelBio}
                    >
                      Cancel
                    </OutlineButton>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <DashedLine text={user.bio || "No bio available"} />
                  {isOwnProfile && (
                    <OutlineButton
                      variant="secondary"
                      size="small"
                      onClick={() => setIsEditingBio(true)}
                      className="absolute top-0 right-0"
                    >
                      Edit Bio
                    </OutlineButton>
                  )}
                </div>
              )}
            </StickyNote>
          </div>
        </div>

        {isOwnProfile && (
          <div className="relative mb-6">
            <div className="flex gap-1 items-end border-b-2 border-pen-black">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-6 py-2 font-bold transition-all border border-pen-black rounded-t-md ${
                  activeTab === "my"
                    ? "bg-sticky-default text-pen-black translate-y-[-2px] z-10 border-b-transparent"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                📁 My Snippets ({userSnippets.length})
              </button>

              <button
                onClick={() => setActiveTab("saved")}
                className={`px-6 py-2 font-bold transition-all border border-pen-black rounded-t-md ${
                  activeTab === "saved"
                    ? "bg-sticky-default text-pen-black translate-y-[-2px] z-10 border-b-transparent"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                🔖 Saved Snippets ({savedSnippets.length})
              </button>
            </div>
          </div>
        )}

        {featuredSnippets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-pen-black flex items-center gap-2">
                📌 Featured Snippets
              </h2>
              <div className="flex-1 h-px border-t border-dashed border-pen-black"></div>
            </div>
            <StickyNote variant="green">
              <div className="space-y-1">
                {featuredSnippets.map((snippet) => (
                  <div key={snippet.id} className="flex items-center gap-2">
                    {isOwnProfile && (
                      <button
                        onClick={() => handleUnpinSnippet(snippet.id)}
                        className="w-2 h-2 bg-red-500 hover:bg-red-600 transition-colors flex-shrink-0"
                        title="Unpin snippet"
                      />
                    )}
                    <Link
                      to={`/view/${snippet.id}`}
                      className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors flex-1"
                    >
                      <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                      <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                        {snippet.title}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </StickyNote>
          </div>
        )}

        {regularSnippets.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-pen-black">
                {isOwnProfile
                  ? activeTab === "my"
                    ? "All Snippets"
                    : "Saved Snippets"
                  : "All Snippets"}
              </h2>
              <div className="flex-1 h-px border-t border-dashed border-pen-black"></div>
            </div>
            <StickyNote variant="default">
              <div className="space-y-1">
                {regularSnippets.map((snippet) => (
                  <Link
                    key={snippet.id}
                    to={`/view/${snippet.id}`}
                    className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                  >
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {snippet.title}
                    </span>
                  </Link>
                ))}
              </div>
            </StickyNote>
          </div>
        )}

        {currentSnippets.length === 0 && (
          <StickyNote variant="pink" className="text-center">
            <h2 className="text-xl font-bold text-pen-black mb-2">
              {activeTab === "my" ? "No snippets yet" : "No saved snippets"}
            </h2>
            <p className="text-accent">
              {activeTab === "my"
                ? isOwnProfile
                  ? "You haven't created any snippets yet."
                  : "This user hasn't created any snippets."
                : "You haven't saved any snippets yet."}
            </p>
          </StickyNote>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

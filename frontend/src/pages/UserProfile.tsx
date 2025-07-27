import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import OutlineButton from "../components/OutlineButton";
import {
  getUserById,
  mockSnippets,
  getCurrentUser,
  mockTECs,
  mockPACs,
  getTECById,
  getPACById,
} from "../data/mockData";
import DashedLine from "../components/DashedLine";

const UserProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const user = getUserById(uid || "");
  const currentUser = getCurrentUser();
  const isOwnProfile =
    currentUser?.id === user?.id || currentUser?.auth0Id === user?.auth0Id;

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(user?.bio || "");
  const [pinnedTECs, setPinnedTECs] = useState<string[]>(
    user?.createdTECs?.slice(0, 3) || []
  );
  const [pinnedPACs, setPinnedPACs] = useState<string[]>(
    user?.createdPACs?.slice(0, 2) || []
  );
  const [activeTab, setActiveTab] = useState<"tecs" | "pacs">("tecs");

  const handleSaveBio = () => {
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setEditedBio(user?.bio || "");
    setIsEditingBio(false);
  };

  const handleUnpinTEC = (tecId: string) => {
    setPinnedTECs((prev) => prev.filter((id) => id !== tecId));
  };

  const handleUnpinPAC = (pacId: string) => {
    setPinnedPACs((prev) => prev.filter((id) => id !== pacId));
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

  // Filter user's TECs and PACs
  const userTECs = mockTECs.filter(
    (tec) => tec.author === (user.auth0Id || user.id)
  );
  const userPACs = mockPACs.filter(
    (pac) => pac.author === (user.auth0Id || user.id)
  );

  // Current items based on active tab
  const currentItems = activeTab === "tecs" ? userTECs : userPACs;

  // Featured items (pinned for own profile, first 3 for others)
  const featuredItems = isOwnProfile
    ? activeTab === "tecs"
      ? userTECs.filter((tec) => pinnedTECs.includes(tec._id))
      : userPACs.filter((pac) => pinnedPACs.includes(pac._id))
    : activeTab === "tecs"
    ? userTECs.slice(0, Math.min(3, userTECs.length))
    : userPACs.slice(0, Math.min(3, userPACs.length));

  // Regular items (non-pinned for own profile, remaining items for others)
  const regularItems = isOwnProfile
    ? activeTab === "tecs"
      ? userTECs.filter((tec) => !pinnedTECs.includes(tec._id))
      : userPACs.filter((pac) => !pinnedPACs.includes(pac._id))
    : activeTab === "tecs"
    ? userTECs.slice(Math.min(3, userTECs.length))
    : userPACs.slice(Math.min(3, userPACs.length));

  // Legacy snippet data for compatibility
  const userSnippets = mockSnippets.filter(
    (snippet) => snippet.authorId === (user.id || user.auth0Id)
  );

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

        <div className="relative mb-6">
          <div className="flex gap-1 items-end border-b-2 border-pen-black">
            <button
              onClick={() => setActiveTab("tecs")}
              className={`px-6 py-2 font-bold transition-all border border-pen-black rounded-t-md flex items-center gap-2 ${
                activeTab === "tecs"
                  ? "bg-sticky-default text-pen-black translate-y-[-2px] z-10 border-b-transparent"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <img src="/tec.png" alt="TEC" className="w-4 h-4" />
              {isOwnProfile ? "My TECs" : "TECs"} ({userTECs.length})
            </button>

            <button
              onClick={() => setActiveTab("pacs")}
              className={`px-6 py-2 font-bold transition-all border border-pen-black rounded-t-md flex items-center gap-2 ${
                activeTab === "pacs"
                  ? "bg-sticky-default text-pen-black translate-y-[-2px] z-10 border-b-transparent"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              <img src="/pac.png" alt="PAC" className="w-4 h-4" />
              {isOwnProfile ? "My PACs" : "PACs"} ({userPACs.length})
            </button>
          </div>
        </div>

        {featuredItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-pen-black flex items-center gap-2">
                📌 Featured {activeTab === "tecs" ? "TECs" : "PACs"}
              </h2>
              <div className="flex-1 h-px border-t border-dashed border-pen-black"></div>
            </div>
            <StickyNote variant="green">
              <div className="space-y-1">
                {featuredItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-2">
                    {/* {isOwnProfile && (
                      <button
                        onClick={() => activeTab === "tecs" ? handleUnpinTEC(item._id) : handleUnpinPAC(item._id)}
                        className="w-2 h-2 bg-red-500 hover:bg-red-600 transition-colors flex-shrink-0"
                        title={`Unpin ${activeTab === "tecs" ? "TEC" : "PAC"}`}
                      />
                    )} */}
                    <Link
                      to={
                        activeTab === "tecs"
                          ? `/view/${item._id}`
                          : `/view-pac/${item._id}`
                      }
                      className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors flex-1"
                    >
                      <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                      <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                        {activeTab === "tecs"
                          ? (item as any).title
                          : (item as any).name}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </StickyNote>
          </div>
        )}

        {regularItems.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-pen-black">
                {isOwnProfile
                  ? `All ${activeTab === "tecs" ? "TECs" : "PACs"}`
                  : `All ${activeTab === "tecs" ? "TECs" : "PACs"}`}
              </h2>
              <div className="flex-1 h-px border-t border-dashed border-pen-black"></div>
            </div>
            <StickyNote variant="default">
              <div className="space-y-1">
                {regularItems.map((item) => (
                  <Link
                    key={item._id}
                    to={
                      activeTab === "tecs"
                        ? `/view/${item._id}`
                        : `/view-pac/${item._id}`
                    }
                    className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                  >
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {activeTab === "tecs"
                        ? (item as any).title
                        : (item as any).name}
                    </span>
                  </Link>
                ))}
              </div>
            </StickyNote>
          </div>
        )}

        {currentItems.length === 0 && (
          <StickyNote variant="pink" className="text-center">
            <h2 className="text-xl font-bold text-pen-black mb-2">
              {`No ${activeTab === "tecs" ? "TECs" : "PACs"} yet`}
            </h2>
            <p className="text-accent">
              {isOwnProfile
                ? `You haven't created any ${
                    activeTab === "tecs" ? "TECs" : "PACs"
                  } yet.`
                : `This user hasn't created any ${
                    activeTab === "tecs" ? "TECs" : "PACs"
                  }.`}
            </p>
          </StickyNote>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

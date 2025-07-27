import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import OutlineButton from "../components/OutlineButton";
import { getUserById } from "../data/mockData";
import DashedLine from "../components/DashedLine";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiService } from "../services/api";
import { TEC, PAC, User } from "../types";
import { getDisplayName, getDisplayInitial } from "../utils/userUtils";

const UserProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { currentUser, accessToken } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userTECs, setUserTECs] = useState<TEC[]>([]);
  const [userPACs, setUserPACs] = useState<PAC[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is the current user's own profile
  // We need to compare after we fetch the profile data
  const isOwnProfile =
    currentUser &&
    profileUser &&
    (currentUser.auth0Id === profileUser.auth0Id ||
      currentUser._id === profileUser._id ||
      currentUser.id === profileUser.id);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [pinnedTECs, setPinnedTECs] = useState<string[]>([]);
  const [pinnedPACs, setPinnedPACs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"tecs" | "pacs">("tecs");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!uid) return;

      setIsLoading(true);
      try {
        let userIdToFetch = uid;

        // If the URL parameter matches current user's auth0Id, use their _id instead
        if (
          currentUser &&
          (uid === currentUser.auth0Id || uid === currentUser.id)
        ) {
          userIdToFetch = currentUser._id;
        }

        // Use the new user endpoints to fetch TECs and PACs for any user
        const [userTecsResponse, userPacsResponse] = await Promise.all([
          apiService.getUserTecs(userIdToFetch),
          apiService.getUserPacs(userIdToFetch),
        ]);

        // The API returns both user info and their TECs/PACs
        const user = userTecsResponse.user; // Both responses should have the same user data
        const tecs = userTecsResponse.tecs;
        const pacs = userPacsResponse.pacs;

        // Transform backend user to include legacy compatibility fields
        const transformedUser: User = {
          ...user,
          id: user._id, // Legacy compatibility
          name: user.username, // Legacy compatibility
          createdTECs: tecs.map((tec) => tec._id), // Extract TEC IDs
          createdPACs: pacs.map((pac) => pac._id), // Extract PAC IDs
          createdSnippets: tecs.map((tec) => tec._id), // Legacy compatibility
        };

        setProfileUser(transformedUser);
        setEditedBio(transformedUser.bio || "");
        setEditedUsername(transformedUser.username || "");
        setUserTECs(tecs);
        setUserPACs(pacs);

        // Set pinned items (first few items as featured)
        setPinnedTECs(tecs.slice(0, 3).map((tec) => tec._id));
        setPinnedPACs(pacs.slice(0, 2).map((pac) => pac._id));
      } catch (error) {
        console.error("Error fetching profile data:", error);

        // If viewing own profile and API fails, fall back to current user data
        if (
          currentUser &&
          (uid === currentUser.auth0Id ||
            uid === currentUser.id ||
            uid === currentUser._id)
        ) {
          setProfileUser(currentUser);
          setEditedBio(currentUser.bio || "");
          setEditedUsername(currentUser.username || "");
          // Use empty arrays since we couldn't fetch from API
          setUserTECs([]);
          setUserPACs([]);
        } else {
          // Fallback to mock data for other users
          const mockUser = getUserById(uid || "");
          if (mockUser) {
            setProfileUser(mockUser);
            setEditedBio(mockUser.bio || "");
            setEditedUsername(mockUser.username || "");
            setUserTECs([]);
            setUserPACs([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [uid, currentUser]);

  const handleSaveBio = async () => {
    if (!currentUser || !accessToken || !isOwnProfile) return;

    try {
      await apiService.updateUserProfile(accessToken, {
        bio: editedBio,
      });

      // Update local state
      setProfileUser((prev) => (prev ? { ...prev, bio: editedBio } : null));
      setIsEditingBio(false);
      showSuccess("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      showError("Failed to update bio. Please try again.");
    }
  };

  const handleCancelBio = () => {
    setEditedBio(profileUser?.bio || "");
    setIsEditingBio(false);
  };

  const handleSaveUsername = async () => {
    if (!currentUser || !accessToken || !isOwnProfile) return;

    if (!editedUsername.trim()) {
      showError("Username cannot be empty");
      return;
    }

    try {
      const updatedUser = await apiService.updateUserProfile(accessToken, {
        username: editedUsername.trim(),
      });

      // Update local state
      setProfileUser((prev) =>
        prev ? { ...prev, username: editedUsername.trim() } : null
      );
      setIsEditingUsername(false);
      showSuccess("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      showError("Failed to update username. Please try again.");
    }
  };

  const handleCancelUsername = () => {
    setEditedUsername(profileUser?.username || "");
    setIsEditingUsername(false);
  };

  const handleUnpinTEC = (tecId: string) => {
    setPinnedTECs((prev) => prev.filter((id) => id !== tecId));
  };

  const handleUnpinPAC = (pacId: string) => {
    setPinnedPACs((prev) => prev.filter((id) => id !== pacId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-6xl pt-20">
          <StickyNote variant="blue" className="text-center">
            <p>Loading profile...</p>
          </StickyNote>
        </div>
      </div>
    );
  }

  if (!profileUser) {
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

  // Get user display name using utility function
  const getUserDisplayName = () => {
    if (!profileUser) return "User";
    return getDisplayName({
      username: profileUser.username,
      name: profileUser.name,
      email: profileUser.email,
      _id: profileUser._id,
      id: profileUser.id,
      auth0Id: profileUser.auth0Id,
    });
  };

  // Get user display initial using utility function
  const getUserDisplayInitial = () => {
    if (!profileUser) return "U";
    return getDisplayInitial({
      username: profileUser.username,
      name: profileUser.name,
      email: profileUser.email,
      _id: profileUser._id,
      id: profileUser.id,
      auth0Id: profileUser.auth0Id,
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl pt-20">
        <div className="flex gap-8 mb-8">
          {/* Profile Picture - Left */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-pen-black rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {getUserDisplayInitial()}
              </span>
            </div>
          </div>

          {/* Username and Bio - Right */}
          <div className="flex-1">
            {isEditingUsername ? (
              <div className="mb-4">
                <input
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="text-4xl font-bold text-pen-black bg-transparent border-b-2 border-pen-black focus:outline-none w-full"
                  placeholder="Enter username..."
                />
                <div className="flex gap-2 mt-2">
                  <OutlineButton
                    variant="primary"
                    size="small"
                    onClick={handleSaveUsername}
                  >
                    Save
                  </OutlineButton>
                  <OutlineButton
                    variant="secondary"
                    size="small"
                    onClick={handleCancelUsername}
                  >
                    Cancel
                  </OutlineButton>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-pen-black">
                  {getUserDisplayName()}
                </h1>
                {isOwnProfile && (
                  <OutlineButton
                    variant="secondary"
                    size="small"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    Edit Username
                  </OutlineButton>
                )}
              </div>
            )}

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
                  <DashedLine
                    text={
                      profileUser.bio || "Just a lil dev trying their best 🧃"
                    }
                  />
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
              {isOwnProfile ? "My TECs" : `${getUserDisplayName()}'s TECs`} (
              {userTECs.length})
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
              {isOwnProfile ? "My PACs" : `${getUserDisplayName()}'s PACs`} (
              {userPACs.length})
            </button>
          </div>
        </div>

        {featuredItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-pen-black flex items-center gap-2">
                All {activeTab === "tecs" ? "TECs" : "PACs"}
              </h2>
              <div className="flex-1 h-px border-t border-dashed border-pen-black"></div>
            </div>
            <StickyNote variant="default">
              <div className="space-y-1">
                {featuredItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-2">
                    <Link
                      to={
                        activeTab === "tecs"
                          ? `/view/${item._id}`
                          : `/view-pac/${item._id}`
                      }
                      className="group flex items-center gap-2 ml-8 text-lg text-text-primary hover:text-text-accent transition-colors flex-1"
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

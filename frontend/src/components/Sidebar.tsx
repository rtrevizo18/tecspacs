import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StickyNote from "./StickyNote";
import OutlineButton from "./OutlineButton";
import { useAuthContext } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { TEC, PAC } from "../types";

const Sidebar: React.FC = () => {
  const { currentUser, getAccessToken } = useAuthContext();
  const [userTecs, setUserTecs] = useState<TEC[]>([]);
  const [userPacs, setUserPacs] = useState<PAC[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's TECs and PACs when component mounts and user is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch user's TECs and PACs using the user endpoints
        const [tecsResponse, pacsResponse] = await Promise.all([
          apiService.getUserTecs(currentUser._id),
          apiService.getUserPacs(currentUser._id)
        ]);
        
        setUserTecs(tecsResponse.tecs || []);
        setUserPacs(pacsResponse.pacs || []);
      } catch (error) {
        console.warn('Could not fetch user data for sidebar:', error);
        setUserTecs([]);
        setUserPacs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="w-80 px-4 py-6 space-y-4 ml-6">
      <h2 className="font-bold text-text-primary mb-3">Navigation</h2>
      <StickyNote variant="default" size="small">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-bold text-text-primary mb-3">My TECs</h3>
          <Link to="/new-tec">
            <OutlineButton size="small" onClick={() => {}}>
              + New TEC
            </OutlineButton>
          </Link>
        </div>
        {currentUser ? (
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-text-accent text-sm">Loading TECs...</div>
            ) : (
              <div className="space-y-1">
                {userTecs.length > 0 ? (
                  userTecs.slice(0, 5).map((tec) => (
                    <Link
                      key={tec._id}
                      to={`/view/${tec._id}`}
                      className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                    >
                      <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                      <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                        {tec.title}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="text-text-accent text-sm">No TECs yet</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-text-accent text-sm mb-3">
              Sign in to create and save TECs
            </p>
            <Link to="/login">
              <OutlineButton size="small" onClick={() => {}}>
                Login
              </OutlineButton>
            </Link>
            <Link to="/register">
              <OutlineButton
                size="small"
                variant="secondary"
                onClick={() => {}}
              >
                Register
              </OutlineButton>
            </Link>
          </div>
        )}
      </StickyNote>

      {currentUser && (
        <StickyNote variant="blue" size="small">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-bold text-text-primary mb-3">My PACs</h3>
            <Link to="/new-pac">
              <OutlineButton size="small" onClick={() => {}}>
                + New PAC
              </OutlineButton>
            </Link>
          </div>
          {isLoading ? (
            <div className="text-text-accent text-sm">Loading PACs...</div>
          ) : (
            <div className="space-y-1">
              {userPacs.length > 0 ? (
                userPacs.slice(0, 5).map((pac) => (
                  <Link
                    key={pac._id}
                    to={`/view-pac/${pac._id}`}
                    className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                  >
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {pac.name}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-text-accent text-sm">No PACs yet</div>
              )}
            </div>
          )}
        </StickyNote>
      )}
    </div>
  );
};

export default Sidebar;

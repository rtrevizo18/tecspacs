import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import OutlineButton from "./OutlineButton";
import { useAuthContext } from "../contexts/AuthContext";

const Navigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-sketch-white border-b border-pen-black z-50 px-4 py-3">
      <div className="ml-6 max-w-8xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-text-primary">
          <div className="flex items-center gap-1">
            <img src="/logo.png" alt="Logo" className="h-10" /> tecspacs
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-2 border-pen-black rounded-lg bg-white text-text-primary placeholder-text-accent focus:outline-none focus:border-pen-black"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="text-text-accent">Loading...</div>
          ) : isAuthenticated ? (
            <>
              {/* New TEC Button - White background with black border */}
              <button
                onClick={() => navigate("/new-tec")}
                className="px-4 py-2 text-sm font-bold bg-white border-2 border-pen-black text-pen-black rounded hover:bg-gray-50 transition-colors"
              >
                + New TEC
              </button>

              {/* New PAC Button - Black background with white border */}
              <button
                onClick={() => navigate("/new-pac")}
                className="px-4 py-2 text-sm font-bold bg-pen-black border-2 border-white text-white rounded hover:bg-gray-800 transition-colors"
              >
                + New PAC
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {(currentUser?.name || user?.name || user?.email)
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-text-primary font-medium">
                    {currentUser?.name ||
                      user?.name ||
                      user?.email?.split("@")[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-pen-black rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to={`/user/${currentUser?.auth0Id || user?.sub}`}
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <OutlineButton size="small" onClick={handleLogin}>
                Login
              </OutlineButton>
              <OutlineButton size="small" onClick={handleLogin}>
                Register
              </OutlineButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

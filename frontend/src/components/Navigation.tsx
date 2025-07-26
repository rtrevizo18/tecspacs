import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OutlineButton from "./OutlineButton";
import { getCurrentUser } from "../data/mockData";

const Navigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

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
          {currentUser ? (
            <>
              <OutlineButton size="small" onClick={() => navigate("/new")}>
                New Snippet
              </OutlineButton>
              <Link to={`/user/${currentUser.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <span className="text-text-primary font-medium">
                  {currentUser.name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <OutlineButton size="small" onClick={() => navigate("/login")}>
                Login
              </OutlineButton>
              <OutlineButton size="small" onClick={() => navigate("/register")}>
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

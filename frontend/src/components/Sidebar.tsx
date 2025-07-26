import React from "react";
import { Link } from "react-router-dom";
import StickyNote from "./StickyNote";
import OutlineButton from "./OutlineButton";
import { getCurrentUser, getTECById, getPACById } from "../data/mockData";

const Sidebar: React.FC = () => {
  const currentUser = getCurrentUser();

  return (
    <div className="w-80 px-4 py-6 space-y-4 ml-6">
      <h2 className="font-bold text-text-primary mb-3">Navigation</h2>
      <StickyNote variant="default" size="small">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-bold text-text-primary mb-3">My TECs</h3>
          <Link to="/new-tec">
            <OutlineButton size="small" onClick={() => {}}>
              New TEC
            </OutlineButton>
          </Link>
        </div>
        {currentUser ? (
          <div className="space-y-2">
            <div className="space-y-1">
              {currentUser.createdTECs?.map((id) => {
                const tec = getTECById(id);
                return tec ? (
                  <Link
                    key={id}
                    to={`/view/${id}`}
                    className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                  >
                    <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                    <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                      {tec.title}
                    </span>
                  </Link>
                ) : null;
              })}
            </div>
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
                New PAC
              </OutlineButton>
            </Link>
          </div>
          <div className="space-y-1">
            {currentUser.createdPACs?.map((id) => {
              const pac = getPACById(id);
              return pac ? (
                <Link
                  key={id}
                  to={`/view-pac/${id}`}
                  className="group flex items-center gap-2 text-sm text-text-primary hover:text-text-accent transition-colors"
                >
                  <span className="w-2 h-2 border border-pen-black inline-block group-hover:bg-pen-black transition-colors" />
                  <span className="border-b border-dashed border-pen-black flex-1 pb-0.5">
                    {pac.name}
                  </span>
                </Link>
              ) : null;
            })}
          </div>
        </StickyNote>
      )}
    </div>
  );
};

export default Sidebar;

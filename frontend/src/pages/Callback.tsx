import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import StickyNote from "../components/StickyNote";

const Callback: React.FC = () => {
  const { handleRedirectCallback, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        navigate("/");
      } catch (err) {
        console.error("Error handling auth callback:", err);
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate]);

  if (error) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="pink">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Authentication Error
          </h2>
          <p className="text-text-accent">
            {error.message || "Something went wrong during authentication."}
          </p>
        </StickyNote>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <StickyNote variant="default">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {isLoading
            ? "Completing Authentication..."
            : "Authentication Complete"}
        </h2>
        <p className="text-text-accent">
          {isLoading
            ? "Please wait while we log you in."
            : "Redirecting to dashboard..."}
        </p>
      </StickyNote>
    </div>
  );
};

export default Callback;

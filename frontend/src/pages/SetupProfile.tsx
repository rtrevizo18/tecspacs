import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import UnderlineInput from "../components/UnderlineInput";
import OutlineButton from "../components/OutlineButton";
import { apiService } from "../services/api";

const SetupProfile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently();
      await apiService.createUserProfile(accessToken, {
        username: username.trim(),
        email: user?.email || "",
      });
      
      // Redirect to dashboard after successful profile creation
      navigate("/");
    } catch (err: any) {
      console.error("Error creating profile:", err);
      
      // Check if it's a network/backend error
      if (err?.message?.includes("Failed to fetch") || err?.name === "TypeError") {
        setError("Backend server is not available. You can skip profile creation for now.");
      } else {
        setError(err?.message || "Failed to create profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Temporarily skip profile creation and go to dashboard
    console.log("Skipping profile creation - backend not available");
    navigate("/");
  };

  const handleCreateProfile = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-sketch-white">
      <div className="max-w-md w-full px-4">
        <StickyNote variant="default" className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Welcome to TecSpacs!
          </h1>
          <p className="text-text-accent mb-6">
            Let's set up your profile to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pre-filled email from Auth0 */}
            <div className="text-left">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-pen-black rounded text-text-accent">
                {user?.email || "No email provided"}
              </div>
              <p className="text-xs text-text-accent mt-1">
                This email is from your login account
              </p>
            </div>

            {/* Username input */}
            <div className="text-left">
              <UnderlineInput
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={setUsername}
              />
              <p className="text-xs text-text-accent mt-1">
                This will be displayed publicly on your TECs and PACs
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <OutlineButton
                onClick={handleCreateProfile}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating Profile..." : "Create Profile"}
              </OutlineButton>
              <OutlineButton
                type="button"
                variant="secondary"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for Now
              </OutlineButton>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-pen-black text-sm text-text-accent">
            <p>
              By creating a profile, you agree to share your username and contributions 
              publicly on the TecSpacs platform.
            </p>
          </div>
        </StickyNote>
      </div>
    </div>
  );
};

export default SetupProfile;
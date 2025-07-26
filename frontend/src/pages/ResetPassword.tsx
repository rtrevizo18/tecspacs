import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password attempt:", {
      email,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <StickyNote variant="blue" className="shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Reset Password
        </h1>
        <p className="text-text-accent text-sm">
          Create a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <NotebookInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your.email@example.com"
        />

        <NotebookInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
        />

        <NotebookInput
          label="Confirm"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm new password"
        />

        <div className="pt-4">
          <OutlineButton
            size="medium"
            onClick={() => {}}
            className="w-full justify-center"
          >
            Reset Password
          </OutlineButton>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-dashed border-pen-black">
        <div className="text-center text-sm text-text-accent">
          Remember password? Swipe right to login!
        </div>
      </div>
    </StickyNote>
  );
};

export default ResetPassword;

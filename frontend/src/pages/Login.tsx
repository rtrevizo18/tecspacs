import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <StickyNote variant="default" className="shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Log In</h1>
        <p className="text-text-accent text-sm">
          Sign in to your Tecspacs account
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <NotebookInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your.email@example.com"
        />

        <NotebookInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />

        {/* Submit Button */}
        <div className="pt-4">
          <OutlineButton
            size="medium"
            onClick={() => {}}
            className="w-full justify-center"
          >
            Sign In
          </OutlineButton>
        </div>
      </form>

      {/* Footer Links */}
      <div className="mt-6 pt-4 border-t border-dashed border-pen-black">
        <div className="text-center space-y-2 text-sm">
          <div className="text-text-accent">
            Forgot password or need account?
          </div>
        </div>
      </div>
    </StickyNote>
  );
};

export default Login;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register attempt:", {
      name,
      email,
      password,
      confirmPassword,
    });
  };

  return (
    <StickyNote variant="green" className="shadow-lg" size="large">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Join Tecspacs
        </h1>
        <p className="text-text-accent text-sm">
          Create your developer account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <NotebookInput
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Your full name"
        />

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
          placeholder="Create a strong password"
        />

        <NotebookInput
          label="Confirm"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
        />

        <div className="pt-4">
          <OutlineButton
            size="medium"
            onClick={() => {}}
            className="w-full justify-center"
          >
            Create Account
          </OutlineButton>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-dashed border-pen-black">
        <div className="text-center text-sm text-text-accent">
          Already have an account? Swipe left!
        </div>
      </div>
    </StickyNote>
  );
};

export default Register;

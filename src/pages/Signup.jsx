import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { toast } from "react-toastify";

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Role and creator-specific fields
  const [selectedRole, setSelectedRole] = useState("user");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");

  const isCreator = selectedRole === "creator";

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // If user is creator, ensure wallet and username are provided.
    if (isCreator) {
      if (!wallet.trim()) {
        toast.error("Wallet address is required for creators.");
        return;
      }
      if (!username.trim()) {
        toast.error("Username is required for creators.");
        return;
      }
    } else {
      // For user role, username might still be required if your logic demands it.
      // If not, remove the required attribute in the input fields above.
      if (!username.trim()) {
        toast.error("Username is required.");
        return;
      }
    }

    try {
      setLoading(true);
      await signUp(
        email,
        password,
        username.trim(),
        selectedRole,
        isCreator ? bio.trim() : "",
        isCreator ? wallet.trim() : ""
      );
      toast.success("Sign up successful! Redirecting...");
      navigate("/");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form className="signup-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Role Selection */}
        <div>
          <label>
            <input
              type="radio"
              value="user"
              checked={selectedRole === "user"}
              onChange={(e) => setSelectedRole(e.target.value)}
            />
            Regular User
          </label>
          <label>
            <input
              type="radio"
              value="creator"
              checked={selectedRole === "creator"}
              onChange={(e) => setSelectedRole(e.target.value)}
            />
            Creator
          </label>
        </div>

        {/* Conditional Creator Fields */}
        {isCreator && (
          <>
            <textarea
              placeholder="Short Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="text"
              placeholder="Wallet Address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [username, setUsername] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signUp(email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "profiles", user.uid), {
        username,
        bio: "",
        wallet: "",
        role: selectedRole,
      });
      toast.success("Sign up successful! Redirecting...");
      navigate("/"); // Redirect to homepage or dashboard
    } catch (error) {
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

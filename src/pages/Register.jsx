import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const Register = () => {
  const { user } = useAuth(); // Fetch authenticated user from context
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You need to log in before registering as a creator.");
      navigate("/login");
      return;
    }

    if (username.trim() === "" || wallet.trim() === "") {
      toast.error("Username and Wallet Address are required.");
      return;
    }

    try {
      setLoading(true);
      // Save user profile to Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        username,
        bio,
        wallet,
        email: user.email,
        registrationDate: serverTimestamp(),
        totalTips: 0,
      });

      toast.success("Profile registered successfully!");
      navigate(`/profile/${username}`);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to register profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Become a Creator</h1>
      <p>
        Share your passion and connect with supporters worldwide. Sign up and
        start receiving tips in cryptocurrency.
      </p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <textarea
          placeholder="Short Bio"
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
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;

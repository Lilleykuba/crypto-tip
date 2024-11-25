import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path if needed

const Register = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate the Ethereum wallet address
  const isValidWallet = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    // Validation
    if (!username || !bio || !wallet) {
      setStatus("All fields are required.");
      setLoading(false);
      return;
    }
    if (!isValidWallet(wallet)) {
      setStatus("Invalid Ethereum wallet address.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "profiles"), { username, bio, wallet });
      toast.success("Registration successful!");
      navigate(`/profile/${username}`);
    } catch (error) {
      toast.error("Error registering profile. Try again.");
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Register as a Creator</h1>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="wallet">Ethereum Wallet Address</label>
            <input
              type="text"
              id="wallet"
              placeholder="Enter your Ethereum wallet address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {status && (
          <p
            className={`status ${
              status.startsWith("Error") ? "error" : "success"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;

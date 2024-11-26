import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../services/AuthContext";
import { db } from "../firebase";
import { toast } from "react-toastify";

const EditProfile = () => {
  const { user } = useAuth(); // Current logged-in user
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const profileRef = doc(db, "profiles", user.uid);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setUsername(data.username || "");
          setBio(data.bio || "");
          setWallet(data.wallet || "");
        } else {
          toast.error("Profile not found!");
          navigate("/"); // Redirect if profile doesn't exist
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile. Try again later.");
      }
    };

    fetchProfile();
  }, [user, navigate]);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!username || !wallet) {
      toast.error("Username and Wallet Address are required.");
      return;
    }

    try {
      setLoading(true);
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        username,
        bio,
        wallet,
      });
      toast.success("Profile updated successfully!");
      navigate(`/profile/${username}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleUpdate}>
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
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;

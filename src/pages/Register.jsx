import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [wallet, setWallet] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    // Save user data to localStorage (for simplicity)
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    profiles.push({ username, bio, wallet });
    localStorage.setItem("profiles", JSON.stringify(profiles));

    // Redirect to the user's profile
    navigate(`/profile/${username}`);
  };

  return (
    <div className="container">
      <h1>Register as a Creator</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <input
        type="text"
        placeholder="Wallet Address (e.g., 0x123...)"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;

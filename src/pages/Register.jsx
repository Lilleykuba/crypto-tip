import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const saveProfile = async (profile) => {
  try {
    await addDoc(collection(db, "profiles"), profile);
    console.log("Profile saved!");
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

const handleRegister = () => {
  const newProfile = {
    username,
    bio,
    wallet,
  };
  saveProfile(newProfile);
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

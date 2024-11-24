import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your Firebase config

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null); // State to store fetched user
  const [loading, setLoading] = useState(true); // Loading state for profile fetch
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalTips, setTotalTips] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [topSupporters, setTopSupporters] = useState([]);
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const profilesData = querySnapshot.docs.map((doc) => doc.data());
        const matchedUser = profilesData.find(
          (profile) => profile.username === username
        );
        setUser(matchedUser);
        if (!matchedUser) {
          setStatus("Profile not found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setStatus("Error fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]); // Add username to dependency array

  // Handle case where profile is not found or loading
  if (loading) {
    return (
      <div className="container">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Profile not found</h1>
      </div>
    );
  }

  // Function to send tips
  const sendTip = async () => {
    if (!metaMaskAvailable) {
      setStatus(
        "MetaMask is not installed! Please install MetaMask to send tips."
      );
      return;
    }
    if (!ethers.utils.isAddress(user.wallet)) {
      setStatus("Invalid wallet address.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setStatus("Enter a valid amount greater than 0.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const transaction = await signer.sendTransaction({
        to: user.wallet,
        value: ethers.utils.parseEther(amount),
      });
      setStatus(`Transaction sent! Hash: ${transaction.hash}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    setMetaMaskAvailable(typeof window.ethereum !== "undefined");
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>{user.username}'s Profile</h1>
        <p>{user.bio}</p>
        <p>
          <strong>Wallet Address:</strong> {user.wallet}
        </p>
        <QRCodeCanvas className="qr-code" value={user.wallet} size={128} />

        <div style={{ marginTop: "20px" }}>
          <h3>Send a Tip</h3>
          <input
            type="number"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={sendTip}
            disabled={!metaMaskAvailable || !amount || parseFloat(amount) <= 0}
          >
            {metaMaskAvailable ? "Send Tip" : "MetaMask Required"}
          </button>
        </div>

        {status && (
          <div
            className={`status ${
              status.startsWith("Error") ? "error" : "success"
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

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
  const [amount, setAmount] = useState(""); // Tip amount
  const [status, setStatus] = useState(""); // Status message
  const [transactions, setTransactions] = useState([]); // Transaction history
  const [totalTips, setTotalTips] = useState(0); // Total tips amount
  const [transactionCount, setTransactionCount] = useState(0); // Total transaction count
  const [topSupporters, setTopSupporters] = useState([]); // Top supporters list
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false); // MetaMask detection

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
  }, [username]);

  // Fetch transactions and calculate analytics
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.wallet) return;

      try {
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${
            user.wallet
          }&startblock=0&endblock=99999999&sort=desc&apikey=${
            import.meta.env.VITE_APP_ETHERSCAN_API_KEY
          }`
        );
        const data = await response.json();

        if (data.status === "1") {
          const txs = data.result;
          setTransactions(txs);
          calculateAnalytics(txs);
        } else {
          setStatus("Failed to fetch transaction history.");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setStatus("Error fetching transactions.");
      }
    };

    if (user?.wallet) fetchTransactions();
  }, [user]);

  // Calculate total tips, transaction count, and top supporters
  const calculateAnalytics = (txList) => {
    let total = 0;
    const supporterMap = {};

    txList.forEach((tx) => {
      if (tx.to.toLowerCase() === user.wallet.toLowerCase()) {
        const valueInEth = parseFloat(tx.value) / 10 ** 18;
        total += valueInEth;

        if (supporterMap[tx.from]) {
          supporterMap[tx.from] += valueInEth;
        } else {
          supporterMap[tx.from] = valueInEth;
        }
      }
    });

    setTotalTips(total);
    setTransactionCount(
      txList.filter((tx) => tx.to.toLowerCase() === user.wallet.toLowerCase())
        .length
    );

    const sortedSupporters = Object.entries(supporterMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, amount]) => ({ address, amount }));

    setTopSupporters(sortedSupporters);
  };

  // Detect if MetaMask is installed
  useEffect(() => {
    setMetaMaskAvailable(typeof window.ethereum !== "undefined");
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <div className="container">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  // Handle profile not found
  if (!user) {
    return (
      <div className="container">
        <h1>Profile not found</h1>
      </div>
    );
  }

  // Send a tip to the user's wallet
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
        value: ethers.utils.parseEther(amount), // Convert ETH to Wei
      });

      setStatus(`Transaction sent! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      {/* User Profile Card */}
      <div className="card">
        <h1>{user.username}'s Profile</h1>
        <p>{user.bio}</p>
        <p>
          <strong>Wallet Address:</strong> {user.wallet}
        </p>
        <QRCodeCanvas className="qr-code" value={user.wallet} size={128} />

        {/* Tip Form */}
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

      {/* Tipping History */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Tipping History</h3>
        {transactions.length === 0 ? (
          <p>No transactions found for this wallet.</p>
        ) : (
          <ul>
            {transactions.slice(0, 5).map((tx, index) => (
              <li key={index}>
                <p>
                  <strong>From:</strong> {tx.from}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {(parseFloat(tx.value) / 10 ** 18).toFixed(4)} ETH
                </p>
                <p>
                  <strong>Tx Hash:</strong>{" "}
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.hash}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Analytics */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Analytics</h3>
        <p>
          <strong>Total Tips:</strong> {totalTips.toFixed(4)} ETH
        </p>
        <p>
          <strong>Number of Transactions:</strong> {transactionCount}
        </p>
        <h4>Top Supporters</h4>
        <ul>
          {topSupporters.map((supporter, index) => (
            <li key={index}>
              <p>
                <strong>Address:</strong> {supporter.address}
              </p>
              <p>
                <strong>Amount:</strong> {supporter.amount.toFixed(4)} ETH
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

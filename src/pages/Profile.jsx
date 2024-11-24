import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";

const Profile = () => {
  const { username } = useParams();
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
  const user = profiles.find((profile) => profile.username === username);

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="container">
        <h1>Profile not found</h1>
      </div>
    );
  }

  const sendTip = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask is not installed!");
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

  // Fetch Transaction History from Etherscan API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${user.wallet}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "1") {
        setTransactions(data.result);
      } else {
        setStatus("Failed to fetch transaction history.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setStatus("Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user.wallet]);

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
          <button onClick={sendTip}>Send Tip</button>
        </div>

        {status && (
          <div
            className={`status ${status.startsWith("Error") ? "error" : ""}`}
          >
            {status}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Tipping History</h3>
        {loading && <p>Loading transactions...</p>}
        {transactions.length === 0 && !loading && (
          <p>No transactions found for this wallet.</p>
        )}
        <ul>
          {transactions.slice(0, 5).map((tx, index) => (
            <li key={index}>
              <p>
                <strong>From:</strong> {tx.from}
              </p>
              <p>
                <strong>Amount:</strong> {parseFloat(tx.value) / 10 ** 18} ETH
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
      </div>
    </div>
  );
};

export default Profile;

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
  const [totalTips, setTotalTips] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [topSupporters, setTopSupporters] = useState([]);
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false);

  // Handle case where profile is not found
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

  // Fetch transactions from Etherscan
  const fetchTransactions = async () => {
    if (!ethers.utils.isAddress(user.wallet)) {
      setStatus("Invalid wallet address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${user.wallet}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "1") {
        setTransactions(data.result);
        calculateAnalytics(data.result);
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

  // Calculate analytics from transactions
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

  // Detect MetaMask and fetch transactions on mount
  useEffect(() => {
    setMetaMaskAvailable(typeof window.ethereum !== "undefined");
    if (typeof window.ethereum === "undefined") {
      console.error("MetaMask is not available.");
    }
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

        {!metaMaskAvailable && (
          <p className="error">
            MetaMask is not installed.{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Install MetaMask here.
            </a>
          </p>
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

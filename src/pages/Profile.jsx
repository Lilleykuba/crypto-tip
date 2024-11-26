// Profile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";
import { isAddress } from "ethers";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your Firebase config
import Loader from "../components/Loader";
import { Helmet } from "react-helmet";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "react-share";
import { toast } from "react-toastify";
import { useAuth } from "../services/AuthContext";

const Profile = () => {
  const { username } = useParams();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null); // Fetched user
  const [loadingProfile, setLoadingProfile] = useState(true); // Profile loading state
  const [loadingTransactions, setLoadingTransactions] = useState(false); // Transactions loading state
  const [amount, setAmount] = useState(""); // Tip amount
  const [status, setStatus] = useState(""); // Status message
  const [transactions, setTransactions] = useState([]); // Transaction history
  const [totalTips, setTotalTips] = useState(0); // Total tips amount
  const [transactionCount, setTransactionCount] = useState(0); // Total transaction count
  const [topSupporters, setTopSupporters] = useState([]); // Top supporters list
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false); // MetaMask detection
  const [selectedCurrency, setSelectedCurrency] = useState("ETH");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const profilesData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Include Firestore document ID
          ...doc.data(),
        }));
        const matchedUser = profilesData.find(
          (user) => user.username === username
        );

        if (!matchedUser) {
          toast.error("Profile not found.");
          setUser(null);
          return;
        }
        setUser(matchedUser);
      } catch (error) {
        toast.error("Error fetching profile data.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Define `profileOwnerId` based on fetched profile
  const profileOwnerId = user?.id; // Assuming `id` is the unique identifier in Firestore
  const isOwner = authUser?.uid === profileOwnerId; // Check if logged-in user is the owner

  useEffect(() => {
    const fetchRate = async () => {
      if (selectedCurrency !== "ETH") {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${selectedCurrency}&vs_currencies=usd`
        );
        const data = await response.json();
        setExchangeRate(data[selectedCurrency].usd / data.ethereum.usd);
      } else {
        setExchangeRate(1);
      }
    };
    fetchRate();
  }, [selectedCurrency]);

  // Fetch transactions and calculate analytics
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.wallet) return;
      setLoadingTransactions(true);
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
      } finally {
        setLoadingTransactions(false);
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

  // Show loader for profile loading
  if (loadingProfile) {
    return <Loader />;
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
    const convertedAmount = (amount * exchangeRate).toFixed(8);
    try {
      if (!window.ethereum) {
        toast.error("MetaMask is not installed. Please install MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      if (!user.wallet || !isAddress(user.wallet)) {
        toast.error("Invalid or missing wallet address.");
        return;
      }

      if (!convertedAmount || parseFloat(convertedAmount) <= 0) {
        toast.warn("Please enter a valid amount greater than 0.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const transaction = await signer.sendTransaction({
        to: user.wallet,
        value: ethers.parseEther(convertedAmount),
      });

      toast.success(`Transaction sent successfully! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!authUser || !user) {
        setFavorites([]); // Reset the state if conditions are not met
        setIsFavorite(false);
        return;
      }

      try {
        const favSnapshot = await getDocs(
          collection(db, `profiles/${authUser.uid}/favorites`)
        );
        const favoritesList = favSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favoritesList); // Update your state with fetched favorites

        // Check if the current user is in the favorites list
        const favoriteExists = favoritesList.some((fav) => fav.id === user.id);
        setIsFavorite(favoriteExists);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setFavorites([]); // Reset on error
        setIsFavorite(false);
      }
    };

    fetchFavorites();
  }, [authUser, user, db]); // Include all dependencies

  const handleFavoriteToggle = async () => {
    if (!authUser || !user) {
      setFavorites([]); // Reset the state if conditions are not met
      setIsFavorite(false);
      return;
    }

    const favRef = doc(db, `profiles/${authUser.uid}/favorites/${user.id}`);

    try {
      if (isFavorite) {
        await deleteDoc(favRef);
        setIsFavorite(false);
        // Remove from favorites list
        setFavorites((prevFavorites) =>
          prevFavorites.filter((fav) => fav.id !== user.id)
        );
      } else {
        await setDoc(favRef, {
          id: user.id,
          username: user.username,
          bio: user.bio,
          wallet: user.wallet,
        });
        setIsFavorite(true);
        // Add to favorites list
        setFavorites((prevFavorites) => [
          ...prevFavorites,
          {
            id: user.id,
            username: user.username,
            bio: user.bio,
            wallet: user.wallet,
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites.");
      setIsFavorite(!isFavorite); // Revert state on error
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>
          {user ? `${user.username} - Profile` : "Loading Profile..."}
        </title>
        {user && (
          <>
            <meta
              name="description"
              content={`Support ${user.username} by tipping with crypto.`}
            />
            <meta property="og:title" content={`${user.username}'s Profile`} />
            <meta
              property="og:description"
              content={`Help ${user.username} by tipping ETH.`}
            />
          </>
        )}
      </Helmet>
      {/* Show loader for transactions */}
      {loadingTransactions && <Loader />}
      {/* User Profile Card */}
      <div className="card">
        <h1>{user.username}'s Profile</h1>
        <p>{user.bio}</p>
        <div>
          {isOwner && (
            <button onClick={() => navigate(`/edit-profile`)}>
              Edit Profile
            </button>
          )}
        </div>
        {user && user.wallet ? (
          <QRCodeCanvas className="qr-code" value={user.wallet} size={128} />
        ) : (
          <p>Wallet address not available</p>
        )}
        <div className="wallet-address">
          <p>
            <strong>Wallet Address:</strong>
            <span className="address-text">{user.wallet}</span>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(user.wallet);
                toast.success("Wallet address copied!");
              }}
            >
              Copy
            </button>
          </p>
        </div>
        {isOwner && (
          <div className="social-share">
            <FacebookShareButton url={window.location.href}>
              <button className="share-btn">Share on Facebook</button>
            </FacebookShareButton>
            <TwitterShareButton url={window.location.href}>
              <button className="share-btn">Share on Twitter</button>
            </TwitterShareButton>
            <LinkedinShareButton url={window.location.href}>
              <button className="share-btn">Share on LinkedIn</button>
            </LinkedinShareButton>
          </div>
        )}
        <button className="favorite-btn" onClick={handleFavoriteToggle}>
          {isFavorite ? "Unfavorite" : "Add to Favorites"}
        </button>

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
            className="sendTip-btn"
            onClick={sendTip}
            disabled={!metaMaskAvailable || !amount || parseFloat(amount) <= 0}
          >
            {metaMaskAvailable ? "Send Tip" : "MetaMask Required"}
          </button>
        </div>
      </div>

      {/* Tipping History */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Tipping History</h3>
        {transactions.length === 0 ? (
          <p>No transactions found for this wallet.</p>
        ) : (
          <ul className="card-list">
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
        <ul className="supp-list">
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
      <div>
        <h3>Your Favorite Creators</h3>
        <ul>
          {favorites.map((fav) => (
            <li key={fav.id}>
              <Link to={`/profile/${fav.username}`}>
                <h4>{fav.username}</h4>
                <p>{fav.bio}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

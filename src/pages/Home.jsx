import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your Firebase config
import { useAuth } from "../services/AuthContext"; // Import AuthContext

const Home = () => {
  const [creators, setCreators] = useState([]); // State to store fetched creators
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const { user, logout } = useAuth(); // Auth Context
  const navigate = useNavigate();

  // Fetch creators from Firestore
  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const creatorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCreators(creatorsData);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setError("Failed to load creators. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to CrypTip</h1>
      <p>Support your favorite creators with cryptocurrency tips!</p>
      {user && (
        <Link to="/register" className="register-link">
          Register as a Creator
        </Link>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>Featured Creators</h2>
        {loading ? (
          <p>Loading creators...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : creators.length === 0 ? (
          <p>No creators found.</p>
        ) : (
          <ul className="creators-list">
            {creators.map((creator) => (
              <li key={creator.id} className="creator-card">
                <Link
                  to={`/profile/${creator.username}`}
                  className="creator-link"
                >
                  <h3>{creator.username}</h3>
                  <p>{creator.bio}</p>
                  <p>
                    <strong>Wallet:</strong> {creator.wallet}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;

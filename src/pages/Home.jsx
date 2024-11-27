import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your Firebase config
import { useAuth } from "../services/AuthContext"; // Import AuthContext

const Home = () => {
  const [creators, setCreators] = useState([]); // State to store fetched creators
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        setFilteredCreators(creatorsData);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setError("Failed to load creators. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = creators.filter(
      (creator) =>
        creator.username.toLowerCase().includes(query) ||
        creator.bio.toLowerCase().includes(query)
    );
    setFilteredCreators(filtered);
  };

  const handleSort = (criteria) => {
    let sortedCreators = [...filteredCreators]; // Copy the filtered list for sorting

    if (criteria === "popularity") {
      // Sort by totalTips (assuming it exists)
      sortedCreators.sort((a, b) => (b.totalTips || 0) - (a.totalTips || 0));
    } else if (criteria === "recent") {
      // Sort by registrationDate (assuming it exists as a timestamp)
      sortedCreators.sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0);
        const dateB = new Date(b.registrationDate || 0);
        return dateB - dateA;
      });
    }

    setFilteredCreators(sortedCreators); // Update filtered list with sorted results
  };

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-content">
          <h1>Support Creators with Crypto Tips</h1>
          <p>
            Discover and support creative individuals using secure
            cryptocurrency transactions. Your tips can make a difference!
          </p>
          <div className="hero-buttons">
            {!user && (
              <Link to="/signup" className="btn primary-btn">
                Get Started
              </Link>
            )}
            {user && (
              <Link to="/register" className="btn primary-btn">
                Become a Creator Now
              </Link>
            )}
            <Link to="#creators" className="btn secondary-btn">
              Explore Creators
            </Link>
          </div>
        </div>
      </section>

      <div style={{ marginTop: "20px" }}>
        <h2>Search Creators</h2>
        <input
          type="text"
          placeholder="Search creators by username or bio"
          value={searchQuery}
          onChange={handleSearch}
        />
        {loading ? (
          <p>Loading...</p>
        ) : filteredCreators.length === 0 ? (
          <p>No creators found.</p>
        ) : (
          <ul className="filter-list">
            {filteredCreators.map((creator) => (
              <li key={creator.id}>
                <Link to={`/profile/${creator.username}`}>
                  <h3>{creator.username}</h3>
                  <p>{creator.bio}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <h2>Featured creators</h2>
        <select onChange={(e) => handleSort(e.target.value)}>
          <option value="default">Sort By</option>
          <option value="popularity">Most Tipped</option>
          <option value="recent">Recently Registered</option>
        </select>
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
      </div>
    </div>
  );
};

export default Home;

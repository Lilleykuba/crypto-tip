import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import ThemeToggle from "../components/ThemeToggle";
import { db } from "../firebase";
import "../NavBar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle hamburger menu
  const [username, setUsername] = useState(""); // Store fetched username
  const { user, logOut } = useAuth(); // Auth context

  // Fetch username from Firestore when the user is logged in
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "profiles", user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUsername(profileData.username || "");
          } else {
            console.error("User profile not found.");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logOut();
      setIsOpen(false); // Close menu after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          Crypto Tipping
        </Link>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>

        {/* Nav Menu */}
        <div className="nav-sections">
          {/* Left Aligned Menu */}
          <ul className={`nav-menu nav-start ${isOpen ? "open" : ""}`}>
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/register"
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link
                  to={`/profile/${username || "myprofile"}`}
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </li>
            )}
          </ul>

          {/* Right Aligned Menu */}
          <ul className="nav-menu nav-end">
            {!user && (
              <>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/signup"
                    className="nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}
            {user && (
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
            <li className="nav-item">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

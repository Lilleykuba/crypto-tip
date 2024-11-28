import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import ThemeToggle from "../components/ThemeToggle";
import { db } from "../firebase";
import "../NavBar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { user, logOut } = useAuth();
  const menuRef = useRef(null);

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
            setUsername(""); // Reset the username state
          }
        } catch (error) {
          console.error("Error fetching username:", error);
          setUsername(""); // Reset the username state on error
        }
      } else {
        setUsername(""); // Reset the username when user is null
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logOut();
      setIsOpen(false);
      setUsername(""); // Reset the username state on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          CrypTip
        </Link>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`nav-menu ${isOpen ? "open" : ""}`}>
          {/* Left Aligned Items */}
          <li className="nav-item nav-item-left">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item nav-item-left">
            <Link
              to="/register"
              className="nav-link"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </li>
          {user && (
            <li className="nav-item nav-item-left">
              <Link
                to={`/profile/${username || "myprofile"}`}
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </li>
          )}

          {/* Right Aligned Items */}
          {!user && (
            <>
              <li className="nav-item nav-item-right">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item nav-item-right">
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
            <li className="nav-item nav-item-right">
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
          <li className="nav-item nav-item-right">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

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
  const buttonRef = useRef(null);

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
    setIsOpen((prevState) => !prevState);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
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
        {/* Navigation Menu */}
        <ul className={`nav-menu ${isOpen ? "open" : ""}`} ref={menuRef}>
          {/* Left-aligned items */}
          <div className="nav-left">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setIsOpen(false)}
              >
                Home
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
          </div>
          {/* Right-aligned items */}
          <div className="nav-right">
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
          </div>
        </ul>
        {/* Hamburger Menu */}
        <button
          ref={buttonRef}
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;

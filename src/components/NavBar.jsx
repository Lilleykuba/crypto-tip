import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import "../NavBar.css"; // Add styles for the navbar

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle hamburger menu
  const { user, logOut } = useAuth(); // Auth context

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
        <Link to="/" className="nav-logo">
          Crypto Tipping
        </Link>
        <button
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
        <ul className={`nav-menu ${isOpen ? "open" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
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
          {user ? (
            <>
              <li className="nav-item">
                <Link
                  to={`/profile/${user?.username || "myprofile"}`}
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
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
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

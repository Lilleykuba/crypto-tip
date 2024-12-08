import React, { useEffect, useState } from "react";
import "../NavBar.css";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "cryptobro" // Default to dark theme
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === "bubblegum" ? "cryptobro" : "bubblegum"
    );
  };

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      {theme === "bubblegum" ? "😎" : "🫧"}
    </button>
  );
};

export default ThemeToggle;

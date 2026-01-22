import React, { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    window.location.reload();
  };

  return (
    <nav className="navbar">
      {/* Company Logo */}
      <div className="logo">OfficeSphere</div>

      {/* Right Side */}
      {isLoggedIn && (
        <div className="profile-section">
          <div
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {/* Profile icon */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
            />
          </div>

          {showDropdown && (
            <div className="dropdown">
              <button onClick={() => alert("My Profile clicked")}>
                My Profile
              </button>
              <button onClick={() => alert("Settings clicked")}>Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

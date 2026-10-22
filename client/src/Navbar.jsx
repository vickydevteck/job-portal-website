import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeMenu();
    navigate("/login");
  }

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">J</span>
          <span>
            Job<span className="brand-highlight">Portal</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`navbar-content${menuOpen ? " navbar-open" : ""}`}>
          <div className="navbar-links">
            {token && (
              <>
                <NavLink
                  to="/"
                  end
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Home
                </NavLink>

                <Link
                  to="/#jobs"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Find Jobs
                </Link>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={navLinkClass}
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </NavLink>
                )}
              </>
            )}
          </div>

          <div className="navbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {token ? (
              <>
                <span className="welcome-user">
                  <span className="user-avatar">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <span>Hi, {user?.name || "User"}</span>
                </span>

                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="login-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="signup-button"
                  onClick={closeMenu}
                >
                  Get Started <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
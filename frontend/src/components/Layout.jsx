import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { getUser, logout } from "../utils/auth";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = getUser();

  // Dark / Light Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="app">

      {/* Header */}
      <header>

        <Link
          className="brand"
          to={
            currentUser
              ? "/dashboard"
              : "/"
          }
        >
          <span className="logo">
            TS
          </span>

          <span>
            Tribal
            <span>Sahay</span>

            <small>
              Unified Scholarship Platform
            </small>
          </span>
        </Link>

        {currentUser ? (
          <>
            <nav>

              <Link
                className={
                  location.pathname === "/dashboard"
                    ? "active"
                    : ""
                }
                to="/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={
                  location.pathname === "/schemes"
                    ? "active"
                    : ""
                }
                to="/schemes"
              >
                Scholarships
              </Link>

              <Link
                className={
                  location.pathname === "/applications"
                    ? "active"
                    : ""
                }
                to="/applications"
              >
                Applications
              </Link>

              <Link
                className={
                  location.pathname === "/documents"
                    ? "active"
                    : ""
                }
                to="/documents"
              >
                Documents
              </Link>

              <Link
                className={
                  location.pathname === "/jago"
                    ? "active"
                    : ""
                }
                to="/jago"
              >
                JAGO
              </Link>

            </nav>

            <div className="userMenu">

              {/* Dark / Light Toggle */}
              <button
                className="themeToggle"
                onClick={toggleTheme}
                title={
                  darkMode
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <span>
                {currentUser.name}
              </span>

              <button
                className="ghost"
                onClick={handleLogout}
              >
                Sign out
              </button>

            </div>
          </>
        ) : (
          <div>

            {/* Dark / Light Toggle */}
            <button
              className="themeToggle"
              onClick={toggleTheme}
              title={
                darkMode
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <Link
              className="ghost"
              to="/login"
            >
              Login
            </Link>

            <Link
              className="btn"
              to="/register"
            >
              Create Account
            </Link>

          </div>
        )}

      </header>

      {/* Page */}
      {children}

      {/* Footer */}
      <footer>
        TribalSahay • SIH Smart Automation Prototype •{" "}

        <a
          href="https://tribal.nic.in/ScholarshiP.aspx"
          target="_blank"
          rel="noreferrer"
        >
          Official MoTA Scholarship Information
        </a>
      </footer>

    </div>
  );
}

export default Layout;

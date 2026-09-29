import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { getUser, logout } from "../utils/auth";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
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

              <Link to="/schemes">
                Scholarships
              </Link>

              <Link to="/applications">
                Applications
              </Link>

              <Link to="/documents">
                Documents
              </Link>

              <Link to="/jago">
                JAGO
              </Link>

            </nav>

            <div className="userMenu">
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
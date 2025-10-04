import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { FaBell, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <MdSchool className="logo-icon" />
          <h1>EduVerse</h1>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          <Link to="/instructors" className="nav-link">
            Instructors
          </Link>
          {isAuthenticated && (
            <Link to="/settings" className="nav-link">
              Settings
            </Link>
          )}
        </nav>

        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search for courses..." />
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <button className="icon-btn">
                <FaBell />
                <span className="badge">3</span>
              </button>

              <div className="user-menu">
                <button className="user-btn">
                  {user?.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="user-avatar"
                    />
                  ) : (
                    <FaUser />
                  )}
                </button>
                <div className="dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <FaUser /> Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <FaSignOutAlt /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

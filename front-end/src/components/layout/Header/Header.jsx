import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FaSignInAlt, FaUserPlus, FaSearch } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const signupRef = useRef(null);
  const avatarRef = useRef(null);

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/courses", text: "Courses" },
    { to: "/instructors", text: "Instructors" },
    { to: "/blogs", text: "Blog/News" },
    { to: "/contacts", text: "Contact" },
  ];

  // close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (signupRef.current && !signupRef.current.contains(e.target)) {
        setShowSignupMenu(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    await logout();
    setShowAvatarMenu(false);
  };

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((s) => s.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <MdAutoAwesome className="text-3xl text-indigo-500" />
            <span className="text-2xl font-bold italic text-indigo-500">
              Eduverse
            </span>
          </Link>

          {/* Desktop Menu & Search */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-indigo-500"
                      : "text-gray-900 hover:text-indigo-500"
                  }`}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 bg-white w-72">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Desktop Auth Buttons / Avatar */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">
                    <FaSignInAlt className="mr-2" /> Login
                  </Link>
                </Button>

                {/* Signup dropdown */}
                <div className="relative" ref={signupRef}>
                  <Button
                    onClick={() => setShowSignupMenu((s) => !s)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white flex items-center gap-2"
                  >
                    <FaUserPlus className="mr-2" /> Signup
                  </Button>

                  {showSignupMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                      <Link
                        to="/register-learner"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowSignupMenu(false)}
                      >
                        Register as Learner
                      </Link>
                      <Link
                        to="/register-instructor"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowSignupMenu(false)}
                      >
                        Register as Instructor
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Avatar + dropdown
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setShowAvatarMenu((s) => !s)}
                  className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold focus:outline-none"
                  title={user?.username || user?.name || "User"}
                >
                  {initials(user?.username || user?.name)}
                </button>

                {showAvatarMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowAvatarMenu(false)}
                    >
                      Profile
                    </Link>

                    {/* show different menu item based on role */}
                    {user?.role === "learner" && (
                      <Link
                        to="/courses/purchased"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAvatarMenu(false)}
                      >
                        Purchased Courses
                      </Link>
                    )}

                    {user?.role === "instructor" && (
                      <Link
                        to="/mycourses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowAvatarMenu(false)}
                      >
                        My Courses
                      </Link>
                    )}

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white shadow-md z-40">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-md font-medium ${
                  location.pathname === link.to
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.text}
              </Link>
            ))}
            <div className="border-t pt-4 flex flex-col space-y-3">
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>

                  <div className="flex flex-col">
                    <Link
                      to="/register-learner"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
                    >
                      Signup as Learner
                    </Link>
                    <Link
                      to="/register-instructor"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center mt-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Signup as Instructor
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>

                  {user?.role === "learner" && (
                    <Link
                      to="/courses/purchased"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Purchased Courses
                    </Link>
                  )}

                  {user?.role === "instructor" && (
                    <Link
                      to="/mycourses"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                    >
                      My Courses
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

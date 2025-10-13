import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FaSignInAlt, FaUserPlus, FaSearch } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { Menu, X } from "lucide-react";

const Header = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/courses", text: "Courses" },
    { to: "/instructors", text: "Instructors" },
    { to: "/blogs", text: "Blog/News" }, // Sửa "bogs" thành "blogs"
    { to: "/contacts", text: "Contact" },
  ];

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

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/login">
                <FaSignInAlt className="mr-2" /> Login
              </Link>
            </Button>
            <Button
              asChild
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <Link to="/register">
                <FaUserPlus className="mr-2" /> Signup
              </Link>
            </Button>
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
              <Button variant="outline" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button
                asChild
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  Signup
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

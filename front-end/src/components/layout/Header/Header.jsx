import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FaSignInAlt, FaUserPlus, FaSearch } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

const Header = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <MdAutoAwesome className="text-3xl text-indigo-500" />
          <span className="text-2xl font-bold italic text-indigo-500">
            Eduverse
          </span>
        </Link>

        {/* Menu */}
        <nav className="flex gap-8 flex-1 ml-8">
          <Link
            to="/"
            className={`font-medium transition-colors ${
              location.pathname === "/"
                ? "text-indigo-500"
                : "text-gray-900 hover:text-indigo-500"
            }`}
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`font-medium transition-colors ${
              location.pathname.startsWith("/courses")
                ? "text-indigo-500"
                : "text-gray-900 hover:text-indigo-500"
            }`}
          >
            Courses
          </Link>
          <Link
            to="/instructors"
            className={`font-medium transition-colors ${
              location.pathname.startsWith("/instructors")
                ? "text-indigo-500"
                : "text-gray-900 hover:text-indigo-500"
            }`}
          >
            Instructors
          </Link>
          <Link
            to="/bogs"
            className={`font-medium transition-colors ${
              location.pathname.startsWith("/bogs")
                ? "text-indigo-500"
                : "text-gray-900 hover:text-indigo-500"
            }`}
          >
            Blog/News
          </Link>
          <Link
            to="/contacts"
            className={`font-medium transition-colors ${
              location.pathname.startsWith("/contacts")
                ? "text-indigo-500"
                : "text-gray-900 hover:text-indigo-500"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 bg-white w-80">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search for courses..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 ml-4">
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2 border-gray-300 text-gray-900"
          >
            <Link to="/login">
              <FaSignInAlt className="mr-1" /> Login
            </Link>
          </Button>
          <Button
            asChild
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-none"
          >
            <Link to="/register">
              <FaUserPlus className="mr-1" /> Signup
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaBell, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { MdSchool } from "react-icons/md";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <MdSchool className="text-3xl text-indigo-600" />
          <h1 className="text-2xl font-semibold text-indigo-600">Eduverse</h1>
        </Link>

        <nav className="hidden md:flex gap-8 flex-1">
          <Link
            to="/"
            className="text-gray-700 font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/courses"
            className="text-gray-700 font-medium hover:text-primary transition-colors"
          >
            Courses
          </Link>
          <Link
            to="/instructors"
            className="text-gray-700 font-medium hover:text-primary transition-colors"
          >
            Instructors
          </Link>
          <Link
            to="/bogs"
            className="text-gray-700 font-medium hover:text-primary transition-colors"
          >
            Blog/News
          </Link>
          <Link
            to="/contacts"
            className="text-gray-700 font-medium hover:text-primary transition-colors"
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              to="/settings"
              className="text-gray-700 font-medium hover:text-primary transition-colors"
            >
              Settings
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg flex-1 max-w-md">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search for courses..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="relative p-2 text-gray-700 hover:text-primary transition-colors">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  3
                </span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      <FaUser />
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUser /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

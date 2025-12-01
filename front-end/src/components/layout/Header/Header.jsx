import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FaSignInAlt, FaUserPlus, FaSearch } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { Menu, X } from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

import { useSystem } from "@/context/SystemContext";

const Header = () => {
    const { systemConfig } = useSystem();
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSignupMenu, setShowSignupMenu] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const signupRef = useRef(null);
    const avatarRef = useRef(null);

    const headerBg = systemConfig?.appearance?.headerBgColor || "#ffffff";
    const headerText = systemConfig?.appearance?.headerTextColor || "#000000";
    const siteName = systemConfig?.general?.siteName || "EduVerse";

    const navLinks = [
        { to: "/", text: "Home" },
        { to: "/courses", text: "Courses" },
        { to: "/instructors", text: "Instructors" },
        { to: "/course/rooms", text: "Live" },
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
        navigate("/");
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
        <header
            className="shadow-sm sticky top-0 z-50 transition-colors duration-300"
            style={{ backgroundColor: headerBg, color: headerText }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <MdAutoAwesome className="text-3xl text-indigo-500" />
                        <span className="text-2xl font-bold italic text-indigo-500">{siteName}</span>
                    </Link>

                    {/* Desktop Menu & Search */}
                    <div className="hidden lg:flex items-center gap-8">
                        <nav className="flex gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`font-medium transition-colors hover:opacity-80`}
                                    style={{
                                        color: location.pathname === link.to ? "#6366f1" : headerText,
                                    }}
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
                        {isAuthenticated && <NotificationDropdown />}
                        {!isAuthenticated ? (
                            <>
                                <Button variant="outline" asChild>
                                    <Link to="/login">
                                        <FaSignInAlt className="mr-2" /> Sign in
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
                                                Sign up as Learner
                                            </Link>
                                            <Link
                                                to="/register-instructor"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowSignupMenu(false)}
                                            >
                                                Sign up as Instructor
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
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            Settings
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            Learning
                                        </Link>
                                        {user?.role === "instructor" && (
                                            <>
                                                <Link
                                                    to="/mycourses"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    Instructor
                                                </Link>

                                                <Link
                                                    to="/dashboard-instructor"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    Analytics
                                                </Link>
                                            </>
                                        )}
                                        <Link
                                            to="/payment-history"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            Payment History
                                        </Link>

                                        {/* show different menu item based on role */}
                                        {/* {user?.role === "learner" && (
                                            <>
                                                <Link
                                                    to="/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/payment-history"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    Payment History
                                                </Link>
                                            </>
                                        )} */}

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
                        <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
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
                                            Sign in
                                        </Link>
                                    </Button>

                                    <div className="flex flex-col">
                                        <Link
                                            to="/register-learner"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
                                        >
                                            Sign up as Learner
                                        </Link>
                                        <Link
                                            to="/register-instructor"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center mt-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                                        >
                                            Sign up as Instructor
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        Settings
                                    </Link>

                                    <Link
                                        to="/payment-history"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        Payment History
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
                                    {user?.role === "instructor" && (
                                        <Link
                                            to="/dashboard-instructor"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-center px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                        >
                                            Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={async () => {
                                            await logout();
                                            setIsMenuOpen(false);
                                            navigate("/login");
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

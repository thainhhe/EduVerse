import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FaSignInAlt, FaUserPlus, FaSearch, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import {
    Menu,
    X,
    ChevronDown,
    Settings,
    CreditCard,
    BookOpen,
    LayoutDashboard,
    LogOut,
    User,
    GraduationCap,
    FileText,
} from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";

import { useSystem } from "@/context/SystemContext";
import { getAllCoursePublished } from "@/services/courseService";
import { getAllInstructor } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const Header = () => {
    // Force update
    const { systemConfig } = useSystem();
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSignupMenu, setShowSignupMenu] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState({ courses: [], instructors: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const searchRef = useRef(null);
    const signupRef = useRef(null);
    const avatarRef = useRef(null);

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    };

    // Fetch suggestions with debounce
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.trim().length < 2) {
                setSuggestions({ courses: [], instructors: [] });
                setShowSuggestions(false);
                return;
            }

            setIsLoadingSuggestions(true);
            try {
                const [coursesRes, instructorsRes] = await Promise.all([
                    getAllCoursePublished(),
                    getAllInstructor(),
                ]);

                console.log("coursesRes", coursesRes);
                console.log("instructorsRes", instructorsRes);

                const courses = (coursesRes?.data || [])
                    .filter((c) =>
                        removeVietnameseTones(c.title.toLowerCase()).includes(
                            removeVietnameseTones(searchTerm.toLowerCase())
                        )
                    )
                    .slice(0, 5);

                const instructors = (instructorsRes?.data || [])
                    .filter((i) =>
                        removeVietnameseTones(i.username.toLowerCase()).includes(
                            removeVietnameseTones(searchTerm.toLowerCase())
                        )
                    )
                    .slice(0, 3);

                setSuggestions({ courses, instructors });
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                fetchSuggestions();
            } else {
                setSuggestions({ courses: [], instructors: [] });
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (signupRef.current && !signupRef.current.contains(event.target)) {
                setShowSignupMenu(false);
            }
            if (avatarRef.current && !avatarRef.current.contains(event.target)) {
                setShowAvatarMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = () => {
        setShowSuggestions(false);
        if (searchTerm.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleSuggestionClick = (path) => {
        setShowSuggestions(false);
        setSearchTerm("");
        navigate(path);
    };

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
                        <nav className="flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            isActive ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50/80"
                                        }`}
                                        style={{
                                            color: isActive ? "#4f46e5" : headerText,
                                            fontWeight: isActive ? 600 : 500,
                                        }}
                                    >
                                        {link.text}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="relative w-72" ref={searchRef}>
                            <div className="flex items-center gap-0 border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                <input
                                    type="text"
                                    placeholder="Search for courses, instructors..."
                                    className="bg-transparent border-none outline-none flex-1 text-sm px-4 py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                                    onFocus={() => {
                                        if (searchTerm.trim().length >= 2) setShowSuggestions(true);
                                    }}
                                />
                                <button
                                    onClick={handleSearchSubmit}
                                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 transition-colors"
                                    title="Search"
                                >
                                    <FaSearch className="text-base" />
                                </button>
                            </div>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                                    {isLoadingSuggestions ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            Loading...
                                        </div>
                                    ) : suggestions.courses.length === 0 &&
                                      suggestions.instructors.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No results found
                                        </div>
                                    ) : (
                                        <>
                                            {/* Courses Section */}
                                            {suggestions.courses.length > 0 && (
                                                <div className="py-2">
                                                    {suggestions.courses.map((course) => (
                                                        <div
                                                            key={course._id}
                                                            onClick={() =>
                                                                handleSuggestionClick(
                                                                    `/courses/${course._id}`
                                                                )
                                                            }
                                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={
                                                                        course.thumbnail || "/placeholder.svg"
                                                                    }
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 truncate">
                                                                    {course.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {course.main_instructor?.username ||
                                                                        "Unknown Instructor"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Instructors Section */}
                                            {suggestions.instructors.length > 0 && (
                                                <div className="py-2 border-t border-gray-50">
                                                    {suggestions.instructors.map((instructor) => (
                                                        <div
                                                            key={instructor._id}
                                                            onClick={() =>
                                                                handleSuggestionClick(
                                                                    `/instructors/${instructor._id}`
                                                                )
                                                            }
                                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                                {initials(instructor.username)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 truncate">
                                                                    {instructor.username}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {instructor.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
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
                                        className={`flex items-center gap-2 transition-all duration-200 ${
                                            showSignupMenu
                                                ? "bg-indigo-600 ring-2 ring-indigo-200 ring-offset-1"
                                                : "bg-indigo-500 hover:bg-indigo-600"
                                        } text-white shadow-md hover:shadow-lg`}
                                    >
                                        <FaUserPlus className="text-lg" />
                                        <span>Sign up</span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                                showSignupMenu ? "rotate-180" : ""
                                            }`}
                                        />
                                    </Button>

                                    <div
                                        className={`absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 transform transition-all duration-200 origin-top-right ${
                                            showSignupMenu
                                                ? "opacity-100 scale-100 translate-y-0 visible"
                                                : "opacity-0 scale-95 -translate-y-2 invisible"
                                        }`}
                                    >
                                        <div className="px-3 py-2 border-b border-gray-50 mb-2">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Join EduVerse as
                                            </p>
                                        </div>

                                        <Link
                                            to="/register-learner"
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                                            onClick={() => setShowSignupMenu(false)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                                <FaUserGraduate className="text-lg" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">
                                                    Learner
                                                </p>
                                                <p className="text-xs text-gray-500 leading-tight">
                                                    Start your learning journey
                                                </p>
                                            </div>
                                        </Link>

                                        <Link
                                            to="/register-instructor"
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors group mt-1"
                                            onClick={() => setShowSignupMenu(false)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                                                <FaChalkboardTeacher className="text-lg" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700">
                                                    Instructor
                                                </p>
                                                <p className="text-xs text-gray-500 leading-tight">
                                                    Share your knowledge
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Avatar + dropdown
                            <div className="relative" ref={avatarRef}>
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user?.username || user?.name}
                                        className={`w-10 h-10 rounded-full cursor-pointer object-cover shadow-md transition-all duration-200 ${
                                            showAvatarMenu
                                                ? "ring-2 ring-indigo-200 ring-offset-2"
                                                : "hover:shadow-lg"
                                        }`}
                                        onClick={() => setShowAvatarMenu((s) => !s)}
                                    />
                                ) : (
                                    <div
                                        className={`w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer shadow-md transition-all duration-200 ${
                                            showAvatarMenu
                                                ? "ring-2 ring-indigo-200 ring-offset-2"
                                                : "hover:shadow-lg"
                                        }`}
                                        onClick={() => setShowAvatarMenu((s) => !s)}
                                        title={user?.username || user?.name || "User"}
                                    >
                                        {initials(user?.username || user?.name)}
                                    </div>
                                )}
                                <div
                                    className={`absolute left-1/2 -translate-x-1/2 mt-3 min-w-[200px] w-max bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 transition-all duration-300 ease-out ${
                                        showAvatarMenu ? "opacity-100 visible" : "opacity-0 invisible"
                                    }`}
                                >
                                    {/* User Profile Summary */}
                                    <div
                                        className={`px-4 py-3 border-b border-gray-50 mb-2 transition-all duration-300 ease-out overflow-hidden ${
                                            showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                        }`}
                                        style={{
                                            transitionDelay: showAvatarMenu
                                                ? "50ms"
                                                : user?.role === "instructor"
                                                ? "350ms"
                                                : "250ms",
                                        }}
                                    >
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {user?.username || user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate capitalize">
                                            {user?.role}
                                        </p>
                                    </div>

                                    <div className="px-2 space-y-1">
                                        <Link
                                            to="/dashboard"
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ease-out overflow-hidden ${
                                                showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                            }`}
                                            style={{
                                                transitionDelay: showAvatarMenu
                                                    ? "100ms"
                                                    : user?.role === "instructor"
                                                    ? "300ms"
                                                    : "200ms",
                                            }}
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            <GraduationCap className="w-4 h-4" />
                                            Learning
                                        </Link>

                                        {user?.role === "instructor" && (
                                            <>
                                                <Link
                                                    to="/dashboard-instructor"
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ease-out overflow-hidden ${
                                                        showAvatarMenu
                                                            ? "opacity-100 max-h-20"
                                                            : "opacity-0 max-h-0"
                                                    }`}
                                                    style={{
                                                        transitionDelay: showAvatarMenu ? "150ms" : "250ms",
                                                    }}
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/mycourses"
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ease-out overflow-hidden ${
                                                        showAvatarMenu
                                                            ? "opacity-100 max-h-20"
                                                            : "opacity-0 max-h-0"
                                                    }`}
                                                    style={{
                                                        transitionDelay: showAvatarMenu ? "200ms" : "200ms",
                                                    }}
                                                    onClick={() => setShowAvatarMenu(false)}
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    My Courses
                                                </Link>
                                            </>
                                        )}

                                        <Link
                                            to="/reports/my-reports"
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ease-out overflow-hidden ${
                                                showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                            }`}
                                            style={{
                                                transitionDelay: showAvatarMenu
                                                    ? user?.role === "instructor"
                                                        ? "250ms"
                                                        : "150ms"
                                                    : "150ms",
                                            }}
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            <FileText className="w-4 h-4" />
                                            My Reports
                                        </Link>

                                        <Link
                                            to="/payment-history"
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 ease-out overflow-hidden ${
                                                showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                            }`}
                                            style={{
                                                transitionDelay: showAvatarMenu
                                                    ? user?.role === "instructor"
                                                        ? "300ms"
                                                        : "200ms"
                                                    : "100ms",
                                            }}
                                            onClick={() => setShowAvatarMenu(false)}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Payment History
                                        </Link>

                                        <div
                                            className={`border-t border-gray-50 my-1 pt-1 transition-all duration-300 ease-out overflow-hidden ${
                                                showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                            }`}
                                            style={{
                                                transitionDelay: showAvatarMenu
                                                    ? user?.role === "instructor"
                                                        ? "350ms"
                                                        : "250ms"
                                                    : "50ms",
                                            }}
                                        >
                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                onClick={() => setShowAvatarMenu(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </Link>
                                        </div>

                                        <div
                                            className={`border-t border-gray-50 my-1 pt-1 transition-all duration-300 ease-out overflow-hidden ${
                                                showAvatarMenu ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                                            }`}
                                            style={{
                                                transitionDelay: showAvatarMenu
                                                    ? user?.role === "instructor"
                                                        ? "400ms"
                                                        : "300ms"
                                                    : "0ms",
                                            }}
                                        >
                                            <button
                                                onClick={onLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                    {/* User Profile Summary */}
                                    <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50/50 rounded-xl mb-2 border border-indigo-100">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                                            {initials(user?.username || user?.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {user?.username || user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                {user?.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                        >
                                            <GraduationCap className="w-5 h-5" />
                                            <span className="font-medium">Learning</span>
                                        </Link>

                                        <Link
                                            to="/reports/my-reports"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span className="font-medium">My Reports</span>
                                        </Link>

                                        <Link
                                            to="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                        >
                                            <Settings className="w-5 h-5" />
                                            <span className="font-medium">Settings</span>
                                        </Link>

                                        <Link
                                            to="/payment-history"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            <span className="font-medium">Payment History</span>
                                        </Link>
                                        {user?.role === "instructor" && (
                                            <>
                                                <Link
                                                    to="/mycourses"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                                >
                                                    <BookOpen className="w-5 h-5" />
                                                    <span className="font-medium">My Courses</span>
                                                </Link>
                                                <Link
                                                    to="/dashboard-instructor"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                                                >
                                                    <LayoutDashboard className="w-5 h-5" />
                                                    <span className="font-medium">Dashboard</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="pt-2 mt-2 border-t border-gray-100">
                                            <button
                                                onClick={async () => {
                                                    await logout();
                                                    setIsMenuOpen(false);
                                                    navigate("/login");
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </div>
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

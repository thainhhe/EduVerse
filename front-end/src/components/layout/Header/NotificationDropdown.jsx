import { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { Bell, BellRing, Check } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import notificationService from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { data: notificationData, isLoading } = useQuery(
        ["notifications", user?._id],
        () => notificationService.getByReceiverId(user._id),
        {
            enabled: !!user?._id,
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        if (notificationData?.data) {
            setNotifications(notificationData.data.notifications || []);
            setUnreadCount(notificationData.data.unreadCount || 0);
        }
    }, [notificationData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllAsRead = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            await notificationService.markAllAsRead(user._id);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        setIsOpen(false);
        navigate("/notifications");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
                <BellRing className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                            >
                                <Check className="w-3 h-3" /> Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Bell className="w-12 h-12 text-gray-200 mb-2" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${
                                            !notification.isRead ? "bg-indigo-50/30" : ""
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {notification.senderId?.avatar ? (
                                                <img
                                                    src={notification.senderId.avatar}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                        notification.type === "success"
                                                            ? "bg-green-500"
                                                            : notification.type === "warning"
                                                            ? "bg-yellow-500"
                                                            : notification.type === "error"
                                                            ? "bg-red-500"
                                                            : "bg-indigo-500"
                                                    }`}
                                                >
                                                    {notification.type === "info" ? "i" : "!"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {notification.title && (
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {notification.title}
                                                </p>
                                            )}
                                            <p
                                                className={`text-sm text-gray-600 truncate ${
                                                    !notification.title ? "font-medium text-gray-900" : ""
                                                }`}
                                            >
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 self-center">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-center">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/notifications");
                            }}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

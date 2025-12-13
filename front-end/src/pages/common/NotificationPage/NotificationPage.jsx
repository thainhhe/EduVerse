import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Bell, Check, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import notificationService from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ToastHelper } from "@/helper/ToastHelper";
import api from "@/services/api";

const NotificationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: notificationData, isLoading } = useQuery(
        ["notifications", user?._id, page, debouncedSearch],
        () => notificationService.getByReceiverId(user._id, { page, limit: 10, search: debouncedSearch }),
        {
            enabled: !!user?._id,
            refetchOnWindowFocus: false,
            keepPreviousData: true,
        }
    );

    useEffect(() => {
        if (notificationData?.data) {
            setNotifications(notificationData.data.notifications || []);
            setTotalPages(notificationData.data.pagination?.totalPages || 1);
        }
    }, [notificationData]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistic update
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
            queryClient.invalidateQueries(["notifications", user?._id]);
        } catch (error) {
            console.error("Error marking as read", error);
            ToastHelper.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            await notificationService.markAllAsRead(user._id);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            queryClient.invalidateQueries(["notifications", user?._id]);
            ToastHelper.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all as read", error);
            ToastHelper.error("Failed to mark all as read");
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id);
        }
    };

    const handleAcceptInvitation = async (notification) => {
        try {
            await api.post(notification.link);
            handleMarkAsRead(notification._id);
            ToastHelper.success("Invitation accepted successfully");
        } catch (error) {
            console.error("Error accepting invitation", error);
            ToastHelper.error("Failed to accept invitation");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Bell className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                                    <p className="text-sm text-gray-500">Manage your notifications</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64"
                                    />
                                </div>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={loading}
                                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                        title="Mark all as read"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {debouncedSearch
                                        ? "Try adjusting your search terms"
                                        : "We'll notify you when something important happens"}
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex gap-4 ${
                                        !notification.isRead ? "bg-indigo-50/30" : ""
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {notification.senderId?.avatar ? (
                                            <img
                                                src={notification.senderId.avatar}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                            />
                                        ) : (
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
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
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                {notification.title && (
                                                    <h4 className="text-base font-semibold text-gray-900 mb-0.5">
                                                        {notification.title}
                                                    </h4>
                                                )}
                                                <p
                                                    className={`text-sm text-gray-600 ${
                                                        !notification.title ? "font-medium text-gray-900" : ""
                                                    }`}
                                                >
                                                    {notification.message}
                                                    {notification.link.includes("/permission/accept") && (
                                                        <span
                                                            className="text-indigo-600 font-semibold cursor-pointer mx-4"
                                                            onClick={() =>
                                                                handleAcceptInvitation(notification)
                                                            }
                                                        >
                                                            Accept
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notification.isRead && (
                                                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-indigo-100"></span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSystem } from "@/context/SystemContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SessionTimeout = () => {
    const { isAuthenticated, logout } = useAuth();
    const { systemConfig } = useSystem();
    const navigate = useNavigate();

    // Default to 30 minutes if not set
    const timeoutMinutes = parseInt(systemConfig?.security?.sessionTimeout || "30", 10);
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (isAuthenticated) {
            timerRef.current = setTimeout(() => {
                handleLogout();
            }, timeoutMs);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.info("Session expired due to inactivity.");
            navigate("/login");
        } catch (error) {
            console.error("Auto logout failed:", error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ["mousedown", "keydown", "scroll", "touchstart"];

        const handleActivity = () => {
            resetTimer();
        };

        // Initial set
        resetTimer();

        // Add event listeners
        events.forEach((event) => {
            document.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated, timeoutMs]);

    return null; // This component doesn't render anything
};

export default SessionTimeout;

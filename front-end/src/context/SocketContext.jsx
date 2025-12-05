import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { ToastHelper } from "@/helper/ToastHelper";
import { useQueryClient } from "react-query";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:9999");
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user?._id) {
            socket.emit("join", user._id);
        }
    }, [socket, user]);

    useEffect(() => {
        if (socket) {
            socket.on("new-notification", (notification) => {
                queryClient.invalidateQueries("notifications");
                queryClient.invalidateQueries("unread-notifications");
            });

            socket.on("delete-notification", (id) => {
                queryClient.invalidateQueries("notifications");
                queryClient.invalidateQueries("unread-notifications");
            });

            return () => {
                socket.off("new-notification");
                socket.off("delete-notification");
            };
        }
    }, [socket, queryClient]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import adminService from "@/services/adminService";

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const [systemConfig, setSystemConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSystemSettings = async () => {
        try {
            const settings = await adminService.getSystemSettings();
            if (settings) {
                setSystemConfig(settings);
            }
        } catch (error) {
            console.error("Failed to fetch system settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    const updateSystemConfig = (newConfig) => {
        setSystemConfig((prev) => ({ ...prev, ...newConfig }));
    };

    return (
        <SystemContext.Provider value={{ systemConfig, updateSystemConfig, loading, fetchSystemSettings }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) {
        throw new Error("useSystem must be used within a SystemProvider");
    }
    return context;
};

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { enrollmentService } from "@/services/enrollmentService";

export const EnrollmentContext = createContext(null);

export const EnrollmentProvider = ({ children }) => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEnrollments = useCallback(async () => {
        if (!user?._id) {
            setEnrollments([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await enrollmentService.getEnrollmentsByUser(user._id);
            console.log("res in enrollmentService.getEnrollmentsByUser(user._id); ", res)
            const data = Array.isArray(res) ? res : res?.data || [];
            setEnrollments(data);
        } catch (error) {
            console.error("❌ Lỗi khi tải enrollments:", error);
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    // load enrollments khi user đăng nhập
    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    const isEnrolled = useCallback(
        (courseId) => enrollments.some((e) => e.courseId === courseId),
        [enrollments]
    );

    const refreshEnrollments = useCallback(async () => {
        await fetchEnrollments();
    }, [fetchEnrollments]);

    return (
        <EnrollmentContext.Provider
            value={{
                enrollments,
                loading,
                isEnrolled,
                refreshEnrollments,
            }}
        >
            {children}
        </EnrollmentContext.Provider>
    );
};

// Hook tiện dụng
export const useEnrollment = () => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error("useEnrollment phải được dùng bên trong EnrollmentProvider");
    }
    return context;
};

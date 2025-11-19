import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCourseById } from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const { user } = useAuth();
    const [coursePermissions, setCoursePermissions] = useState([]);
    const [isMainInstructor, setIsMainInstructor] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadPermissions = useCallback(async () => {
        try {
            const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseData") : null;
            const sessionCourseData = raw ? JSON.parse(raw) : null;

            if (!sessionCourseData?._id || !user?._id) {
                setCoursePermissions([]);
                setIsMainInstructor(false);
                setLoading(false);
                return;
            }
            const res = await getCourseById(sessionCourseData._id);
            if (!res.success) return;
            const course = res.data;

            const main = course.main_instructor?._id?.toString();
            setIsMainInstructor(main === user._id.toString());

            const instructors = course?.instructors ?? [];
            const instructor = instructors.find((i) => i.user._id.toString() === user._id.toString());

            if (!instructor) {
                setCoursePermissions([]);
            } else {
                setCoursePermissions(instructor.permission.map((p) => p.name));
            }
        } catch (err) {
            console.error("❌ Load permission error:", err);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const hasPermission = useCallback(
        (permName) => {
            if (!permName) return false;
            return coursePermissions.includes(permName);
        },
        [coursePermissions]
    );

    const refreshPermissions = () => loadPermissions();

    return (
        <PermissionContext.Provider
            value={{
                loading,
                isMainInstructor,
                permissions: coursePermissions,
                hasPermission,
                refreshPermissions,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);

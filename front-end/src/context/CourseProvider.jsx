import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getCourseById } from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_PREFIX = "course_draft_";
const BROADCAST_KEY = `${STORAGE_PREFIX}broadcast`;

const CourseContext = createContext(null);

export const CourseProvider = ({ children, courseId = "new" }) => {
    const { user } = useAuth();

    const key = STORAGE_PREFIX + (courseId || "new");

    const [draft, setDraft] = useState(() => {
        try {
            if (typeof window === "undefined") return {};
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // persist draft to sessionStorage
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            if (draft && Object.keys(draft).length > 0) {
                sessionStorage.setItem(key, JSON.stringify(draft));
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            } else {
                sessionStorage.removeItem(key);
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            }
        } catch {}
    }, [key, draft]);

    // listen to storage events
    useEffect(() => {
        if (typeof window === "undefined") return;
        const onStorage = (ev) => {
            if (!ev.key) return;
            try {
                if (ev.key === key) {
                    setDraft(ev.newValue ? JSON.parse(ev.newValue) : {});
                } else if (ev.key === BROADCAST_KEY) {
                    const raw = sessionStorage.getItem(key);
                    setDraft(raw ? JSON.parse(raw) : {});
                }
            } catch {
                setDraft({});
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [key]);

    const updateDraft = useCallback(
        (patch) => {
            setDraft((prev) => {
                const next = { ...(prev || {}), ...(patch || {}) };
                try {
                    if (typeof window !== "undefined") {
                        sessionStorage.setItem(key, JSON.stringify(next));
                        sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
                    }
                } catch {}
                return next;
            });
        },
        [key]
    );

    const clearDraft = useCallback(() => {
        setDraft({});
        try {
            if (typeof window !== "undefined") {
                sessionStorage.removeItem(key);
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            }
        } catch {}
    }, [key]);

    const [coursePermissions, setCoursePermissions] = useState([]);
    const [isMainInstructor, setIsMainInstructor] = useState(false);
    const [loadingPermission, setLoadingPermission] = useState(true);
    const [canUpdate, setCanUpdate] = useState(false);

    const loadPermissions = useCallback(async () => {
        try {
            const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseData") : null;
            const sessionCourseData = raw ? JSON.parse(raw) : null;

            if (!sessionCourseData?._id || !user?._id) {
                setCoursePermissions([]);
                setIsMainInstructor(false);
                setLoadingPermission(false);
                return;
            }

            const res = await getCourseById(sessionCourseData._id);
            if (!res.success) return;
            const course = res.data;

            const main = course.main_instructor?._id?.toString();
            setIsMainInstructor(main === user._id.toString());

            const instructors = course?.instructors ?? [];
            const instructor = instructors.find((i) => i.user._id.toString() === user._id.toString());
            setCoursePermissions(instructor ? instructor.permission.map((p) => p.name) : []);
        } catch (err) {
            console.error("Load permission error:", err);
            setCoursePermissions([]);
            setIsMainInstructor(false);
        }
        setLoadingPermission(false);
    }, [user]);

    useEffect(() => {
        if (user) loadPermissions();
    }, [loadPermissions, user]);

    const hasPermission = useCallback(
        (permName) => {
            if (!permName) return false;
            return coursePermissions.includes(permName);
        },
        [coursePermissions]
    );

    const canUpdateCourse = draft?.status === "draft";

    const refreshPermissions = () => loadPermissions();

    const value = useMemo(
        () => ({
            courseId,
            draft,
            canUpdateCourse,
            updateDraft,
            clearDraft,
            loadingDraft: false,
            loadingPermission,
            isMainInstructor,
            permissions: coursePermissions,
            hasPermission,
            refreshPermissions,
        }),
        [
            courseId,
            draft,
            updateDraft,
            clearDraft,
            loadingPermission,
            isMainInstructor,
            coursePermissions,
            hasPermission,
        ]
    );

    return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourse = () => {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error("useCourse must be used inside CourseProvider");
    return ctx;
};

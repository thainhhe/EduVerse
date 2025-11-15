import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const STORAGE_PREFIX = "course_draft_";
const BROADCAST_KEY = `${STORAGE_PREFIX}broadcast`;
const CourseDraftContext = createContext(null);

export const CourseDraftProvider = ({ children, courseId = "new" }) => {
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
                // quick broadcast so same-tab listeners can react if needed
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            } else {
                sessionStorage.removeItem(key);
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            }
        } catch {}
    }, [key, draft]);

    // listen to storage events (cross-tab and same-tab via broadcast)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const onStorage = (ev) => {
            if (!ev.key) return;
            try {
                if (ev.key === key) {
                    setDraft(ev.newValue ? JSON.parse(ev.newValue) : {});
                } else if (ev.key === BROADCAST_KEY) {
                    // when broadcast happens, re-read the specific key
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

    const update = useCallback(
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

    const clear = useCallback(() => {
        setDraft({});
        try {
            if (typeof window !== "undefined") {
                sessionStorage.removeItem(key);
                sessionStorage.setItem(BROADCAST_KEY, JSON.stringify({ key, at: Date.now() }));
            }
        } catch {}
    }, [key]);

    const value = useMemo(() => ({ draft, update, clear, courseId }), [draft, update, clear, courseId]);

    return <CourseDraftContext.Provider value={value}>{children}</CourseDraftContext.Provider>;
};

export const useCourseDraft = () => {
    const ctx = useContext(CourseDraftContext);
    if (!ctx) throw new Error("useCourseDraft must be used inside CourseDraftProvider");
    return ctx;
};

export default CourseDraftContext;

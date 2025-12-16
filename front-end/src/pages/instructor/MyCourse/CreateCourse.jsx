import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Basics from "./Basics";
import { CourseProvider } from "@/context/CourseProvider";
import { getCourseById } from "@/services/courseService";

const CreateCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;

    const courseId = location.state?.isNew ? null : location.state?.id || sessionCourseId || null;
    const isUpdateMode = !!courseId;

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.isNew && typeof window !== "undefined") {
            sessionStorage.removeItem("currentCourseId");
            sessionStorage.removeItem("currentCourseData");
        }
    }, [location.state]);

    useEffect(() => {
        if (!isUpdateMode) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = await getCourseById(courseId);
                const data = res?.data ?? res;
                setCourseData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, isUpdateMode]);

    const handleBack = () => {
        const from = location.state?.from;
        navigate(from || "/mycourses");
    };

    return (
        <CourseProvider courseId={courseId || "new"}>
            <div>
                <header className="mt-2">
                    <Button
                        variant="ghost"
                        className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        onClick={handleBack}
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        <span className="text-sm">My Courses</span>
                    </Button>
                </header>

                <main className="mt-3">
                    <Basics courseId={courseId} courseData={courseData} isUpdate={isUpdateMode} />
                </main>
            </div>
        </CourseProvider>
    );
};

export default CreateCourse;

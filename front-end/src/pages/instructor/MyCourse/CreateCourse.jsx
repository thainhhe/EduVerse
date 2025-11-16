import React, { useEffect, useState } from "react";
import Basics from "./Basics";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { getCourseById } from "@/services/courseService";
import { CourseDraftProvider } from "@/context/CourseDraftContext";

const CreateCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();

    //Lấy id từ sessionStorage nếu có
    const sessionCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;

    /**
     * Ưu tiên:
     * location.state.id → khi sửa khoá học
     * nếu location.state.isNew === true → tạo mới ⇒ bỏ session
     * nếu không có gì → dùng sessionCourseId
     */
    const courseId = location.state?.isNew ? null : location.state?.id || sessionCourseId || null;

    //Nếu đang tạo mới → xoá session tránh load nhầm draft cũ
    useEffect(() => {
        if (location.state?.isNew && typeof window !== "undefined") {
            sessionStorage.removeItem("currentCourseId");
            sessionStorage.removeItem("currentCourseData");
        }
    }, [location.state]);

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(false);

    const isUpdateMode = !!courseId;

    //Nếu có courseId → fetch dữ liệu từ server
    useEffect(() => {
        if (!isUpdateMode) return;

        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = await getCourseById(courseId);
                const data = res?.data ?? res;
                setCourseData(data);
            } catch (err) {
                console.error("Failed to fetch course:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, isUpdateMode]);

    //Quay lại trang trước
    const handleBack = () => {
        const from = location.state?.from;
        if (from) return navigate(from);
        navigate("/mycourses");
    };

    return (
        <div>
            <header>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        onClick={handleBack}
                    >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        <div>
                            <div className="text-sm ">My Courses</div>
                        </div>
                    </Button>
                </div>
            </header>

            <main className="mt-5">
                <CourseDraftProvider courseId={courseId || "new"}>
                    <Basics courseId={courseId} isUpdate={isUpdateMode} courseData={courseData} loading={loading} />
                </CourseDraftProvider>
            </main>
        </div>
    );
};

export default CreateCourse;

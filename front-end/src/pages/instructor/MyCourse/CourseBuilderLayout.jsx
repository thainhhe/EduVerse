import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { CourseDraftProvider } from "@/context/CourseDraftContext"; // added

const CourseBuilderLayout = () => {
    const navigate = useNavigate();

    const sessionCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;
    const sessionCourse =
        typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("currentCourseData")) : null;

    return (
        <div>
            <header className="">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                            onClick={() => navigate("/create-course")}
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            <div>
                                <div className="text-sm ">My Courses</div>
                            </div>
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Clock className="text-green-500 w-5 h-5" />
                        <span>
                            Last Updated:{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {sessionCourse.lastUpdated}
                            </span>
                        </span>
                    </div>
                </div>
            </header>
            <div className="flex min-h-screen">
                <SideBar />
                <main className="flex-1 mt-2">
                    {/* Wrap builder pages with provider (no UI changes) */}
                    <CourseDraftProvider courseId={sessionCourseId || "new"}>
                        <Outlet />
                    </CourseDraftProvider>
                </main>
            </div>
        </div>
    );
};

export default CourseBuilderLayout;

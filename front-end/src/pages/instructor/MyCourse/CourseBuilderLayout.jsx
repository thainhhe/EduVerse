import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { CourseProvider, useCourse } from "@/context/CourseProvider";

const BuilderInner = () => {
    const navigate = useNavigate();
    const sessionCourse = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("currentCourseData")) : {};

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 mt-2">
                <header className="flex items-center justify-between mb-4">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/create-course-basic")}
                            className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            <span className="text-sm">My Courses</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="text-green-500 w-5 h-5" />
                        <span>
                            Last Updated:{" "}
                            <span className="font-medium text-gray-900">{sessionCourse?.lastUpdated ?? "—"}</span>
                        </span>
                    </div>
                </header>
                <div className="flex flex-1">
                    <SideBar />
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

const CourseBuilderLayout = () => {
    const sessionCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;
    return (
        <CourseProvider courseId={sessionCourseId || "new"}>
            <BuilderInner />
        </CourseProvider>
    );
};

export default CourseBuilderLayout;

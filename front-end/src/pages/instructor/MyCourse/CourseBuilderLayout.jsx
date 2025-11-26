import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { CourseProvider, useCourse } from "@/context/CourseProvider";
import { deleteCourse } from "@/services/courseService";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { ToastHelper } from "@/helper/ToastHelper";

const BuilderInner = () => {
  const navigate = useNavigate();
  const sessionCourse = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("currentCourseData")) : {};

  const { isMainInstructor } = useCourse();
  const isEditable = !!isMainInstructor;

  const handleDeleteDraft = async () => {
    try {
      const res = await deleteCourse(sessionCourse._id);
      if (res.success) {
        ToastHelper.success("Đã xóa khóa học.");
        navigate("/mycourses");
      }
    } catch (error) {
      console.log("err_delete_course:", error);
      ToastHelper.error("Lỗi khi xóa khóa học.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Fixed Header */}
        <header className="flex items-center justify-between py-4 bg-white flex-shrink-0 z-10">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/create-course-basic")}
              className="bg-white border border-indigo-600 text-black hover:bg-indigo-600 hover:text-white transition-colors duration-200"
            >
              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
              <span className="text-sm">My Courses</span>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {isEditable && (
              <ConfirmationHelper
                trigger={
                  <Button
                    variant="ghost"
                    className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                  >
                    Delete Course
                  </Button>
                }
                onConfirm={handleDeleteDraft}
              />
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock className="text-green-600 w-4 h-4" />
              <span>
                Last Updated: <span className="font-semibold text-gray-900">{sessionCourse?.lastUpdated ?? "—"}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Outlet Content */}
        <div className="flex-1 flex">
          <div className="flex-shrink-0 bg-white h-full">
            <SideBar />
          </div>
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

import React, { useEffect, useState } from "react";
import Basics from "./Basics";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { getCourseById } from "@/services/courseService";
import { CourseDraftProvider } from "@/context/CourseDraftContext"; // { added }

const CreateCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // đọc sessionCourseId trước, rồi ưu tiên location.state nếu có
  const sessionCourseId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("currentCourseId")
      : null;

  const courseId = location.state?.id || sessionCourseId || null;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isUpdateMode = !!courseId;

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

  const handleBack = () => {
    // prefer explicit origin passed in state
    const from = location.state?.from;
    if (from) {
      navigate(from);
      return;
    }

    navigate("/mycourses");
  };

  return (
    <div>
      <header className="">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">My Courses</div>
          </div>
        </div>
      </header>
      <main className="mt-5">
        {/* Wrap Basics with provider so useCourseDraft works */}
        <CourseDraftProvider courseId={sessionCourseId || courseId || "new"}>
          <Basics
            courseId={courseId}
            isUpdate={isUpdateMode}
            courseData={courseData}
          />
        </CourseDraftProvider>
      </main>
    </div>
  );
};

export default CreateCourse;

import React, { useEffect, useState } from "react";
import Basics from "./Basics";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { getCourse } from "@/services/courseService";

const CreateCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.id || null;

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isUpdateMode = !!courseId;

  useEffect(() => {
    if (!isUpdateMode) return;
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await getCourse(courseId);
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

  return (
    <div>
      <header className="">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">My Courses</div>
          </div>
        </div>
      </header>
      <main className="mt-5">
        <Basics
          courseId={courseId}
          isUpdate={isUpdateMode}
          courseData={courseData}
        />
      </main>
    </div>
  );
};

export default CreateCourse;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CourseCardPublish = ({ course, role }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const handleEdit = (e) => {
    e?.stopPropagation?.();
    const id = course?._id || course?.id;
    if (!id) {
      console.warn("Missing course id when trying to edit", course);
      return;
    }
    // ensure fallback for other pages
    sessionStorage.setItem("currentCourseId", id);
    // navigate to Basics (create-course) and mark as update
    navigate("/create-course", { state: { id, isUpdate: true } });
  };

  // openModules used by inner buttons (stops propagation)
  const openModules = (e) => {
    e?.stopPropagation?.();
    const id = course._id ?? course.id ?? course.idStr;
    navigate("/create-course/modules", { state: { id } });
  };

  const handleDelete = (e) => {
    e?.stopPropagation?.();
    if (confirm("Are you sure you want to delete this course?")) {
      console.log("🗑️ Deleted course:", course.id);
      // TODO: Call API here
    }
  };
  const toggleVisibility = (e) => {
    e?.stopPropagation?.();
    setVisible(!visible);
    console.log(`🔁 Course ${course.id} visibility: ${!visible}`);
  };
  const handleOpenCourseQuiz = (e) => {
    e?.stopPropagation?.();
    const id = course._id ?? course.id ?? course.idStr;
    navigate("/create-course/modules", { state: { id, openQuiz: true } });
  };

  // Card click -> open create-course basics (instead of modules) if you prefer:
  const openModuleManager = () => {
    const id = course._id ?? course.id ?? course.idStr;
    if (!id) return;
    sessionStorage.setItem("currentCourseId", id);
    // open Basics edit view
    navigate("/create-course", { state: { id, isUpdate: true } });
  };

  return (
    <Card
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={openModuleManager}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="object-cover transition-transform group-hover:scale-105 w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="mb-3 text-lg font-semibold text-card-foreground">
          {course.title}
        </h3>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-medium text-foreground">{course.rating}</span>
          <span className="text-muted-foreground">
            ({course.reviewCount} person)
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t border-border p-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Students Enrolled: {course.studentsEnrolled}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last Updated: {course.lastUpdated}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={handleOpenCourseQuiz}>
            Add Quiz
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
export default CourseCardPublish;

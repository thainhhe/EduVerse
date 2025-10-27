import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseCardUnPublish = ({ course }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    const id = course?._id || course?.id;
    if (!id) {
      console.warn("Missing course id when trying to edit", course);
      return;
    }
    navigate("/create-course", { state: { id } });
  };

  const handleOpenCourseQuiz = () => {
    const id = course?._id || course?.id;
    if (!id)
      return console.warn("Missing course id when trying to open quiz", course);
    navigate("/create-course/modules", { state: { id, openQuiz: true } });
  };

  return (
    <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 hover:shadow-md transition-all border border-border">
      {/* Image */}
      <div className="w-full sm:w-1/4 aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Course Info */}
      <CardContent className="flex-1 w-full space-y-2 sm:space-y-3">
        <div>
          <h3 className="text-lg font-semibold">{course.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground uppercase">
              {course.status}
            </span>
            <span>{course.visibility}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Progress: {course.progress}%
          </p>
          <Progress
            value={course.progress}
            className="h-2 bg-muted-foreground/20"
          />
        </div>

        <div>
          <Button
            className="mt-2 text-sm"
            variant="default"
            onClick={handleEdit}
          >
            Continue update
          </Button>
          <Button
            className="mt-2 ml-2 text-sm"
            variant="ghost"
            onClick={handleOpenCourseQuiz}
          >
            Add Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardUnPublish;

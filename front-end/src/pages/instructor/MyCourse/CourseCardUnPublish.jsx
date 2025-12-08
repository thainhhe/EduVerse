import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseCardUnPublish = ({ course }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        // save courseId so child builder pages can read it even if location.state is lost
        const id = course._id ?? course.id ?? course.idStr ?? null;
        if (id) sessionStorage.setItem("currentCourseId", id);
        if (course) sessionStorage.setItem("currentCourseData", JSON.stringify(course));
        // navigate to Basics with isUpdate flag
        navigate("/create-course-basic", { state: { id, isUpdate: true } });
    };

    return (
        <div className="flex-1 items-center gap-6 p-4 border border-border rounded-lg hover:shadow-md transition-all">
            <div className="flex flex-1 flex-col sm:flex-row gap-6 p-4 ">
                <div className="w-full sm:w-1/4 aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="object-cover w-full h-full"
                    />
                </div>
                {/* Info */}
                <div className="flex-1 w-full space-y-2 sm:space-y-3">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold uppercase">
                            {course.status === "draft"
                                ? "Draft"
                                : course.status === "pending"
                                ? "Your course is pending review"
                                : course.status === "reject"
                                ? "Your course is rejected"
                                : "Unknown"}
                        </span>
                        <span className="text-muted-foreground">
                            {course.isPublished ? "Public" : "Private"}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Progress: {course.progress}%</p>
                        <Progress value={course.progress} className="h-2 bg-muted-foreground/20" />
                    </div>
                </div>
            </div>
            {/* Action */}
            <div className="flex flex-1 flex-row-reverse">
                <Button
                    variant="default"
                    onClick={handleEdit}
                    className="text-sm mr-2.5 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    Next step <ArrowRight />
                </Button>
            </div>
        </div>
    );
};

export default CourseCardUnPublish;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Clock, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CoCourse = ({ course }) => {
    const navigate = useNavigate();
    const mainInstructor = course.main_instructor?.username || "Unknown";
    const price = course?.price ? course.price.toLocaleString("vi-VN") + "đ" : "Free";
    const rating = course?.rating || 0;
    const enrolls = course?.totalEnrollments || 0;
    const duration = course?.duration?.value
        ? `${course.duration.value} ${course.duration.unit}`
        : "Not updated";
    const isDeleted = course?.isDeleted;

    const openModuleManager = () => {
        const id = course._id ?? course.id ?? course.idStr;
        if (!id) return;
        console.log("courseData", course);
        sessionStorage.setItem("currentCourseData", JSON.stringify(course));
        sessionStorage.setItem("currentCourseId", id);
        // open Basics edit view
        navigate("/create-course-basic");
    };

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            {/* Ảnh thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                    src={course?.thumbnail || course?.image || "/placeholder.svg"}
                    alt={course?.title}
                    className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                />
            </div>

            {/* Nội dung */}
            <CardContent className="px-2 py-4 space-y-1">
                <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
                <p className="text-sm text-indigo-600 pb-1">{mainInstructor}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Star size={16} /> {rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={16} /> {enrolls}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={16} /> {duration}
                    </span>
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="border-t p-4 flex justify-between items-center">
                <span className="font-semibold text-primary">{price}</span>
                {isDeleted ? (
                    <span className="text-red-600">Course deleted</span>
                ) : (
                    <Button
                        className="bg-white border-1 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        onClick={openModuleManager}
                    >
                        View <ArrowRight />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

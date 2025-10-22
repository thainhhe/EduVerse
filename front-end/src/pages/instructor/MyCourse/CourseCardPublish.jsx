import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star, Users, Clock, Edit, EyeOff, Eye, Trash } from "lucide-react"
import { useState } from "react";
import { useNavigate } from "react-router-dom";



const CourseCardPublish = ({ course, role }) => {
    const navigate = useNavigate()
    const [visible, setVisible] = useState(true);
    const handleEdit = () => {
        console.log("edit")
    }


    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this course?")) {
            console.log("🗑️ Deleted course:", course.id)
            // TODO: Call API here
        }
    }
    const toggleVisibility = () => {
        setVisible(!visible)
        console.log(`🔁 Course ${course.id} visibility: ${!visible}`)
    }
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
            </div>
            <CardContent className="p-4">
                <h3 className="mb-3 text-lg font-semibold text-card-foreground">{course.title}</h3>
                <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviewCount} person)</span>
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
            </CardFooter>


        </Card>
    )
}
export default CourseCardPublish
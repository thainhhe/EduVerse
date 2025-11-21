import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMyCourses } from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth";
import { getAllInstructor } from "@/services/userService";
import { User } from "lucide-react";

const Instructors = () => {
  const { user } = useAuth();
  console.log("user", user);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchInstructors = async () => {
    setLoading(true);
    const res = await getAllInstructor();
    console.log("res", res);
    if (res?.success) {
      const data = res.data || [];
      setInstructors(data);
      console.log("data", data);
    } else {
      // ⚠️ Khi API trả về success = false
      console.error("Lỗi từ server:", res?.message || "Không xác định");
      ToastHelper.error(
        res?.message || "Đã xảy ra lỗi khi lấy danh sách khóa học!"
      );
    }
  };
  useEffect(() => {
    fetchInstructors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Instructors
          </h1>
          <p className="text-lg text-gray-600">
            Meet our talented instructors and learn from the best in the field.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="flex flex-col items-center p-6 space-y-4">
                <Avatar className="w-12 h-12">
                  {instructor.avatar ? (
                    <AvatarImage
                      src={instructor.avatar}
                      alt={instructor.username}
                    />
                  ) : (
                    <AvatarFallback>
                      <User className="w-6 h-6 text-gray-500" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-semibold text-gray-900">
                  {instructor.username}
                </h3>
                <Badge className="bg-indigo-600 hover:bg-indigo-700">
                  Total course: {instructor.totalCourses}
                </Badge>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link to={`/instructors/${instructor.instructorId}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructors;

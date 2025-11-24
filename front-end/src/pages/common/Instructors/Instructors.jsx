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
      ToastHelper.error(res?.message || "Đã xảy ra lỗi khi lấy danh sách khóa học!");
    }
  };
  useEffect(() => {
    fetchInstructors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Featured Instructors</h1>
          <p className="text-lg text-gray-600">Meet our talented instructors and learn from the best in the field.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden group"
            >
              <CardContent className="flex flex-col items-center p-0">
                {/* Header Background */}
                <div className="h-24 w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative"></div>

                {/* Avatar - Overlapping Header */}
                <div className="-mt-16 mb-3 relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                    {instructor.avatar ? (
                      <AvatarImage src={instructor.avatar} alt={instructor.username} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gray-100">
                        <User className="w-12 h-12 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center px-6 pb-6 w-full space-y-3">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {instructor.username}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Instructor</p>
                  </div>

                  <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-indigo-600">
                      {instructor.totalCourses} {instructor.totalCourses === 1 ? "Course" : "Courses"}
                    </span>
                  </div>

                  <Button
                    asChild
                    className="w-full mt-2 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-semibold"
                  >
                    <Link to={`/instructors/${instructor.instructorId}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructors;

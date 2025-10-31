import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaRegStar } from "react-icons/fa";
import { getAllCoursePublished } from "@/services/courseService";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Lấy dữ liệu từ API thật

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await getAllCoursePublished();
        console.log("res", res)
        if (res?.success) {
          // ✅ Khi thành công
          const data = res.data || [];
          setCourses(data);
          console.log("Dữ liệu khóa học:", data);
        } else {
          // ⚠️ Khi API trả về success = false
          console.error("Lỗi từ server:", res?.message || "Không xác định");
          alert(res?.message || "Đã xảy ra lỗi khi lấy danh sách khóa học!");
        }
        // const uniqueCategories = [
        //   "All",
        //   ...new Set(data.map((course) => course.category || "Unknown")),
        // ];
        // setCategories(uniqueCategories);
      } catch (err) {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  // ✅ Loading hoặc lỗi
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading courses...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Browse Courses
        </h1>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-colors ${selectedCategory === category
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-white"
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No courses found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCourses.map((course) => (
              <Card
                key={course?._id || course?.id}
                className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col group"
              >
                <div className="overflow-hidden">
                  <img
                    src={course?.image || "/placeholder.svg"}
                    alt={course?.title}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2">{course?.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    By {course?.main_instructor.username || "Unknown"}
                  </p>

                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1;
                      return ratingValue <= Math.round(course?.rating || 0) ? (
                        <FaRegStar
                          key={index}
                          className="text-yellow-400 text-base"
                        />
                      ) : (
                        <FaRegStar
                          key={index}
                          className="text-gray-300 text-base"
                        />
                      );
                    })}
                    <span className="ml-2 text-gray-500 text-sm">
                      ({course.rating || "N/A"})
                    </span>
                  </div>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      ${course.price || 0}
                    </span>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Link to={`/courses/${course._id || course.id}`}>
                        Enroll
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of 2
          </span>
          <Button
            variant="outline"
            disabled={currentPage === 2}
            onClick={() => setCurrentPage(2)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Courses;

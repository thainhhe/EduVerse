import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaRegStar } from "react-icons/fa";
import { getAllCoursePublished } from "@/services/courseService";
import { useEnrollment } from "@/context/EnrollmentContext";
import { useAuth } from "@/hooks/useAuth";
import categoryService from "@/services/categoryService";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { enrollments } = useEnrollment();
  console.log("enrollments", enrollments);
  // ✅ Lấy dữ liệu từ API thật

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await getAllCoursePublished();
        console.log("res", res);
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
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await categoryService.getAll();
        setCategories(list);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);
  console.log("category", categories);
  console.log("selectedCategory._id", selectedCategory);
  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category?._id === selectedCategory);

  console.log("filteredCourses", filteredCourses);
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

  const itemsPerPage = 6; // số khóa học mỗi trang
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // cắt dữ liệu để hiển thị theo trang
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
            {/* 🔹 Button ALL */}
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              onClick={() => setSelectedCategory("All")}
              className={`transition-colors ${
                selectedCategory === "All"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-white"
              }`}
            >
              All
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                className={`transition-colors ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-white"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {paginatedCourses.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No courses found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedCourses.map((course) => (
              <Card
                key={course?._id || course?.id}
                className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col group"
              >
                <div className="overflow-hidden">
                  <img
                    src={course?.thumbnail || "/placeholder.svg"}
                    alt={course?.title}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2">
                    {course?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    By{" "}
                    {course?.main_instructor?.username ||
                      course?.main_instructor?.name ||
                      course?.main_instructor ||
                      "Unknown"}
                  </p>

                  <div className="flex items-center mb-4">
                    {(() => {
                      const rating = Number(
                        course?.avgRating ?? course?.rating ?? 0
                      );
                      const reviewsCount =
                        course?.reviewsCount ?? course?.totalEnrollments ?? 0;
                      return (
                        <>
                          {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                              <FaRegStar
                                key={index}
                                className={
                                  ratingValue <= Math.round(rating)
                                    ? "text-yellow-400 text-base"
                                    : "text-gray-300 text-base"
                                }
                              />
                            );
                          })}
                          <span className="ml-2 text-gray-500 text-sm">
                            {rating > 0 ? `${rating.toFixed(1)}` : "N/A"} (
                            {reviewsCount})
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      {(() => {
                        const priceVal =
                          typeof course?.price === "number"
                            ? course.price
                            : Number(course?.displayPrice ?? 0);
                        return priceVal
                          ? priceVal.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          : "Free";
                      })()}
                    </span>
                    {enrollments.some((e) => e.courseId === course._id) ? (
                      <Button
                        asChild
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Link to={`/courses/${course._id}`}>Go to Course</Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Link to={`/courses/${course._id}`}>Enroll</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

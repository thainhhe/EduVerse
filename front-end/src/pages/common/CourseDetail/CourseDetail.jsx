import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { FaCheckCircle, FaPlayCircle, FaFileAlt, FaStar } from "react-icons/fa";
import { getCourseById } from "@/services/courseService";
import { use, useEffect, useState } from "react";
import CommentThread from "@/pages/CommentThread/CommentThread";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getForumByCourseId } from "@/services/forumService";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourses] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);
  const [forum, setForum] = useState();
  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await getCourseById(id);
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

  if (!course) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    const fetchForum = async () => {
      try {
        setLoading(true);
        const res = await getForumByCourseId(course._id);
        console.log("res", res)
        if (res?.success) {
          // ✅ Khi thành công
          const data = res.data || [];
          setForum(data);
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

    fetchForum();
  }, []);

  return (
    <div className="bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-md sm:text-lg text-gray-600 mb-4">
                A comprehensive guide to building high-performance React
                applications.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-base">
                <div className="flex items-center gap-1 text-yellow-500">
                  <FaStar />
                  <span className="font-bold text-gray-800">
                    {course.rating}
                  </span>
                  <span className="text-gray-600 ml-1">
                    ({course.reviewsCount} reviews)
                  </span>
                </div>
                <p className="text-gray-600">
                  Taught by{" "}
                  <Link
                    to="#"
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {course.main_instructor.username}
                  </Link>
                </p>
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {/* {course.whatYoullLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-indigo-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))} */}
                </ul>
              </CardContent>
            </Card>

            {/* Sidebar for Mobile/Tablet */}
            <div className="lg:hidden">
              <EnrollCard price={course.price} />
            </div>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Course Overview
              </h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => {
                  const isExpanded = expandedModules.includes(module._id);

                  return (
                    <div key={module._id} className="border rounded-lg shadow-sm bg-white">
                      {/* --- Header module --- */}
                      <button
                        onClick={() => toggleModule(module._id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
                      >
                        <div className="flex items-center gap-2 text-left">
                          <span className="font-semibold text-gray-800">
                            {module.title}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({module.lessons.length} bài học)
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      {/* --- Danh sách bài học --- */}
                      {isExpanded && (
                        <ul className="divide-y">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === "video" ? (
                                  <FaPlayCircle className="text-gray-500" />
                                ) : (
                                  <FaFileAlt className="text-gray-500" />
                                )}
                                <span className="text-gray-800 text-sm sm:text-base">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {lesson.duration || ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>


            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Student Reviews
              </h2>
              <div className="space-y-6">
                Review
                {/* {course.reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                    </div>
                  </div>
                ))} */}
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Thảo luận trên diễn đàn
              </h2>
              <CommentThread
                forumId="68fa572f5f8ebe11af185547"
                userId="68fc9c79e9b3adbc7801ad9e"
              />
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      Post a Question or Comment
                    </h3>
                    <Textarea
                      placeholder="Type your question or comment here..."
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button>Post Comment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar for Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <EnrollCard price={course.price} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tách card ra để tái sử dụng cho mobile và desktop
const EnrollCard = ({ price }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-3xl">${price}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700">
        Enroll Now
      </Button>
      <Button size="lg" variant="outline" className="w-full">
        Add to Cart
      </Button>
    </CardContent>
  </Card>
);

export default CourseDetail;

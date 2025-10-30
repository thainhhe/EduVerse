import { Link, useNavigate, useParams } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import { useEnrollment } from "@/context/EnrollmentContext";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollments } = useEnrollment();
  console.log("enrollments", enrollments)

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/checkout", {
        state: {
          courseId: course._id,
          courseTitle: course.title,
          coursePrice: course.price,
        },
      });
    }
  };

  const { id } = useParams();
  const [course, setCourses] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);
  const [forum, setForum] = useState();
  const [isEnrolled, setIsEnrolled] = useState(false); // 👈 thêm state này
  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 1️⃣ Gọi API lấy thông tin khóa học
        const resCourse = await getCourseById(id);
        if (resCourse?.success) {
          const courseData = resCourse.data;
          setCourses(courseData);

          console.log("📘 Course:", courseData);

          // 🔹 2️⃣ Sau khi có course, gọi API lấy forum theo courseId
          const resForum = await getForumByCourseId(courseData._id);
          if (resForum?.success) {
            setForum(resForum.data);
            console.log("💬 Forum:", resForum.data);
          } else {
            console.warn("Không tìm thấy forum:", resForum?.message);
          }
        } else {
          console.error("Lỗi khi lấy khóa học:", resCourse?.message);
          setError(resCourse?.message || "Không thể tải khóa học.");
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch dữ liệu:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!user?._id || !id || !enrollments) return;
    const found = enrollments.some((e) => e.courseId === id);
    console.log("found", found)
    if (found) {
      setIsEnrolled(true);
    }

  }, [user?._id, id, enrollments]);
  // ⏳ Loading
  if (loading) return <div>Đang tải dữ liệu...</div>;

  // ⚠️ Lỗi
  if (error) return <div className="text-red-500">{error}</div>;


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
              <EnrollCard
                price={course.price}
                onEnroll={handleEnroll}
                isEnrolled={isEnrolled}
                course={course}
              />

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
                forumId={forum?._id || "68fa572f5f8ebe11af185547"}
                userId={user?._id}
                courseId={course?._id}
                canComment={isEnrolled}
              />


            </section>
          </div>

          {/* Sidebar for Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24">

                  <EnrollCard
                    price={course.price}
                    onEnroll={handleEnroll}
                    isEnrolled={isEnrolled}
                    course={course}
                  />

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tách card ra để tái sử dụng cho mobile và desktop
const EnrollCard = ({ price, onEnroll, isEnrolled, course }) => {
  console.log({ price, onEnroll, isEnrolled, course })
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnrolled ? (
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => navigate(`/learn/${course._id}`)}
          >
            Đi đến khóa học
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={onEnroll}
          >
            Enroll Now
          </Button>
        )}
        {/* <Button size="lg" variant="outline" className="w-full">
          Add to Cart
        </Button> */}
      </CardContent>
    </Card>
  );
};



export default CourseDetail;

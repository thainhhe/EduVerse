import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaArrowRight, FaRegStar } from "react-icons/fa";
import courseService from "@/services/courseService";
import { toast } from "react-toastify";

const PopularCoursesSection = ({ courses: propsCourses, limit = 6 }) => {
    const [courses, setCourses] = useState(propsCourses ?? []);
    const [loading, setLoading] = useState(!propsCourses);

    useEffect(() => {
        if (propsCourses) return;
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const res = await courseService.getPopularCourses(limit);
                const data = res?.data?.data ?? res?.data ?? res;
                if (!cancelled)
                    setCourses(
                        Array.isArray(data) ? data.filter((course) => course.status === "approve") : []
                    );
            } catch (err) {
                console.error("Failed to load popular courses", err);
                toast.error("Không thể tải khoá học phổ biến.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [propsCourses, limit]);

    if (loading) {
        return (
            <section className="py-16 md:py-20 bg-[#f8f8ff]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Popular Courses</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden animate-pulse"
                            >
                                <div className="h-48 bg-gray-200 rounded-t-2xl" />
                                <div className="flex-1 flex flex-col p-6">
                                    <div className="h-6 bg-gray-200 mb-3 w-3/4 rounded" />
                                    <div className="h-4 bg-gray-200 mb-2 w-1/2 rounded" />
                                    <div className="mt-auto h-6 bg-gray-200 w-1/4 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-20 bg-[#f8f8ff]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Popular Courses</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => {
                        const id = course.id ?? course._id ?? course._idString;
                        const img = course.image || course.thumbnail || "/placeholder.svg";
                        const title = course.title || course.name || "Untitled Course";
                        const instructor =
                            course.instructor ||
                            course.main_instructor?.username ||
                            course.main_instructor?.name ||
                            "Instructor";
                        // Use backend fields if available, fallback to legacy ones
                        const rating = Number(course.avgRating ?? course.rating ?? 0);
                        const reviewsCount =
                            course.reviewsCount ?? course.totalEnrollments ?? course.students ?? 0;
                        const price = course.price ?? course.displayPrice ?? "Free";

                        return (
                            <div
                                key={id || title}
                                className="bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden group transition-shadow hover:shadow-xl"
                            >
                                <div className="overflow-hidden">
                                    <img
                                        src={img}
                                        alt={title}
                                        className="w-full h-48 object-cover rounded-t-2xl transform group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">By {instructor}</p>
                                    <div className="flex items-center mb-1">
                                        {[...Array(5)].map((_, index) => {
                                            const ratingValue = index + 1;
                                            return (
                                                <FaRegStar
                                                    key={index}
                                                    className={
                                                        ratingValue <= Math.round(rating)
                                                            ? "text-yellow-400 text-base"
                                                            : "text-gray-400 text-base"
                                                    }
                                                />
                                            );
                                        })}
                                        <span className="ml-2 text-gray-500 text-sm">
                                            ({reviewsCount} reviews)
                                        </span>
                                    </div>
                                    <div className="text-indigo-600 font-bold text-lg mt-auto mb-4">
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
                                    </div>
                                    <Button
                                        asChild
                                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-none"
                                    >
                                        <Link to={`/courses/${id}`}>
                                            Enroll Now <FaArrowRight className="ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PopularCoursesSection;

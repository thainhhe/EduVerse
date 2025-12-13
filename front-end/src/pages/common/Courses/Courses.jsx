import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaRegStar } from "react-icons/fa";
import { Search } from "lucide-react";
import { getAllCoursePublished } from "@/services/courseService";
import { useEnrollment } from "@/context/EnrollmentContext";
import { useAuth } from "@/hooks/useAuth";
import categoryService from "@/services/categoryService";
import Pagination from "@/helper/Pagination";
import { ToastHelper } from "@/helper/ToastHelper";

const Courses = () => {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [priceFilter, setPriceFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const { enrollments } = useEnrollment();

    // Drag to scroll logic
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const res = await getAllCoursePublished();
                if (res?.success) {
                    const data = res.data || [];
                    setCourses(data);
                } else {
                    console.error("Lỗi từ server:", res?.message || "Không xác định");
                    ToastHelper.error(res?.message || "Error fetching courses");
                }
            } catch (err) {
                setError("Failed to fetch courses.");
                ToastHelper.error("Failed to fetch courses.");
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
    useEffect(() => {
        setSearchTerm(searchParams.get("search") || "");
    }, [searchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchTerm, priceFilter, sortOption]);

    const filteredCourses = courses
        .filter((course) => {
            // 1. Category Filter
            const matchCategory = selectedCategory === "All" || course.category === selectedCategory;

            // 2. Search Filter
            const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());

            // 3. Price Filter
            let matchPrice = true;
            const price =
                typeof course?.price === "number" ? course.price : Number(course?.displayPrice ?? 0);
            if (priceFilter === "free") matchPrice = price === 0;
            if (priceFilter === "paid") matchPrice = price > 0;

            return matchCategory && matchSearch && matchPrice;
        })
        .sort((a, b) => {
            // 4. Sorting
            const priceA = typeof a?.price === "number" ? a.price : Number(a?.displayPrice ?? 0);
            const priceB = typeof b?.price === "number" ? b.price : Number(b?.displayPrice ?? 0);
            const ratingA = Number(a?.avgRating ?? a?.rating ?? 0);
            const ratingB = Number(b?.avgRating ?? b?.rating ?? 0);
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);

            switch (sortOption) {
                case "price-asc":
                    return priceA - priceB;
                case "price-desc":
                    return priceB - priceA;
                case "rating-desc":
                    return ratingB - ratingA;
                case "newest":
                default:
                    return dateB - dateA;
            }
        });

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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="container mx-auto">
                {/* Search and Filters */}
                <div className="flex flex-col justify-between md:flex-row gap-4 items-center text-center mb-4">
                    <span className="text-3xl font-bold text-gray-900">Browse Courses</span>
                    <div className="flex gap-3 w-full items-center justify-center md:w-auto">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search courses..."
                                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={priceFilter} onValueChange={setPriceFilter}>
                            <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Price" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Prices</SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-full md:w-[180px] bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-8">
                    <div
                        ref={scrollRef}
                        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 select-none cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    >
                        {/* 🔹 Button ALL */}
                        <Button
                            variant={selectedCategory === "All" ? "default" : "outline"}
                            onClick={() => setSelectedCategory("All")}
                            className={`whitespace-nowrap rounded-full px-6 transition-all duration-200 ${
                                selectedCategory === "All"
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transform scale-105"
                                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                        >
                            All
                        </Button>

                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`whitespace-nowrap rounded-full px-6 transition-all duration-200 ${
                                    selectedCategory === category.id
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transform scale-105"
                                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                                }`}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {paginatedCourses.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No courses found in this category.</p>
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
                                    <h3 className="text-lg font-semibold mb-2">{course?.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        By{" "}
                                        {course?.main_instructor?.username ||
                                            course?.main_instructor?.name ||
                                            course?.main_instructor ||
                                            "Unknown"}
                                    </p>

                                    <div className="flex items-center mb-4">
                                        {(() => {
                                            const rating = Number(course?.avgRating ?? course?.rating ?? 0);
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    pageWindow={7}
                />
            </div>
        </div>
    );
};

export default Courses;

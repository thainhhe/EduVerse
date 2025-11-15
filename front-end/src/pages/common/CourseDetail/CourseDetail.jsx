import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { FaCheckCircle, FaPlayCircle, FaFileAlt, FaStar } from "react-icons/fa";
import { getCourseById } from "@/services/courseService";
import { useEffect, useState } from "react";
import CommentThread from "@/pages/CommentThread/CommentThread";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { getForumByCourseId } from "@/services/forumService";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollment } from "@/context/EnrollmentContext";
import { reviewService } from "@/services/reviewService";
import { StarRating } from "./StarRating";
import { ToastHelper } from "@/helper/ToastHelper";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const CourseDetail = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { enrollments } = useEnrollment();
    const { id } = useParams();

    const [course, setCourses] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedModules, setExpandedModules] = useState([]);
    const [forum, setForum] = useState();
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const paginatedReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
    const [rating, setRating] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resCourse = await getCourseById(id);
                if (resCourse?.success) {
                    setCourses(resCourse.data);
                    const resForum = await getForumByCourseId(resCourse.data._id);
                    if (resForum?.success) {
                        setForum(resForum.data);
                    }
                } else {
                    setError("Không thể tải khóa học.");
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
        setIsEnrolled(found);
    }, [user?._id, id, enrollments]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            const res = await reviewService.getReviewByCourseId(id);
            if (res) {
                setReviews(res.data.reviews);
                setAvgRating(res.data.avgRating);
            }
        };
        fetchReviews();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!rating || !comment.trim()) {
            ToastHelper.error("Vui lòng nhập đủ số sao và bình luận!");
            return;
        }

        try {
            const reviewData = {
                userId: user._id,
                courseId: course._id,
                rating,
                comment,
            };

            let res;
            if (editingReviewId) {
                res = await reviewService.updateReview(editingReviewId, reviewData);
                if (res) {
                    setReviews((prev) => prev.map((r) => (r._id === editingReviewId ? res.data : r)));
                    ToastHelper.success("Cập nhật đánh giá thành công!");
                }
            } else {
                res = await reviewService.addReview(reviewData);
                if (res) {
                    setReviews((prev) => [...prev, res.data]);
                    ToastHelper.success(res?.message || "Thêm đánh giá thành công!");
                }
            }

            setRating(0);
            setComment("");
            setEditingReviewId(null);
        } catch (error) {
            if (error.response?.status === 409) {
                ToastHelper.error(error.response.data.message);
            } else {
                ToastHelper.error("Có lỗi xảy ra khi gửi đánh giá!");
            }
            console.error("Error adding/updating review:", error);
        }
    };

    const handleEditReview = (review) => {
        setRating(review.rating);
        setComment(review.comment);
        setEditingReviewId(review._id);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;

        try {
            const res = await reviewService.deleteReview(reviewId);
            if (res) {
                setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                ToastHelper.success("Đã xóa đánh giá!");
            } else {
                ToastHelper.error(res?.message || "Không thể xóa đánh giá.");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            ToastHelper.error("Có lỗi xảy ra khi xóa đánh giá!");
        }
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                            <p className="text-lg text-gray-600 mb-4">{course.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <FaStar />
                                    <span className="font-bold text-gray-800">{avgRating.toFixed(1)} / 5</span>
                                </div>
                                <p className="text-gray-600">
                                    Giảng viên:{" "}
                                    <Link to="#" className="font-semibold text-indigo-600 hover:underline">
                                        {course.main_instructor.username}
                                    </Link>
                                </p>
                            </div>
                        </section>

                        {/* --- Student Reviews --- */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Student Reviews ({reviews.length})</h2>

                            {/* 👉 Form chỉ hiển thị nếu user enrolled và KHÔNG đang edit */}
                            {isEnrolled && !editingReviewId && (
                                <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                                    <h3 className="font-semibold mb-2 text-gray-800">Viết đánh giá của bạn</h3>
                                    <StarRating value={rating} onChange={setRating} />
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Nhập đánh giá của bạn..."
                                        rows={3}
                                        className="mb-3 mt-3"
                                    />
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={handleSubmitReview}
                                    >
                                        Gửi đánh giá
                                    </Button>
                                </div>
                            )}

                            {/* 🔹 Danh sách review */}
                            {paginatedReviews?.length > 0 ? (
                                paginatedReviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="flex items-start justify-between bg-white p-4 rounded-lg shadow-sm mb-3"
                                    >
                                        <div className="flex items-start gap-4 w-full">
                                            <Avatar>
                                                <AvatarImage
                                                    src={review.userId?.avatar}
                                                    alt={review.userId?.username}
                                                />
                                                <AvatarFallback>
                                                    {review.userId?.username?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <h4 className="font-semibold">{review.userId?.username}</h4>

                                                {editingReviewId === review._id ? (
                                                    <div className="mt-2">
                                                        <StarRating value={rating} onChange={setRating} />
                                                        <Textarea
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            placeholder="Cập nhật đánh giá của bạn..."
                                                            rows={3}
                                                            className="mt-2"
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                onClick={handleSubmitReview}
                                                            >
                                                                Lưu
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingReviewId(null);
                                                                    setRating(0);
                                                                    setComment("");
                                                                }}
                                                            >
                                                                Hủy
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
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
                                                        <p className="text-gray-700">{review.comment}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {user?._id === review.userId?._id && editingReviewId !== review._id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                                        <MoreVertical className="h-5 w-5 text-gray-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32">
                                                    <DropdownMenuItem onClick={() => handleEditReview(review)}>
                                                        Cập nhật
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteReview(review._id)}>
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Chưa có đánh giá nào cho khóa học này.</p>
                            )}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </Button>

                                    <span className="text-sm font-medium text-gray-700">
                                        Trang {currentPage} / {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            )}
                        </section>

                        {/* Forum Section */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4">Thảo luận trên diễn đàn</h2>
                            <CommentThread
                                forumId={forum?._id || ""}
                                userId={user?._id}
                                courseId={course?._id}
                                canComment={isEnrolled}
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24">
                            <EnrollCard
                                price={course.price}
                                onEnroll={() =>
                                    navigate("/checkout", {
                                        state: {
                                            courseId: course._id,
                                            courseTitle: course.title,
                                            coursePrice: course.price,
                                        },
                                    })
                                }
                                isEnrolled={isEnrolled}
                                course={course}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable card
const EnrollCard = ({ price, onEnroll, isEnrolled, course }) => {
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
                        onClick={() => navigate(`/learning/${course._id}`)}
                    >
                        Đi đến khóa học
                    </Button>
                ) : (
                    <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onEnroll}>
                        Enroll Now
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default CourseDetail;

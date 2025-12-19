import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FaBug, FaStar, FaPlayCircle, FaCheckCircle, FaGlobe, FaClosedCaptioning } from "react-icons/fa";
import {
    MoreVertical,
    Clock,
    BookOpen,
    BarChart,
    Award,
    MonitorPlay,
    FileText,
    Download,
    Infinity as InfinityIcon,
    Smartphone,
    Lock,
    LockIcon,
    MoreHorizontal,
    Edit3,
    Trash2Icon,
} from "lucide-react";
import { getCourseById } from "@/services/courseService";
import { useEffect, useState } from "react";
import CommentThread from "@/pages/CommentThread/CommentThread";
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
import { reportService } from "@/services/reportService";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { enrollmentService } from "@/services/enrollmentService";
import { paymentService } from "@/services/paymentService";
import { format } from "date-fns";
import roomService from "@/services/roomService";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";

const CourseDetail = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { enrollments, refreshEnrollments } = useEnrollment();
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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

    const [openReport, setOpenReport] = useState(false);
    const [issueTypeSelect, setIssueTypeSelect] = useState("bug");
    const [issueDescription, setIssueDescription] = useState("");
    const [rooms, setRooms] = useState([]);

    // Password dialog state for joining rooms
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [enteredPassword, setEnteredPassword] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resCourse = await getCourseById(id);
                if (resCourse?.success) {
                    setCourse(resCourse.data);
                    const resForum = await getForumByCourseId(resCourse.data._id);
                    if (resForum?.success) {
                        setForum(resForum.data);
                    }
                } else {
                    setError("Can't load course.");
                }
            } catch (err) {
                console.error("❌ Error when fetching data:", err);
                setError("Can't load course.");
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

    useEffect(() => {
        const fetchRooms = async () => {
            if (!id) return;
            try {
                const res = await roomService.getRoomsByCourse(id);
                if (res?.success) {
                    setRooms(res.data || []);
                }
            } catch (error) {
                console.error("❌ Failed to fetch rooms:", error);
            }
        };
        fetchRooms();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!rating || !comment.trim()) {
            ToastHelper.error("Please enter a rating and comment!");
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
                    ToastHelper.success("Update review successfully!");
                }
            } else {
                res = await reviewService.addReview(reviewData);
                if (res) {
                    const newReview = {
                        ...res.data,
                        userId: {
                            _id: user._id,
                            username: user.username,
                            avatar: user.avatar,
                        },
                    };
                    setReviews((prev) => [...prev, newReview]);
                    ToastHelper.success(res?.message || "Add review successfully!");
                }
            }

            setRating(0);
            setComment("");
            setEditingReviewId(null);
        } catch (error) {
            if (error.response?.status === 409) {
                ToastHelper.error(error.response.data.message);
            } else {
                ToastHelper.error("Error adding/updating review!");
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


        try {
            const res = await reviewService.deleteReview(reviewId);
            if (res) {
                setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                ToastHelper.success("Delete review successfully!");
            } else {
                ToastHelper.error(res?.message || "Can't delete review.");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            ToastHelper.error("Error deleting review!");
        }
    };

    const handleSubmitReport = async () => {
        if (!issueDescription.trim()) {
            ToastHelper.error("Please enter a description!");
            return;
        }

        const data = {
            userId: user?._id,
            scope: "course",
            courseId: course._id,
            issueType: issueTypeSelect,
            description: issueDescription,
        };

        try {
            const res = await reportService.createReport(data);
            if (res?.success) {
                ToastHelper.success("Report sent successfully!");
                setOpenReport(false);
                setIssueDescription("");
                setIssueTypeSelect("bug");
            }
        } catch (err) {
            ToastHelper.error("Error sending report!");
            console.error(err);
        }
    };

    const handleJoinRoom = (room) => {
        const link = room.link ?? room.url ?? room.meetingUrl ?? "";

        if (!link) {
            ToastHelper.error("No meeting link available for this room.");
            return;
        }

        // Check if room has password
        if (room.password && room.password.trim() !== "") {
            // Show password dialog
            setSelectedRoom(room);
            setEnteredPassword("");
            setPasswordDialogOpen(true);
        } else {
            // No password, join directly
            window.open(link, "_blank");
        }
    };

    const handlePasswordSubmit = () => {
        if (!selectedRoom) return;

        // Validate password
        if (enteredPassword.trim() === "") {
            ToastHelper.error("Please enter the password.");
            return;
        }

        if (enteredPassword !== selectedRoom.password) {
            ToastHelper.error("Incorrect password. Please try again.");
            setEnteredPassword("");
            return;
        }

        // Password correct, join the room
        const link = selectedRoom.link ?? selectedRoom.url ?? selectedRoom.meetingUrl ?? "";
        window.open(link, "_blank");

        // Close dialog and reset
        setPasswordDialogOpen(false);
        setSelectedRoom(null);
        setEnteredPassword("");
        ToastHelper.success("Joining room...");
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );

    if (error)
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
                                <Link to="/courses" className="hover:underline">
                                    Courses
                                </Link>
                                <span>/</span>
                                <span className="text-gray-300">{course.category?.name || "General"}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>

                            <p className="text-lg text-gray-300 line-clamp-2">
                                {course.description || "Master this subject with our comprehensive course."}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <span className="font-bold text-base">{avgRating.toFixed(1)}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={
                                                    i < Math.round(avgRating)
                                                        ? "text-yellow-400"
                                                        : "text-gray-600"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <Link to="#reviews" className="text-indigo-300 hover:underline ml-1">
                                        ({reviews.length} ratings)
                                    </Link>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400">Created by</span>
                                    <Link
                                        to={`/instructors/${course?.main_instructor?._id}`}
                                        className="text-indigo-300 hover:underline font-medium"
                                    >
                                        {course.main_instructor?.username}
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 pt-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        Last updated{" "}
                                        {course.updatedAt
                                            ? format(new Date(course.updatedAt), "MM/yyyy")
                                            : "Recently"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaGlobe className="w-4 h-4" />
                                    <span>English</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClosedCaptioning className="w-4 h-4" />
                                    <span>English [Auto]</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="flex w-full justify-start border-b border-gray-200 bg-transparent p-0 mb-8 h-auto rounded-none">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all text-base"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="curriculum"
                                    className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all text-base"
                                >
                                    Curriculum
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all text-base"
                                >
                                    Reviews
                                </TabsTrigger>
                                <TabsTrigger
                                    value="discussion"
                                    className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all text-base"
                                >
                                    Discussion
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meeting"
                                    className="rounded-none border-b-2 border-transparent px-6 py-3 font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all text-base"
                                >
                                    Meeting
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Description</CardTitle>
                                    </CardHeader>
                                    <CardContent className="max-w-full text-gray-700">
                                        <p className="whitespace-pre-wrap break-all leading-relaxed">
                                            {course.description ||
                                                "No description available for this course."}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Instructor</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage src={course.main_instructor?.avatar} />
                                                <AvatarFallback>
                                                    {course.main_instructor?.username?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    to={`/instructors/${course.main_instructor?._id}`}
                                                    className="text-lg font-bold text-indigo-600 hover:underline"
                                                >
                                                    {course.main_instructor?.username}
                                                </Link>
                                                <p className="text-gray-500 text-sm mb-2">
                                                    {course.main_instructor?.email}
                                                </p>
                                                <p className="text-gray-600 text-sm">
                                                    {course.main_instructor?.bio || "Experienced Instructor"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Curriculum Tab */}
                            <TabsContent value="curriculum">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Content</CardTitle>
                                        <CardDescription>
                                            {course.modules?.length || 0} modules •{" "}
                                            {course.modules?.reduce(
                                                (acc, m) => acc + (m.lessons?.length || 0),
                                                0
                                            ) || 0}{" "}
                                            lessons
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {course.modules && course.modules.length > 0 ? (
                                            <Accordion type="single" collapsible className="w-full">
                                                {course.modules.map((module, index) => (
                                                    <AccordionItem
                                                        key={module._id || index}
                                                        value={`item-${index}`}
                                                    >
                                                        <AccordionTrigger className="hover:no-underline hover:bg-gray-50 px-4 rounded-lg">
                                                            <div className="text-left">
                                                                <div className="font-semibold text-gray-900">
                                                                    {module.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500 font-normal mt-1">
                                                                    {module.lessons?.length || 0} lessons
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pt-2 pb-4">
                                                            <div className="space-y-2">
                                                                {module.lessons?.map((lesson, lIndex) => (
                                                                    <div
                                                                        key={lesson._id || lIndex}
                                                                        className="flex items-center justify-between py-2 text-sm text-gray-700 border-b last:border-0 border-gray-100"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <FaPlayCircle className="text-gray-400 w-4 h-4" />
                                                                            <span>{lesson.title}</span>
                                                                        </div>
                                                                        {lesson.duration && (
                                                                            <span className="text-gray-400 text-xs">
                                                                                {lesson.duration}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Curriculum details are not available yet.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reviews Tab */}
                            <TabsContent value="reviews">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Reviews</CardTitle>
                                        {isEnrolled && (
                                            <Dialog open={openReport} onOpenChange={setOpenReport}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                                                    >
                                                        <FaBug /> Report Issue
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Report an Issue</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Issue Type
                                                            </label>
                                                            <Select
                                                                value={issueTypeSelect}
                                                                onValueChange={setIssueTypeSelect}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="bug">
                                                                        Technical Bug
                                                                    </SelectItem>
                                                                    <SelectItem value="feature">
                                                                        Feature Request
                                                                    </SelectItem>
                                                                    <SelectItem value="other">
                                                                        Other
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                Description
                                                            </label>
                                                            <Textarea
                                                                value={issueDescription}
                                                                onChange={(e) =>
                                                                    setIssueDescription(e.target.value)
                                                                }
                                                                placeholder="Please describe the issue..."
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={handleSubmitReport}
                                                            className="w-full bg-indigo-600"
                                                        >
                                                            Submit Report
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {isEnrolled && !editingReviewId && (
                                            <div className="mb-8 bg-gray-50 rounded-xl border border-gray-100">
                                                <h3 className="font-semibold mb-4">Write a Review</h3>
                                                <div className="space-y-4">
                                                    <StarRating value={rating} onChange={setRating} />
                                                    <Textarea
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        placeholder="Share your experience with this course..."
                                                        rows={3}
                                                    // className="break-all whitespace-normal"
                                                    />
                                                    <Button
                                                        onClick={handleSubmitReview}
                                                        className="bg-indigo-600"
                                                    >
                                                        Submit Review
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {paginatedReviews.length > 0 ? (
                                                paginatedReviews.map((review) => (
                                                    <div
                                                        key={review._id}
                                                        className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <Avatar>
                                                                <AvatarImage src={review.userId?.avatar} />
                                                                <AvatarFallback>
                                                                    {review.userId?.username?.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900">
                                                                            {review.userId?.username}
                                                                        </h4>
                                                                        <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <FaStar
                                                                                    key={i}
                                                                                    className={
                                                                                        i < review.rating
                                                                                            ? "text-yellow-400"
                                                                                            : "text-gray-300"
                                                                                    }
                                                                                />
                                                                            ))}
                                                                            <span className="text-gray-400 ml-2 text-xs">
                                                                                {review.updatedAt
                                                                                    ? format(
                                                                                        new Date(
                                                                                            review.updatedAt
                                                                                        ),
                                                                                        "MMM dd, yyyy"
                                                                                    )
                                                                                    : formatDistanceToNow(
                                                                                        new Date(
                                                                                            review.createdAt
                                                                                        ),
                                                                                        {
                                                                                            addSuffix: true,
                                                                                            locale: enUS,
                                                                                        }
                                                                                    )}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {user?._id === review.userId?._id &&
                                                                        editingReviewId !== review._id && (
                                                                            <div className="flex gap-4 items-center">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleEditReview(
                                                                                            review
                                                                                        )
                                                                                    }
                                                                                    className="text-blue-500 transition-all duration-300 hover:scale-125"
                                                                                >
                                                                                    <Edit3 size={17} />
                                                                                </button>
                                                                                <ConfirmationHelper
                                                                                    trigger={
                                                                                        <button className="text-red-500 transition-all duration-300 hover:scale-125">
                                                                                            <Trash2Icon
                                                                                                size={17}
                                                                                            />
                                                                                        </button>
                                                                                    }
                                                                                    title="Are you sure you want to delete this review?"
                                                                                    description="This action cannot be undone."
                                                                                    onConfirm={() =>
                                                                                        handleDeleteReview(
                                                                                            review._id
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                </div>

                                                                {editingReviewId === review._id ? (
                                                                    <div className="mt-4 space-y-4">
                                                                        <StarRating
                                                                            value={rating}
                                                                            onChange={setRating}
                                                                        />
                                                                        <Textarea
                                                                            value={comment}
                                                                            onChange={(e) =>
                                                                                setComment(e.target.value)
                                                                            }
                                                                            rows={3}
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={handleSubmitReview}
                                                                            >
                                                                                Save
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => {
                                                                                    setEditingReviewId(null);
                                                                                    setRating(0);
                                                                                    setComment("");
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-700 mt-3 leading-relaxed break-all whitespace-pre-wrap">
                                                                        {review.comment}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    No reviews yet. Be the first to review!
                                                </div>
                                            )}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex justify-center gap-2 mt-8">
                                                <Button
                                                    variant="outline"
                                                    disabled={currentPage === 1}
                                                    onClick={() => setCurrentPage((p) => p - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => setCurrentPage((p) => p + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Discussion Tab */}
                            <TabsContent value="discussion">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Forum</CardTitle>
                                        <CardDescription>
                                            Join the discussion with other learners and instructors.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <CommentThread
                                            forumId={forum?._id || ""}
                                            userId={user?._id}
                                            courseId={course?._id}
                                            canComment={isEnrolled}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Meeting Tab */}
                            <TabsContent value="meeting">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Meeting</CardTitle>
                                        <CardDescription>
                                            Join the meeting with other learners and instructors.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {rooms.length > 0 ? (
                                            <div className="space-y-4">
                                                {rooms.map((room) => (
                                                    <div
                                                        key={room._id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                                                                    {room.name}
                                                                </h4>

                                                                {room.description && (
                                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                        {room.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>
                                                                            {room.startTime
                                                                                ? format(
                                                                                    new Date(
                                                                                        room.startTime
                                                                                    ),
                                                                                    "MMM dd, yyyy HH:mm"
                                                                                )
                                                                                : "No schedule"}
                                                                        </span>
                                                                    </div>

                                                                    {room.isPublic && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="bg-blue-50 text-blue-700 border-blue-200"
                                                                        >
                                                                            Public
                                                                        </Badge>
                                                                    )}
                                                                    {room.password &&
                                                                        room.password.trim() !== "" && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="bg-amber-50 text-amber-700 border-amber-200"
                                                                            >
                                                                                <LockIcon className="w-4 h-4 mr-2" />{" "}
                                                                                Protected
                                                                            </Badge>
                                                                        )}
                                                                </div>
                                                            </div>

                                                            <div className="ml-4">
                                                                {room.status === "ended" ||
                                                                    room.status === "pending" ? (
                                                                    <Button disabled variant="secondary">
                                                                        {room.status === "ended"
                                                                            ? "Ended"
                                                                            : "Waiting"}
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => handleJoinRoom(room)}
                                                                        className="bg-indigo-600 hover:bg-indigo-700"
                                                                    >
                                                                        {room.password &&
                                                                            room.password.trim() !== "" ? (
                                                                            <>
                                                                                <LockIcon className="w-4 h-4 mr-2" />
                                                                                Join Now
                                                                            </>
                                                                        ) : (
                                                                            "Join Now"
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <MonitorPlay className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No meetings available</p>
                                                <p className="text-sm mt-2">
                                                    The instructor hasn't created any meeting rooms yet.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Video Preview Placeholder - Optional */}
                            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                                <img
                                    src={course.thumbnail || "/placeholder.svg"}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaPlayCircle className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center text-white font-medium text-sm">
                                    Preview this course
                                </div>
                            </div>

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

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Password Required
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <p className="text-sm text-gray-600">
                            This room is password protected. Please enter the password to join.
                        </p>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter room password"
                                value={enteredPassword}
                                onChange={(e) => setEnteredPassword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handlePasswordSubmit();
                                    }
                                }}
                                className="mt-1"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPasswordDialogOpen(false);
                                setEnteredPassword("");
                                setSelectedRoom(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePasswordSubmit}>Join Room</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const genShortOrderCode = () => {
    const time = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 6);
    return `${time}${rand}`;
};

// Reusable card
const EnrollCard = ({ price, onEnroll, isEnrolled, course }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { refreshEnrollments } = useEnrollment();

    const handleEnrollClick = () => {
        if (!user?._id) {
            navigate("/login", { state: { redirectTo: `/checkout` } });
            return;
        }
        onEnroll();
    };

    const handleEnrollCourseFree = async () => {
        if (!user?._id) {
            navigate("/login", { state: { redirectTo: `/checkout` } });
            return;
        }
        try {
            await enrollmentService.createEnrollment({
                userId: user._id,
                courseId: course._id,
                enrollmentDate: Date.now(),
                status: "enrolled",
                grade: "Incomplete",
            });
            await paymentService.createPaymentIntent({
                orderId: `free_${genShortOrderCode()}`,
                orderCode: `${genShortOrderCode()}`,
                userId: user._id,
                courseId: course._id,
                amount: 0,
                status: "free",
                paymentDate: Date.now(),
                paymentMethod: "free",
            });
            ToastHelper.success("Enrolled successfully!");
            await refreshEnrollments();
            navigate(`/learning/${course._id}`);
        } catch (error) {
            console.error(
                "Error enrolling course:",
                error || error?.response?.data?.message || error?.message
            );
            ToastHelper.error("Error enrolling course");
        }
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-white pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900">
                    {price === 0
                        ? "Free"
                        : new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(price)}
                </CardTitle>
                {price > 0 && (
                    <CardDescription className="text-green-600 font-medium flex items-center gap-1">
                        <Award className="w-4 h-4" /> 30-Day Money-Back Guarantee
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {isEnrolled ? (
                    <Button
                        size="lg"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-12 text-lg shadow-lg transition-all"
                        onClick={() => navigate(`/learning/${course._id}`)}
                    >
                        Go to Course
                    </Button>
                ) : course.price === 0 ? (
                    <Button
                        size="lg"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-lg transition-all"
                        onClick={handleEnrollCourseFree}
                    >
                        Enroll Now
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-lg transition-all"
                        onClick={() =>
                            navigate(`/checkout`, {
                                state: {
                                    courseId: course._id,
                                    courseTitle: course.title,
                                    coursePrice: course.price,
                                },
                            })
                        }
                    >
                        Buy Now
                    </Button>
                )}

                <div className="space-y-4">
                    <p className="font-bold text-gray-900">This course includes:</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center gap-3">
                            <MonitorPlay className="w-5 h-5 text-gray-400" />
                            <span>On-demand video</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span>Assignments & Quizzes</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-gray-400" />
                            <span>Downloadable resources</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <InfinityIcon className="w-5 h-5 text-gray-400" />
                            <span>Full lifetime access</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                            <span>Access on mobile and TV</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
                <div className="w-full flex justify-around items-center text-sm font-medium text-gray-600">
                    <button className="hover:text-gray-900 transition-colors">Share</button>
                    <button className="hover:text-gray-900 transition-colors">Gift this course</button>
                    <button className="hover:text-gray-900 transition-colors">Apply Coupon</button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default CourseDetail;

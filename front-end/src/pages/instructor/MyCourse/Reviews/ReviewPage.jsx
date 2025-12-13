import React, { useEffect, useState, useMemo } from "react";
import { useCourse } from "@/context/CourseProvider";
import { Star, MessageSquare, MoreHorizontal, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reviewService } from "@/services/reviewService";

const ReviewPage = () => {
    const { courseId } = useCourse();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState(null); // null = all

    useEffect(() => {
        const fetchReviews = async () => {
            if (!courseId) {
                setLoading(false);
                return;
            }
            try {
                const res = await reviewService.getReviewByCourseId(courseId);
                if (res) {
                    setReviews(res.data.reviews || []);
                    setAvgRating(res.data.avgRating || 0);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [courseId]);

    // Calculate rating distribution
    const ratingDistribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => {
            const rating = Math.round(r.rating);
            if (dist[rating] !== undefined) dist[rating]++;
        });
        return dist;
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        if (!filterRating) return reviews;
        return reviews.filter((r) => Math.round(r.rating) === filterRating);
    }, [reviews, filterRating]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );

    return (
        <div className="max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Reviews from students</h1>
                <p className="text-gray-500">View and manage feedback about your course.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats & Distribution */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-indigo-50 to-white pb-6">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Total reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-end gap-4 mb-6">
                                <div className="text-6xl font-bold text-indigo-600 leading-none">
                                    {avgRating ? avgRating.toFixed(1) : "0.0"}
                                </div>
                                <div className="flex flex-col gap-1 mb-1">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${
                                                    star <= Math.round(avgRating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {reviews.length} reviews
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingDistribution[star];
                                    const percentage =
                                        reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <button
                                            key={star}
                                            onClick={() =>
                                                setFilterRating(filterRating === star ? null : star)
                                            }
                                            className={`w-full group flex items-center gap-3 text-sm hover:bg-gray-50 p-1.5 rounded-md transition-colors ${
                                                filterRating === star
                                                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-1 w-12 shrink-0 font-medium text-gray-700">
                                                <span>{star}</span>
                                                <Star className="w-3.5 h-3.5 fill-gray-400 text-gray-400" />
                                            </div>
                                            <Progress
                                                value={percentage}
                                                className="h-2.5 flex-1 bg-gray-100"
                                                indicatorClassName="bg-yellow-400"
                                            />
                                            <div className="w-10 text-right text-gray-500 text-xs tabular-nums">
                                                {percentage.toFixed(0)}%
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {filterRating && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => setFilterRating(null)}
                                >
                                    Remove filter
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Reviews List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            {filterRating ? `Reviews ${filterRating} stars` : "All reviews"}
                            <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                {filteredReviews.length}
                            </Badge>
                        </h2>
                        <div className="flex items-center gap-2">
                            <Select
                                value={filterRating ? filterRating.toString() : "all"}
                                onValueChange={(value) =>
                                    setFilterRating(value === "all" ? null : parseInt(value))
                                }
                            >
                                <SelectTrigger className="w-[180px] bg-white">
                                    <SelectValue placeholder="Filter by rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All reviews</SelectItem>
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <SelectItem key={star} value={star.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span>{star} sao</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(star)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filteredReviews.length === 0 ? (
                        <Card className="border-dashed border-2 bg-gray-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                                <p className="text-gray-500 mt-1 max-w-sm">
                                    {filterRating
                                        ? `No reviews found for ${filterRating} stars.`
                                        : "This course has not received any reviews from students."}
                                </p>
                                {filterRating && (
                                    <Button
                                        variant="link"
                                        onClick={() => setFilterRating(null)}
                                        className="mt-2 text-indigo-600"
                                    >
                                        View all reviews
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredReviews.map((review) => (
                                <Card
                                    key={review._id}
                                    className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                <AvatarImage src={review.userId?.profile_picture} />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                    {review.userId?.username?.charAt(0).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 truncate">
                                                            {review.userId?.username || "Người dùng ẩn danh"}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                            <span>
                                                                {format(
                                                                    new Date(review.createdAt),
                                                                    "dd 'month' MM, yyyy",
                                                                    { locale: vi }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                Report violation
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${
                                                                star <= review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "fill-gray-100 text-gray-200"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>

                                                <div className="text-gray-700 text-sm leading-relaxed">
                                                    {review.comment ? (
                                                        review.comment
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            No comment
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;

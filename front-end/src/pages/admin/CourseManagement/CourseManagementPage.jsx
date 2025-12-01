import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    BookOpen,
    Clock,
    AlertCircle,
    MoreHorizontal,
    ArrowUpDown,
    Check,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { approveCourse, getAllCourse, rejectCourse } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import categoryService from "@/services/categoryService";

const CourseManagementPage = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage, setCoursesPerPage] = useState(10);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const fetchCourses = async () => {
        setLoading(true);
        const res = await getAllCourse();
        if (res?.success) {
            const data = res.data.filter((course) => course.status !== "draft") || [];
            setCourses(data);
        } else {
            console.error("Lỗi từ server:", res?.message || "Không xác định");
            ToastHelper.error(res?.message || "Đã xảy ra lỗi khi lấy danh sách khóa học!");
        }
        setLoading(false);
    };

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
        fetchCourses();
    }, []);

    const formatCurrency = (amount) => {
        return amount?.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Actions
    const handleApprove = async (id) => {
        try {
            const res = await approveCourse(id);
            if (res?.success) {
                ToastHelper.success("Khóa học đã được duyệt thành công!");
                fetchCourses();
            } else {
                ToastHelper.error(res?.message || "Duyệt thất bại!");
            }
        } catch (err) {
            ToastHelper.error("Lỗi hệ thống khi duyệt!");
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            ToastHelper.warning("Vui lòng nhập lý do từ chối!");
            return;
        }
        try {
            const res = await rejectCourse(selectedCourseId, rejectReason);
            if (res?.success) {
                ToastHelper.success("Khóa học đã bị từ chối!");
                setShowRejectModal(false);
                setRejectReason("");
                fetchCourses();
            } else {
                ToastHelper.error(res?.message || "Từ chối thất bại!");
            }
        } catch (err) {
            ToastHelper.error("Lỗi hệ thống khi từ chối!");
        }
    };

    // Filtering
    const filteredCourses = courses.filter((course) => {
        const matchSearch =
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.main_instructor?.username.toLowerCase().includes(search.toLowerCase());

        const matchStatus = status === "all" || course.status.toLowerCase() === status.toLowerCase();
        const matchCategory = selectedCategory === "all" || course.category?._id === selectedCategory;

        return matchSearch && matchStatus && matchCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    // Stats
    const stats = [
        {
            title: "Total Courses",
            value: courses.length,
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Pending Approval",
            value: courses.filter((c) => c.status === "pending").length,
            icon: AlertCircle,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
        },
        {
            title: "Active Courses",
            value: courses.filter((c) => c.status === "approve").length,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Rejected",
            value: courses.filter((c) => c.status === "reject").length,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
        },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case "approve":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        Approved
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
                        Pending
                    </Badge>
                );
            case "reject":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Course Management</h1>
                <p className="text-gray-500">Manage and monitor all courses in the system.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-xl">Courses List</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search courses..."
                                    className="pl-9 w-full sm:w-[250px] bg-gray-50/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="approve">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reject">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Course Info</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading courses...
                                        </TableCell>
                                    </TableRow>
                                ) : currentCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentCourses.map((course) => (
                                        <TableRow
                                            key={course._id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-gray-900 line-clamp-1">
                                                        {course.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 w-fit px-2 py-0.5 rounded-full">
                                                        {course.category?.name || "Uncategorized"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={course.main_instructor?.avatar} />
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                                                            {course.main_instructor?.username
                                                                ?.substring(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {course.main_instructor?.username}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                {formatCurrency(course.price)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(course.status)}</TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatDateTime(course.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {course.status === "pending" && (
                                                        <>
                                                            <ConfirmationHelper
                                                                trigger={
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                }
                                                                title="Approve Course"
                                                                description="Are you sure you want to approve this course?"
                                                                confirmText="Approve"
                                                                onConfirm={() => handleApprove(course._id)}
                                                            />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setSelectedCourseId(course._id);
                                                                    setShowRejectModal(true);
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {course.status === "reject" && (
                                                        <ConfirmationHelper
                                                            trigger={
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title="Approve Course"
                                                            description="Are you sure you want to approve this course?"
                                                            confirmText="Approve"
                                                            onConfirm={() => handleApprove(course._id)}
                                                        />
                                                    )}
                                                    {course.status === "approve" && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedCourseId(course._id);
                                                                setShowRejectModal(true);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        asChild
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                                    >
                                                        <Link to={`/admin/courses/${course._id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Reject Course
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this course. This will be sent to the
                            instructor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CourseManagementPage;

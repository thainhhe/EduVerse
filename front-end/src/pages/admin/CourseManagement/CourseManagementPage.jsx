import {
    AlertCircle,
    BookOpen,
    Check,
    CheckCircle,
    Download,
    Eye,
    Search,
    X,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { ToastHelper } from "@/helper/ToastHelper";
import categoryService from "@/services/categoryService";
import { approveCourse, getAllCourse, rejectCourse } from "@/services/courseService";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const CourseManagementPage = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage, setCoursesPerPage] = useState(10);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedCourses, setSelectedCourses] = useState([]);

    const fetchCourses = async ({ skipLoading = false }) => {
        setLoading(true);
        try {
            const res = await getAllCourse({ skipLoading });
            if (res?.success) {
                const data = res.data.filter((course) => course.status !== "draft") || [];
                setCourses(data);
            } else {
                console.error("Lỗi từ server:", res?.message || "Không xác định");
                ToastHelper.error(res?.message || "Failed to load courses!");
            }
        } catch (err) {
            console.error("Failed to load courses:", err);
            ToastHelper.error("Failed to load courses!");
        } finally {
            setLoading(false);
            setIsFirstLoad(false);
        }
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
        fetchCourses({ skipLoading: false });
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

    const handleSelectAll = (checked) => {
        if (checked) {
            const currentIds = currentCourses.map((c) => c._id);
            setSelectedCourses((prev) => [...new Set([...prev, ...currentIds])]);
        } else {
            const currentIds = currentCourses.map((c) => c._id);
            setSelectedCourses((prev) => prev.filter((id) => !currentIds.includes(id)));
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedCourses((prev) => [...prev, id]);
        } else {
            setSelectedCourses((prev) => prev.filter((itemId) => itemId !== id));
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await approveCourse(id, { skipLoading: true });
            if (res?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Approve successfully!",
                    text: "Course has been approved successfully!",
                });
                setSelectedCourses((prev) => prev.filter((itemId) => itemId !== id));
                fetchCourses({ skipLoading: true });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Approve failed!",
                    text: res?.message || "Approve failed!",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "System error when approving!",
            });
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Please enter the reason for rejection!",
            });
            return;
        }

        try {
            if (selectedCourseId) {
                const res = await rejectCourse(selectedCourseId, rejectReason, { skipLoading: true });
                if (res?.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Reject successfully!",
                        text: "Course has been rejected successfully!",
                    });
                    setShowRejectModal(false);
                    setRejectReason("");
                    setSelectedCourseId(null);
                    fetchCourses({ skipLoading: true });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Reject failed!",
                        text: res?.message || "Reject failed!",
                    });
                }
            } else if (selectedCourses.length > 0) {
                let successCount = 0;
                for (const id of selectedCourses) {
                    const res = await rejectCourse(id, rejectReason);
                    if (res?.success) successCount++;
                }
                Swal.fire({
                    icon: "success",
                    title: "Reject successfully!",
                    text: `Rejected ${successCount} courses successfully!`,
                });
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedCourses([]);
                fetchCourses({ skipLoading: true });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "System error when rejecting!",
            });
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchSearch =
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.main_instructor?.username.toLowerCase().includes(search.toLowerCase());

        const matchStatus = status === "all" || course.status.toLowerCase() === status.toLowerCase();
        const matchCategory = selectedCategory === "all" || course.category?._id === selectedCategory;

        return matchSearch && matchStatus && matchCategory;
    });

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    const isAllSelected =
        currentCourses.length > 0 && currentCourses.every((c) => selectedCourses.includes(c._id));

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

    const getStatus = (status) => {
        switch (status) {
            case "approve":
                return <span className=" text-green-700 border-green-200">Approved</span>;
            case "pending":
                return <span className="text-yellow-700 border-yellow-200">Pending</span>;
            case "reject":
                return <span className="text-red-700 border-red-200">Rejected</span>;
            default:
                return <span>{status}</span>;
        }
    };
    const handleExportExcel = () => {
        console.log("export exxcel")
        // 1. Xác định dữ liệu cần export
        const exportSource =
            selectedCourses.length > 0
                ? filteredCourses.filter(c => selectedCourses.includes(c._id))
                : filteredCourses;

        if (exportSource.length === 0) {
            ToastHelper.error("No courses to export");
            return;
        }

        // 2. Chuẩn hoá dữ liệu cho Excel
        const exportData = exportSource.map((course, index) => ({
            "No": index + 1,
            "Title": course.title || "",
            "Category": course.category?.name || "",
            "Instructor": course.main_instructor?.username || "",
            "Price": course.price != null ? formatCurrency(course.price) : "",
            "Status": course.status || "",
            "Created At": formatDateTime(course.createdAt),

        }));

        // 3. Tạo worksheet & workbook
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");

        // 4. Xuất file
        const fileName =
            selectedCourses.length > 0
                ? `courses_selected_${Date.now()}.xlsx`
                : `courses_${Date.now()}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="max-w-full mx-auto space-y-4 min-h-screen bg-gray-50/50">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="border-indigo-500 border-1 rounded-sm shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-indigo-500 shadow-sm">
                <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-600 text-black p-2">
                        <div className="flex flex-col items-center sm:flex-row gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full max-w-[135px] sm:w-[180px] bg-white">
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
                                <SelectTrigger className="w-full max-w-[125px] sm:w-[180px] bg-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Revisions</SelectItem>
                                    <SelectItem value="approve">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reject">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                className="bg-white text-black hover:bg-gray-100"
                                onClick={handleExportExcel}
                            >
                                <Download />
                                Export
                            </Button>
                        </div>
                        <div className="relative border border-gray-200 rounded-md bg-white text-black">
                            <Search className="absolute left-2.5 top-3 h-4 w-4" />
                            <Input
                                placeholder="Search courses..."
                                className="pl-9 w-full sm:w-[250px] bg-white text-black"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="overflow-y-auto">
                        <Table className="bg-none border-none">
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead className="w-[30px] flex items-center">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all"
                                            className="!rounded"
                                        />
                                    </TableHead>
                                    <TableHead>Course Info</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Instructor</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Last update</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Review</TableHead>
                                    {selectedCourses.length > 0 && (
                                        <TableHead className="text-right">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading courses...
                                        </TableCell>
                                    </TableRow>
                                ) : currentCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentCourses.map((course) => (
                                        <TableRow
                                            key={course._id}
                                            className={`hover:bg-gray-200 transition-colors cursor-pointer ${selectedCourses.includes(course._id) ? "bg-gray-200" : ""
                                                }`}
                                            onClick={() =>
                                                handleSelectOne(
                                                    course._id,
                                                    !selectedCourses.includes(course._id)
                                                )
                                            }
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedCourses.includes(course._id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(course._id, checked)
                                                    }
                                                    aria-label={`Select ${course.title}`}
                                                    className="!rounded data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 max-w-[200px] overflow-hidden">
                                                {course.title}
                                            </TableCell>
                                            <TableCell>{course.category.name}</TableCell>
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
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatDateTime(course.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatDateTime(course.updatedAt)}
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {course.isDeleted ? (
                                                    <span className="text-red-500">Deleted</span>
                                                ) : (
                                                    <span className="text-green-500">Active</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatus(course.status)}</TableCell>
                                            {selectedCourses.length > 0 && (
                                                <TableCell
                                                    className="text-right w-[50px]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedCourses.includes(course._id) && (
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
                                                                        onConfirm={() =>
                                                                            handleApprove(course._id)
                                                                        }
                                                                    />
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedCourseId(course._id);
                                                                            setShowRejectModal(true);
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                asChild
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <Link
                                                                    to={`/admin/courses/${course._id}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
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
                </div>
            </div>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Reject Course
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting{" "}
                            {selectedCourseId ? "this course" : "selected courses"}. This will be sent to the
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

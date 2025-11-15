import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { approveCourse, getAllCourse, rejectCourse } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";

const CourseManagementPage = () => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const fetchCourses = async () => {
        setLoading(true);
        const res = await getAllCourse();
        if (res?.success) {
            const data = res.data || [];
            setCourses(data);
            console.log("data", data);
        } else {
            // ⚠️ Khi API trả về success = false
            console.error("Lỗi từ server:", res?.message || "Không xác định");
            ToastHelper.error(res?.message || "Đã xảy ra lỗi khi lấy danh sách khóa học!");
        }
    };
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
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };
    // ✅ Handle Approve
    const handleApprove = async (id) => {
        try {
            const res = await approveCourse(id);
            if (res?.success) {
                ToastHelper.success("Khóa học đã được duyệt thành công!");
                fetchCourses();
            } else {
                ToastHelper.error(data?.message || "Duyệt thất bại!");
            }
        } catch (err) {
            ToastHelper.error("Lỗi hệ thống khi duyệt!");
        }
    };
    // ❌ Handle Reject
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
                ToastHelper.error(data?.message || "Từ chối thất bại!");
            }
        } catch (err) {
            console.log("err", err);
            ToastHelper.error("Lỗi hệ thống khi từ chối!");
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchSearch =
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.main_instructor.username.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !status || course.status.toLowerCase() === status.toLowerCase();
        return matchSearch && matchStatus;
    });
    return (
        <div className="py-8 px-4 bg-[#fafafd] min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Course Management</h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Filter Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Search course name or lecturer..."
                            className="border border-gray-200 rounded-lg px-4 py-2 w-64 bg-white text-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-700"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Programming">Programming</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                        <select
                            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-700"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="approve">Approved</option>
                            <option value="pending">Pending Approval</option>
                            <option value="reject">Rejected</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Courses ({courses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Lecturer</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Creation Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell>{course.title}</TableCell>
                                    <TableCell>{course.main_instructor?.username}</TableCell>
                                    <TableCell>{formatCurrency(course.price)}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            className={
                                                course.status === "approve"
                                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                                    : course.status === "pending"
                                                    ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                                                    : "bg-red-500 hover:bg-red-600 text-white"
                                            }
                                        >
                                            {course.status}
                                        </Button>
                                    </TableCell>

                                    <TableCell>{formatDateTime(course.createdAt)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {course.status === "pending" && (
                                                <>
                                                    {/* ✅ Approve confirmation */}
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border border-gray-300 px-3"
                                                            >
                                                                ✓ Approve
                                                            </Button>
                                                        }
                                                        title="Duyệt khóa học"
                                                        description="Bạn có chắc chắn muốn duyệt khóa học này không?"
                                                        confirmText="Duyệt"
                                                        onConfirm={() => handleApprove(course._id)}
                                                    />

                                                    {/* ✅ Reject confirmation */}
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <Button variant="destructive" size="sm" className="px-3">
                                                                ✗ Reject
                                                            </Button>
                                                        }
                                                        title="Từ chối khóa học"
                                                        description="Bạn có chắc chắn muốn từ chối khóa học này không?"
                                                        confirmText="Từ chối"
                                                        onConfirm={() => {
                                                            setSelectedCourseId(course._id);
                                                            setShowRejectModal(true);
                                                        }}
                                                    />
                                                </>
                                            )}

                                            {course.status === "approve" && (
                                                <>
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <Button variant="destructive" size="sm" className="px-3">
                                                                ✗ Reject
                                                            </Button>
                                                        }
                                                        title="Từ chối khóa học"
                                                        description="Bạn có chắc chắn muốn từ chối khóa học này không?"
                                                        confirmText="Từ chối"
                                                        onConfirm={() => {
                                                            setSelectedCourseId(course._id);
                                                            setShowRejectModal(true);
                                                        }}
                                                    />
                                                </>
                                            )}

                                            {course.status === "reject" && (
                                                <>
                                                    {/* Chỉ hiện nút Approve */}
                                                    <ConfirmationHelper
                                                        trigger={
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border border-gray-300 px-3"
                                                            >
                                                                ✓ Approve
                                                            </Button>
                                                        }
                                                        title="Duyệt khóa học"
                                                        description="Bạn có chắc chắn muốn duyệt khóa học này không?"
                                                        confirmText="Duyệt"
                                                        onConfirm={() => handleApprove(course._id)}
                                                    />
                                                </>
                                            )}

                                            {/* Luôn có nút xem chi tiết */}
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="border border-gray-300 px-3 flex items-center gap-1"
                                            >
                                                <Link to={`/admin/courses/${course._id}`}>
                                                    <Eye className="w-4 h-4" /> View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px] relative border border-gray-100 animate-scaleIn">
                        {/* Nút đóng */}
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Tiêu đề */}
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            🚫 Lý do từ chối
                        </h3>

                        {/* Gợi ý mô tả */}
                        <p className="text-sm text-gray-500 mb-3">Vui lòng nhập lý do để từ chối yêu cầu này.</p>

                        {/* Ô nhập */}
                        <textarea
                            rows="4"
                            className="w-full border border-gray-200 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none resize-none transition"
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        {/* Nút hành động */}
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
                            >
                                Gửi từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-6">
                <Button variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button variant="outline" className="font-bold bg-white border border-gray-300">
                    1
                </Button>
                <Button variant="outline" className="bg-white border border-gray-300">
                    2
                </Button>
                <Button variant="outline" className="bg-white border border-gray-300">
                    3
                </Button>
                <Button variant="outline">
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default CourseManagementPage;

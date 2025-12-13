import React, { useMemo, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getInstructorDashboard } from "@/services/courseService";
import { FaChartBar, FaUserGraduate, FaMoneyBillWave, FaStar, FaBook } from "react-icons/fa";
// Import Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StatCard = ({ title, value, delta, caption, icon: Icon }) => (
    <div className="shadow-sm">
        <div className="">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {Icon && <Icon className="w-3 h-3 text-indigo-500" />}
                        {title}
                    </div>
                    <div className="mt-1 text-2xl font-semibold">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{caption}</div>
                </div>
                {delta !== undefined && (
                    <div
                        className={cn(
                            "text-sm font-medium",
                            delta >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}
                    >
                        {delta >= 0 ? `+${delta}%` : `${delta}%`}
                        <div className="text-xs text-muted-foreground">from last month</div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// very small, dependency-free bar chart (visual only)
const MiniBarChart = ({ series = [] }) => {
    const max = Math.max(...series.map((s) => s.total), 1);
    return (
        <div className="flex space-x-0.5 h-12 items-end">
            {series.map((s, i) => (
                <div
                    key={i}
                    className="w-1/6 bg-indigo-400 rounded-t"
                    style={{ height: `${(s.total / max) * 100}%` }}
                    title={`${s._id}: ${s.total} enrollments`}
                />
            ))}
        </div>
    );
};

const DashBoardInstructor = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("month"); // Thêm state cho bộ lọc

    const instructorId = user?._id ?? user?.id;

    useEffect(() => {
        if (!instructorId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // !!! CẬP NHẬT: Thêm tham số filter vào API call
                const res = await getInstructorDashboard(instructorId, { filter });
                const data = res?.data?.data || res?.data;

                if (data?.overview) {
                    setDashboardData(data);
                } else {
                    console.error("Dashboard data is empty or malformed:", data);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [instructorId, filter]); // Dependency array bao gồm filter

    const overview = dashboardData?.overview || {};
    const enrollmentTrends = dashboardData?.enrollmentTrends || [];
    const revenueDistribution = dashboardData?.revenueDistribution || [];
    const recentActivities = dashboardData?.recentActivities || [];

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
    }

    const pieChartData = revenueDistribution.map((item) => ({
        name: item.category,
        value: item.revenue,
    }));

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatDateTime = (isoDate) => {
        if (!isoDate) return "-";
        const date = new Date(isoDate);
        const time = date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const day = date.toLocaleDateString("vi-VN");
        return `${time} ${day}`;
    };

    // loại bỏ Total Videos Uploaded khỏi overviewStats
    const overviewStats = [
        {
            title: "Total Courses",
            value: overview.totalCourse || 0,
            caption: "Total courses created",
            icon: FaBook,
        },
        {
            title: "Total Enrollments",
            value: overview.totalEnrollments || 0,
            delta: overview.enrollmentGrowth,
            caption: "Total students across all courses",
            icon: FaUserGraduate,
        },
        {
            title: "Average Course Rating",
            value: overview.avgRating || 0,
            caption: "Overall rating of your courses",
            icon: FaStar,
        },
    ];

    // sắp xếp revenue distribution theo doanh thu giảm dần
    const revenueDistributionSorted = [...revenueDistribution].sort(
        (a, b) => (b.revenue || 0) - (a.revenue || 0)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>

                {/* !!! ĐÃ THÊM: Bộ chọn lọc thời gian */}
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Tháng Hiện Tại</SelectItem>
                        <SelectItem value="week">Tuần Hiện Tại</SelectItem>
                        <SelectItem value="quarter">Quý Hiện Tại</SelectItem>
                        <SelectItem value="year">Năm Hiện Tại</SelectItem>
                        <SelectItem value="all">Toàn Bộ Thời Gian</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                {overviewStats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}

                {/* Total Revenue card vẫn giữ để hiển thị tổng doanh thu */}
                <div className="col-span-full md:col-span-1">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(overview.totalRevenue || 0)}
                        delta={overview.revenueGrowth}
                        caption="Total earnings from course sales"
                        icon={FaMoneyBillWave}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Enrollment Trends (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {enrollmentTrends.length > 0 ? (
                            <MiniBarChart series={enrollmentTrends} />
                        ) : (
                            <div className="text-center text-gray-500 h-24 flex items-center justify-center">
                                No enrollment data available.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Distribution by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueDistributionSorted.length > 0 ? (
                            <div className="space-y-2">
                                {revenueDistributionSorted.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex-1 pr-4">
                                            <div className="font-medium truncate">
                                                {item.category || "Uncategorized"}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {item.revenue ? formatCurrency(item.revenue) : "0 VND"}
                                            </div>
                                        </div>
                                        <div className="w-1/3">
                                            <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500"
                                                    style={{
                                                        width: `${Math.round(
                                                            ((item.revenue || 0) /
                                                                (overview.totalRevenue || 1)) *
                                                                100
                                                        )}%`,
                                                    }}
                                                    title={`${Math.round(
                                                        ((item.revenue || 0) / (overview.totalRevenue || 1)) *
                                                            100
                                                    )}%`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 h-24 flex items-center justify-center">
                                No revenue data available.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="px-4 pt-4">
                    <CardTitle>Recent Activities</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Overview of latest student interactions (Enrollments & Reviews).
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="text-left text-sm text-muted-foreground border-b">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3">Activity Type</th>
                                <th className="px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivities.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                        No recent activities found.
                                    </td>
                                </tr>
                            ) : (
                                recentActivities.map((a, i) => (
                                    <tr key={a._id} className={i % 2 === 0 ? "bg-white" : "bg-muted/50"}>
                                        <td className="px-4 py-3 text-sm flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={a.user?.avatar} />
                                                <AvatarFallback>
                                                    {a.user?.username ? a.user.username[0] : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {a.user?.username || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{a.courseTitle || "N/A"}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <Badge
                                                variant={a.type === "Enrollment" ? "default" : "secondary"}
                                                className={
                                                    a.type === "Review"
                                                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                                        : ""
                                                }
                                            >
                                                {a.type === "Review" ? `Review (${a.rating}⭐)` : a.type}
                                            </Badge>
                                            {a.type === "Review" && a.comment && (
                                                <div
                                                    className="text-xs text-gray-500 mt-1 truncate max-w-[200px]"
                                                    title={a.comment}
                                                >
                                                    "{a.comment}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDateTime(a.date)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashBoardInstructor;

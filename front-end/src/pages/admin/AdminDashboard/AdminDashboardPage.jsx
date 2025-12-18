import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Users,
    BookOpen,
    Clock,
    AlertTriangle,
    CheckCircle,
    GraduationCap,
    TrendingUp,
    DollarSign,
} from "lucide-react";
import adminService from "@/services/adminService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
    const [counts, setCounts] = useState({
        totalUsers: 0,
        instructors: 0,
        students: 0,
        pendingCourses: 0,
        approvedCourses: 0,
        pendingReports: 0,
        totalCourses: 0,
    });
    const [topCourses, setTopCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Time filter states
    const [timePeriod, setTimePeriod] = useState("yearly");
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [quarter, setQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));

    const [monthlyUsers, setMonthlyUsers] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);

    const getFilters = () => {
        const filters = { period: timePeriod, year };
        if (timePeriod === "quarterly") filters.quarter = quarter;
        if (timePeriod === "monthly" || timePeriod === "weekly") filters.month = month;
        return filters;
    };

    useEffect(() => {
        let mounted = true;
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const filters = getFilters();
                const [
                    totalUsers,
                    instructors,
                    students,
                    totalCourses,
                    approvedCourses,
                    pendingCourses,
                    pendingReports,
                    popularCourses,
                ] = await Promise.all([
                    adminService.getTotalUsers(filters),
                    adminService.getTotalInstructors(filters),
                    adminService.getTotalLearners(filters),
                    adminService.getTotalCourses(filters),
                    adminService.getTotalApprovedCourses(filters),
                    adminService.getTotalPendingCourses(filters),
                    adminService.getTotalPendingReports(filters),
                    adminService.getTopPopularCourses(filters),
                ]);

                if (!mounted) return;

                setCounts({
                    totalUsers: totalUsers ?? 0,
                    instructors: instructors ?? 0,
                    students: students ?? 0,
                    totalCourses: totalCourses ?? 0,
                    approvedCourses: approvedCourses ?? 0,
                    pendingCourses: pendingCourses ?? 0,
                    pendingReports: pendingReports ?? 0,
                });

                setTopCourses(Array.isArray(popularCourses) ? popularCourses : []);
            } catch (err) {
                console.error("Failed to load admin dashboard:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchOverview();
        return () => (mounted = false);
    }, [timePeriod, year, month, quarter]);

    useEffect(() => {
        let mounted = true;
        const fetchMonthlyStats = async () => {
            try {
                const monthlyFilters = { year };
                const [usersData, revenueData] = await Promise.all([
                    adminService.getMonthlyUserStatistics(monthlyFilters),
                    adminService.getMonthlyRevenueStatistics(monthlyFilters),
                ]);

                if (!mounted) return;
                setMonthlyUsers(usersData ?? []);
                setMonthlyRevenue(revenueData ?? []);
            } catch (err) {
                console.error("Failed to load monthly stats:", err);
                setMonthlyUsers([]);
                setMonthlyRevenue([]);
            }
        };

        fetchMonthlyStats();
        return () => (mounted = false);
    }, [year]);

    const normalizeMonthlyCounts = (raw, valueKey = "count") => {
        const months = new Array(12).fill(0);
        if (!Array.isArray(raw)) return months;
        raw.forEach((item) => {
            const m = Number(item.month);
            if (!isNaN(m) && m >= 1 && m <= 12) {
                months[m - 1] = Number(item[valueKey] ?? 0);
            }
        });
        return months;
    };

    const usersByMonth = normalizeMonthlyCounts(monthlyUsers, "count");
    const revenueByMonth = normalizeMonthlyCounts(monthlyRevenue, "total");
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const chartData = monthLabels.map((label, index) => ({
        name: label,
        users: usersByMonth[index],
        revenue: revenueByMonth[index],
    }));

    const stats = [
        {
            title: "Total Users",
            value: counts.totalUsers,
            icon: <Users className="h-5 w-5 text-blue-600" />,
            bg: "bg-blue-100",
        },
        {
            title: "Instructors",
            value: counts.instructors,
            icon: <GraduationCap className="h-5 w-5 text-purple-600" />,
            bg: "bg-purple-100",
        },
        {
            title: "Learners",
            value: counts.students,
            icon: <BookOpen className="h-5 w-5 text-indigo-600" />,
            bg: "bg-indigo-100",
        },
        {
            title: "Pending Courses",
            value: counts.pendingCourses,
            icon: <Clock className="h-5 w-5 text-orange-600" />,
            bg: "bg-orange-100",
        },
        {
            title: "Approved Courses",
            value: counts.approvedCourses,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            bg: "bg-green-100",
        },
        {
            title: "Pending Reports",
            value: counts.pendingReports,
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
            bg: "bg-red-100",
        },
    ];

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }).map((_, i) => currentYear - i);
    const periodOptions = [
        { value: "yearly", label: "Yearly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "monthly", label: "Monthly" },
        { value: "weekly", label: "Weekly" },
    ];
    const quarterOptions = [1, 2, 3, 4];
    const monthOptions = monthLabels.map((label, index) => ({
        value: index + 1,
        label,
    }));

    return (
        <div className="min-h-screen bg-slate-50/50 space-y-8 pb-8">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back to EduVerse Admin Panel</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                        <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodOptions.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="w-[100px] bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearOptions.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {timePeriod === "quarterly" && (
                        <Select value={String(quarter)} onValueChange={(v) => setQuarter(Number(v))}>
                            <SelectTrigger className="w-[100px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                {quarterOptions.map((q) => (
                                    <SelectItem key={q} value={String(q)}>
                                        Q{q}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {(timePeriod === "monthly" || timePeriod === "weekly") && (
                        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                            <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((m) => (
                                    <SelectItem key={m.value} value={String(m.value)}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                            <div className={`p-3 rounded-full ${stat.bg}`}>{stat.icon}</div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {loading ? "..." : stat.value ?? 0}
                                </div>
                                <p className="text-xs font-medium text-slate-500 mt-1">{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Users className="h-5 w-5 text-indigo-600" />
                            User Growth ({year})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f1f5f9" }}
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                        }}
                                    />
                                    <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Revenue Trends ({year})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat("vi-VN", {
                                                notation: "compact",
                                                compactDisplay: "short",
                                                currency: "VND",
                                                style: "currency",
                                            }).format(value)
                                        }
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff",
                                        }}
                                        formatter={(value) => [
                                            new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(value),
                                            "Revenue",
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Courses Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        Top Popular Courses
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/admin/courses">View All Courses</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="font-semibold text-slate-700">Course Name</TableHead>
                                <TableHead className="hidden md:table-cell font-semibold text-slate-700">
                                    Category
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700">Enrollments</TableHead>
                                <TableHead className="font-semibold text-slate-700">Rating</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No popular courses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                topCourses.map((course, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">
                                            {course.courseTitle || course.name}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge
                                                variant="secondary"
                                                className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            >
                                                {course.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-indigo-600">
                                            {course.enrollmentCount ?? course.enrollments ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-slate-900">
                                                    {course.averageRating.toFixed(2) ??
                                                        course.rating.toFixed(2) ??
                                                        0}
                                                </span>
                                                <span className="text-yellow-500">⭐</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboardPage;

import React, { useEffect, useState } from "react";
import adminService from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, BookOpen, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RevenuePage = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [topRevenueCourses, setTopRevenueCourses] = useState([]);
    const [topRevenueInstructors, setTopRevenueInstructors] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const total = await adminService.getTotalRevenue();
                setTotalRevenue(total);

                const stats = await adminService.getMonthlyRevenueStatistics(selectedYear);
                // Fill in missing months with 0
                const filledStats = Array.from({ length: 12 }, (_, i) => {
                    const monthStat = stats.find((s) => s.month === i + 1);
                    return {
                        month: i + 1,
                        total: monthStat ? monthStat.total : 0,
                        label: new Date(0, i).toLocaleString("default", { month: "short" }),
                    };
                });
                setMonthlyStats(filledStats);

                const courses = await adminService.getTopRevenueCourses();
                setTopRevenueCourses(courses || []);

                const instructors = await adminService.getTopRevenueInstructors();
                setTopRevenueInstructors(instructors || []);
            } catch (error) {
                console.error("Failed to fetch revenue data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    const maxTotal = Math.max(...monthlyStats.map((s) => s.total), 1);

    return (
        <div className="space-y-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Revenue Analytics</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Year:</span>
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(val) => setSelectedYear(parseInt(val))}
                    >
                        <SelectTrigger className="w-[120px] bg-white">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                totalRevenue
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">All time revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Monthly Revenue Trends ({selectedYear})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full flex items-end justify-between gap-2 pt-10 pb-2 px-4">
                        {monthlyStats.map((stat) => (
                            <div key={stat.month} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="relative w-full flex items-end justify-center h-full">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(stat.total)}
                                    </div>
                                    {/* Bar */}
                                    <div
                                        className="w-full max-w-[40px] bg-green-100 group-hover:bg-green-200 transition-all duration-500 rounded-t-sm relative overflow-hidden"
                                        style={{ height: `${(stat.total / maxTotal) * 100}%` }}
                                    >
                                        <div className="absolute bottom-0 left-0 right-0 h-full bg-green-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-500 uppercase">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Revenue Courses */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <BookOpen className="h-5 w-5 text-green-600" />
                            Top Revenue Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topRevenueCourses.map((course, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold text-green-600 bg-green-100 rounded-full">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 line-clamp-1">
                                                {course.courseTitle}
                                            </p>
                                            <p className="text-xs text-slate-500">{course.mainInstructor}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(course.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {topRevenueCourses.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No course data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Revenue Instructors */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <User className="h-5 w-5 text-green-600" />
                            Top Revenue Instructors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topRevenueInstructors.map((instructor, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold text-green-600 bg-green-100 rounded-full">
                                            {index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage src={instructor.avatar} alt={instructor.name} />
                                            <AvatarFallback>{instructor.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">{instructor.name}</p>
                                            <p className="text-xs text-slate-500">{instructor.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(instructor.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {topRevenueInstructors.length === 0 && (
                                <p className="text-center text-slate-500 py-4">
                                    No instructor data available.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RevenuePage;

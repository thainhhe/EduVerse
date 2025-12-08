import React, { useEffect, useState } from "react";
import adminService from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, BookOpen, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
                    <div className="h-[400px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyStats}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
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
                                    cursor={{ fill: "#f1f5f9" }}
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
                                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40}>
                                    {monthlyStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#16a34a" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
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

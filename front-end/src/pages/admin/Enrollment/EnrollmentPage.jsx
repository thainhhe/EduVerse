import React, { useEffect, useState } from "react";
import adminService from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, BookOpen, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EnrollmentPage = () => {
    const [totalEnrollments, setTotalEnrollments] = useState(0);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [topCourses, setTopCourses] = useState([]);
    const [topLearners, setTopLearners] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const total = await adminService.getTotalEnrollments();
                setTotalEnrollments(total);

                const stats = await adminService.getMonthlyEnrollmentStatistics(selectedYear);
                // Fill in missing months with 0
                const filledStats = Array.from({ length: 12 }, (_, i) => {
                    const monthStat = stats.find((s) => s.month === i + 1);
                    return {
                        month: i + 1,
                        count: monthStat ? monthStat.count : 0,
                        label: new Date(0, i).toLocaleString("default", { month: "short" }),
                    };
                });
                setMonthlyStats(filledStats);

                const courses = await adminService.getTopPopularCourses();
                setTopCourses(courses || []);

                const learners = await adminService.getTopLearners();
                setTopLearners(learners || []);
            } catch (error) {
                console.error("Failed to fetch enrollment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    return (
        <div className="space-y-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Enrollment Analytics</h1>
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
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Enrollments
                        </CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalEnrollments}</div>
                        <p className="text-xs text-slate-500 mt-1">All time enrollments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        Monthly Enrollment Trends ({selectedYear})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={monthlyStats}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
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
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                    formatter={(value) => [value, "Enrollments"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Courses */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                            Top Enrolled Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCourses.map((course, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold text-indigo-600 bg-indigo-100 rounded-full">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 line-clamp-1">
                                                {course.courseTitle}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {course.mainInstructor} • {course.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{course.enrollmentCount}</p>
                                        <p className="text-xs text-slate-500">Learners</p>
                                    </div>
                                </div>
                            ))}
                            {topCourses.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No course data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Learners */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Award className="h-5 w-5 text-indigo-600" />
                            Top Active Learners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topLearners.map((learner, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold text-indigo-600 bg-indigo-100 rounded-full">
                                            {index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage src={learner.avatar} alt={learner.name} />
                                            <AvatarFallback>{learner.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">{learner.name}</p>
                                            <p className="text-xs text-slate-500">{learner.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{learner.enrollmentCount}</p>
                                        <p className="text-xs text-slate-500">Courses</p>
                                    </div>
                                </div>
                            ))}
                            {topLearners.length === 0 && (
                                <p className="text-center text-slate-500 py-4">No learner data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentPage;

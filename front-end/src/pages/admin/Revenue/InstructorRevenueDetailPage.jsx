import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "@/services/adminService";
import { getUserById } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, BookOpen, Users, DollarSign, Download } from "lucide-react";

const InstructorRevenueDetailPage = () => {
    const { instructorId } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await getUserById(instructorId);
                if (res?.data) {
                    setInstructor(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch instructor details:", error);
            }
        };
        fetchInstructor();
    }, [instructorId]);

    useEffect(() => {
        const fetchRevenue = async () => {
            setLoading(true);
            try {
                const startDate = new Date(selectedYear, 0, 1);
                const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

                const response = await adminService.getInstructorCourseRevenue(instructorId, {
                    page,
                    limit,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                });

                setCourses(response || []);
                setTotalPages(Math.ceil((response.metadata?.total || 0) / limit));
            } catch (error) {
                console.error("Failed to fetch course revenue:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue();
    }, [instructorId, selectedYear, page, limit]);

    const totalRevenue = courses.reduce((sum, course) => sum + course.totalRevenue, 0);
    const totalLearners = courses.reduce((sum, course) => sum + course.totalLearners, 0);

    return (
        <div className="min-h-screen bg-slate-50 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Instructor Revenue Details</h1>
                        <p className="text-sm text-slate-500">Detailed breakdown of revenue by course</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
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
                    <Button variant="outline" className="bg-white">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Instructor Info Card */}
            {instructor && (
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-2 border-slate-100">
                                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                                <AvatarFallback className="text-xl">
                                    {instructor.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">{instructor.name}</h2>
                                <p className="text-slate-500">{instructor.email}</p>
                                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                        <span className="font-medium">{courses.length} Courses</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium">{totalLearners} Learners</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-green-500" />
                                        <span className="font-medium text-green-600">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(totalRevenue)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Courses Table */}
            <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Course Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[80px]">No.</TableHead>
                                <TableHead>Course Title</TableHead>
                                <TableHead className="text-right">Learners</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No courses found for this period.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course, index) => (
                                    <TableRow key={course.courseId} className="hover:bg-slate-50">
                                        <TableCell className="font-medium">
                                            {(page - 1) * limit + index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">
                                            {course.courseTitle}
                                        </TableCell>
                                        <TableCell className="text-right">{course.totalLearners}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(course.totalRevenue)}
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

export default InstructorRevenueDetailPage;

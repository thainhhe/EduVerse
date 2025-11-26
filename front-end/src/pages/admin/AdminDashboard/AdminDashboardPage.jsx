import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  MessageCircleWarning,
  CheckCircle,
} from "lucide-react";
import adminService from "@/services/adminService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchOverview = async () => {
      setLoading(true);
      try {
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
          adminService.getTotalUsers(),
          adminService.getTotalInstructors(),
          adminService.getTotalLearners(),
          adminService.getTotalCourses(),
          adminService.getTotalApprovedCourses(),
          adminService.getTotalPendingCourses(),
          adminService.getTotalPendingReports(),
          adminService.getTopPopularCourses(),
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
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchMonthlyStats = async () => {
      try {
        const [usersData, revenueData] = await Promise.all([
          adminService.getMonthlyUserStatistics(year),
          adminService.getMonthlyRevenueStatistics(year),
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

  // Normalize backend array [{ month: 1, count: x }, ...] => [x,x,...] length=12
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

  // Prepare arrays for render
  const usersByMonth = normalizeMonthlyCounts(monthlyUsers, "count");
  const revenueByMonth = normalizeMonthlyCounts(monthlyRevenue, "total"); // if backend uses 'total' or adjust

  // helper month labels
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const stats = [
    {
      title: "Total Users",
      value: counts.totalUsers,
      change: "+",
      icon: <Users />,
    },
    {
      title: "Lecturers",
      value: counts.instructors,
      change: "+",
      icon: <Users />,
    },
    { title: "Students", value: counts.students, change: "+", icon: <Users /> },
    {
      title: "Courses Pending Approval",
      value: counts.pendingCourses,
      icon: <Clock />,
    },
    {
      title: "Approved Courses",
      value: counts.approvedCourses,
      icon: <CheckCircle />,
    },
    {
      title: "Unprocessed Error Reports",
      value: counts.pendingReports,
      icon: <AlertTriangle />,
    },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }).map((_, i) => currentYear - i);

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Year:</div>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value ?? 0}
              </div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly User Statistics ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersByMonth.map((v, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">
                    {monthLabels[idx]}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{
                        width: `${Math.round(
                          (v / (Math.max(...usersByMonth) || 1)) * 100
                        )}%`,
                      }}
                      title={`${v} users`}
                    />
                  </div>
                  <div className="w-12 text-right text-sm">{v}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueByMonth.map((v, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">
                    {monthLabels[idx]}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.round(
                          (v / (Math.max(...revenueByMonth) || 1)) * 100
                        )}%`,
                      }}
                      title={`${v}`}
                    />
                  </div>
                  <div className="w-28 text-right text-sm">
                    {v
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(v)
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Popular Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead className="hidden sm:table-cell">Lecturer</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCourses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No popular courses found.
                  </TableCell>
                </TableRow>
              ) : (
                topCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {course.courseTitle || course.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {course.mainInstructor || course.lecturer}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.category}
                    </TableCell>
                    <TableCell>
                      {course.enrollmentCount ?? course.enrollments ?? 0}
                    </TableCell>
                    <TableCell>
                      {course.averageRating ?? course.rating ?? 0} ⭐
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

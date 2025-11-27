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

  // Time filter states
  // Default to yearly and always use selected year
  const [timePeriod, setTimePeriod] = useState("yearly"); // 'weekly','monthly','quarterly','yearly'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [quarter, setQuarter] = useState(
    Math.floor((new Date().getMonth() + 3) / 3)
  ); // 1-4

  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  // Hàm helper để tạo đối tượng filters cho API call
  const getFilters = () => {
    const filters = { period: timePeriod };

    // Bắt buộc phải có year vì các thống kê luôn cần năm
    filters.year = year;

    // Thêm các tham số chi tiết khác nếu cần cho back-end lọc
    if (timePeriod === "quarterly") {
      filters.quarter = quarter;
    }

    // Nếu chọn tháng hoặc tuần, truyền tháng (và có thể là năm)
    if (timePeriod === "monthly" || timePeriod === "weekly") {
      filters.month = month;
    }

    // Nếu là 'all', ta vẫn truyền year (ví dụ 2025) nhưng back-end sẽ bỏ qua các bộ lọc khác nếu cần
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
        // Luôn truyền object filters có year để đảm bảo API nhận year trong path
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
    // Chỉ lắng nghe state 'year' vì biểu đồ này là thống kê hàng tháng của 1 năm
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
  const periodOptions = [
    { value: "yearly", label: "Năm" },
    { value: "quarterly", label: "Quý" },
    { value: "monthly", label: "Tháng" },
    { value: "weekly", label: "Tuần" },
  ];
  const quarterOptions = [1, 2, 3, 4];
  const monthOptions = monthLabels.map((label, index) => ({
    value: index + 1,
    label,
  }));

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Lọc theo:</div>
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Always show Year selector (required for monthly/yearly stats) */}
          <div className="text-sm text-muted-foreground">Năm:</div>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-[100px]">
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

          {timePeriod === "quarterly" && (
            <>
              <div className="text-sm text-muted-foreground">Quý:</div>
              <Select
                value={String(quarter)}
                onValueChange={(v) => setQuarter(Number(v))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarterOptions.map((q) => (
                    <SelectItem key={q} value={String(q)}>
                      Q{q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {(timePeriod === "monthly" || timePeriod === "weekly") && (
            <>
              <div className="text-sm text-muted-foreground">Tháng:</div>
              <Select
                value={String(month)}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
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

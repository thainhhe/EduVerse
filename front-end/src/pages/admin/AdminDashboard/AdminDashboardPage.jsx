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

const stats = [
  { title: "Total Users", value: "1,245", change: "+20.1%", icon: <Users /> },
  { title: "Lecturers", value: "150", change: "+5.2%", icon: <Users /> },
  { title: "Students", value: "1,095", change: "+22.5%", icon: <Users /> },
  { title: "Courses Pending Approval", value: "12", icon: <Clock /> },
  { title: "Approved Courses", value: "358", icon: <CheckCircle /> },
  { title: "Unprocessed Error Reports", value: "5", icon: <AlertTriangle /> },
  {
    title: "Unresolved Complaints",
    value: "8",
    icon: <MessageCircleWarning />,
  },
];

const topCourses = [
  {
    name: "Advanced React Hooks",
    lecturer: "Dr. Elena Popova",
    category: "Web Development",
    enrollments: 1250,
    rating: 4.9,
  },
  {
    name: "Mastering Python for Data Science",
    lecturer: "Prof. Ben Carter",
    category: "Data Science",
    enrollments: 1120,
    rating: 4.8,
  },
  {
    name: "Introduction to Cybersecurity",
    lecturer: "Ms. Chloe Smith",
    category: "Cybersecurity",
    enrollments: 980,
    rating: 4.7,
  },
];

const AdminDashboardPage = () => {
  return (
    <div className="space-y-8 py-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

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
              <div className="text-2xl font-bold">{stat.value}</div>
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
            <CardTitle>Monthly User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-md">
              <p>Bar Chart Here</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-md">
              <p>Line Chart Here</p>
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
              {topCourses.map((course, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {course.lecturer}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {course.category}
                  </TableCell>
                  <TableCell>{course.enrollments}</TableCell>
                  <TableCell>{course.rating} ⭐</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;

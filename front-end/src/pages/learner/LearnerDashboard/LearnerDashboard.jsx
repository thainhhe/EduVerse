import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  FaCalendarAlt,
  FaBook,
  FaUserTie,
  FaCog,
  FaChartLine,
  FaBolt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEnrollment } from "@/context/EnrollmentContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { enrollments } = useEnrollment();
  console.log("enrollments", enrollments)
  const upcomingDeadlines = [
    { title: "React Project Milestone 2", date: "2024-07-25" },
    { title: "AI Ethics Essay Submission", date: "2024-07-28" },
    { title: "UI/UX Case Study Presentation", date: "2024-08-01" },
    { title: "Data Visualization Assignment", date: "2024-08-05" },
    { title: "Music Composition Final Project", date: "2024-08-10" },
  ];


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your progress and upcoming activities.
          </p>
        </div>

        {/* Enrolled Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Enrolled Courses
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {enrollments.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{course.courseTitle}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {course.instructor}
                    </p>
                    <div className="space-y-2 mb-4 flex-row">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Date start: {new Date(course.lastAccessed).toLocaleDateString("vi-VN")}
                        </span>

                      </div>
                      {/* <Progress value={course.progress} className="h-2" /> */}
                    </div>
                  </div>
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Link to={`/courses/${course.courseId}`}>  Continue Learning</Link>
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="text-sm font-medium">
                      {deadline.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {deadline.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaBolt className="text-indigo-600" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/courses"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <FaBook className="text-2xl text-indigo-600" />
                  <span className="text-sm font-medium">Browse Courses</span>
                </Link>
                <Link
                  to="/instructors"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <FaUserTie className="text-2xl text-indigo-600" />
                  <span className="text-sm font-medium">Find Instructors</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <FaCog className="text-2xl text-indigo-600" />
                  <span className="text-sm font-medium">Manage Settings</span>
                </Link>
                <Link
                  to="/progress"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <MdDashboard className="text-2xl text-indigo-600" />
                  <span className="text-sm font-medium">View Progress</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaChartLine className="text-indigo-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Activity chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

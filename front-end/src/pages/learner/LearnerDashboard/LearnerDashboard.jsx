import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
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
import { enrollmentService } from "@/services/enrollmentService";

const Dashboard = () => {
  const { user } = useAuth();
  const { enrollments } = useEnrollment(); // keep if needed elsewhere
  const [detailedEnrollments, setDetailedEnrollments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const uid = user?._id ?? user?.id;
    if (!uid) return;

    (async () => {
      try {
        const data = await enrollmentService.getEnrollmentsDetailByUser(uid);
        // data may be an array of enrollment objects (as in your payload)
        setDetailedEnrollments(Array.isArray(data) ? data : []);
        // collect recent quiz activities across enrollments
        const allScores = (Array.isArray(data) ? data : []).flatMap((enr) =>
          (enr.allScores || []).map((s) => ({
            ...s,
            courseTitle: enr.courseId?.title,
          }))
        );
        const recent = allScores
          .slice()
          .sort(
            (a, b) =>
              new Date(b.dateSubmitted).getTime() -
              new Date(a.dateSubmitted).getTime()
          )
          .slice(0, 6);
        setRecentActivities(recent);
      } catch (err) {
        console.error("Failed to load enrollment details", err);
      }
    })();
  }, [user]);

  // helper to compute dates
  const toLocaleDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("vi-VN") : "-";

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back, {user?.username}!
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
            {detailedEnrollments.map((enr) => {
              const course = enr.courseId || {};
              const startDate = new Date(enr.enrollmentDate || Date.now());
              const durationValue = course.duration?.value ?? 0;
              const durationUnit = course.duration?.unit ?? "day";
              // assume unit is 'day' for now; convert to days
              const durationDays =
                durationUnit === "day" ? durationValue : durationValue;
              const endDate = new Date(
                startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
              );
              const daysRemaining = Math.ceil(
                (endDate - now) / (24 * 60 * 60 * 1000)
              );
              const progressValue = Math.max(
                0,
                Math.min(100, enr.progress ?? 0)
              );

              return (
                <Card
                  key={enr._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {course.main_instructor?.email || "Instructor"}
                      </p>
                      <div className="space-y-2 mb-4">
                        {/* Dòng 1: Date start */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Date start: {toLocaleDate(enr.enrollmentDate)}
                          </span>
                        </div>

                        {/* Dòng 2: Ends */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Ends: {toLocaleDate(endDate.toISOString())}
                          </span>
                          <span className="text-gray-600">
                            {daysRemaining >= 0
                              ? `${daysRemaining} ngày còn lại`
                              : `đã kết thúc`}
                          </span>
                        </div>

                        {/* Dòng 3: Progress (được căn chỉnh vị trí cố định) */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600 font-medium">
                              {progressValue}%
                            </span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Link to={`/courses/${course._id || course.courseId}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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
                {detailedEnrollments.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No enrollments found.
                  </div>
                )}
                {detailedEnrollments.map((enr) => {
                  const course = enr.courseId || {};
                  const startDate = new Date(enr.enrollmentDate || Date.now());
                  const durationValue = course.duration?.value ?? 0;
                  const durationUnit = course.duration?.unit ?? "day";
                  const durationDays =
                    durationUnit === "day" ? durationValue : durationValue;
                  const endDate = new Date(
                    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
                  );
                  const daysRemaining = Math.ceil(
                    (endDate - now) / (24 * 60 * 60 * 1000)
                  );

                  return (
                    <div
                      key={enr._id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ends: {toLocaleDate(endDate.toISOString())}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {daysRemaining >= 0
                          ? `${daysRemaining} ngày`
                          : "Đã hết hạn"}
                      </div>
                    </div>
                  );
                })}
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
                  to="/dashboard"
                  onClick={() =>
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
                  }
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
            <div className="space-y-3">
              {recentActivities.length === 0 && (
                <div className="h-24 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No recent quiz activity.</p>
                </div>
              )}

              {recentActivities.map((act) => (
                <div
                  key={act._id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {act.quizId?.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {act.courseTitle} — {toLocaleDate(act.dateSubmitted)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {act.percentage ??
                      Math.round((act.score / (act.totalPoints || 1)) * 100)}
                    %
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

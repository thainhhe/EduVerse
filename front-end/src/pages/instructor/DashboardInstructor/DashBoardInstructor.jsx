import React, { useMemo, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getInstructorDashboard } from "@/services/courseService";

const StatCard = ({ title, value, delta, caption }) => (
  <Card className="shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{caption}</div>
        </div>
        <div
          className={cn(
            "text-sm font-medium",
            delta >= 0 ? "text-emerald-600" : "text-rose-600"
          )}
        >
          {delta >= 0 ? `+${delta}%` : `${delta}%`}
          <div className="text-xs text-muted-foreground">from last month</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// very small, dependency-free bar chart (visual only)
const MiniBarChart = ({ series = [] }) => {
  const max = Math.max(...series.map((s) => s.value), 1);
  return (
    <div className="flex gap-2 items-end h-40 p-4">
      {series.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            title={`${s.label}: ${s.value}`}
            className="w-full rounded-md bg-indigo-500 transition-all"
            style={{ height: `${(s.value / max) * 100}%` }}
          />
          <div className="text-xs text-muted-foreground mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// simple pie using SVG arcs (approximate)
const MiniPie = ({ slices = [] }) => {
  const total = Math.max(
    slices.reduce((a, b) => a + b.value, 0),
    1
  );
  let acc = 0;
  const radius = 60;
  const cx = 70;
  const cy = 70;

  const makePath = (startAngle, endAngle) => {
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} z`;
  };

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      {slices.map((s, i) => {
        const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += s.value;
        const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const path = makePath(start, end);
        return (
          <path key={i} d={path} fill={s.color} stroke="#fff" strokeWidth="1" />
        );
      })}
    </svg>
  );
};

const DashboardInstructor = () => {
  const { user } = useAuth() || {};
  const instructorId = user?._id || user?.id || null;

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [barSeries, setBarSeries] = useState([]);
  const [pieSlices, setPieSlices] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!instructorId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getInstructorDashboard(instructorId);
        const payload = res?.data?.data;
        if (!payload) {
          setLoading(false);
          return;
        }

        // Overview
        setOverview(payload.overview || null);

        // enrollmentTrends -> barSeries (map month number to short label)
        const monthNames = [
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
        const trends = (payload.enrollmentTrends || []).map((t) => ({
          label: monthNames[(t._id || 0) - 1] || `${t._id}`,
          value: t.total || 0,
        }));
        setBarSeries(
          trends.length
            ? trends
            : [
                { label: "Jan", value: 0 },
                { label: "Feb", value: 0 },
                { label: "Mar", value: 0 },
                { label: "Apr", value: 0 },
                { label: "May", value: 0 },
                { label: "Jun", value: 0 },
              ]
        );

        // revenueDistribution -> pieSlices
        const colors = [
          "#6366F1",
          "#FB7185",
          "#34D399",
          "#F59E0B",
          "#A78BFA",
          "#60A5FA",
        ];
        const dist = (payload.revenueDistribution || []).map((d, i) => ({
          label: d.category || "Unknown",
          value: d.revenue || 0,
          color: colors[i % colors.length],
        }));
        setPieSlices(
          dist.length
            ? dist
            : [{ label: "No data", value: 1, color: "#E5E7EB" }]
        );

        // activities: the backend doesn't return recent activities here; build a simple list from top courses/enrollments if available
        setActivities([
          // fallback placeholder; keep original mock for UX while server data not provided
          {
            student: "Alice Smith",
            course: "Advanced React",
            activity: "Completed Lesson: Hooks",
            time: "5 minutes ago",
          },
          {
            student: "Bob Johnson",
            course: "Python for Data Science",
            activity: "Submitted Assignment: Week 3",
            time: "1 hour ago",
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch instructor dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [instructorId]);

  const stats = [
    {
      title: "Total Videos Uploaded",
      value: overview ? overview.totalVideos : "—",
      delta: overview ? Number(overview.videoGrowth) || 0 : 0,
      caption: "Across all your courses",
    },
    {
      title: "Students Enrolled",
      value: overview ? overview.totalEnrollments : "—",
      delta: overview ? Number(overview.enrollmentGrowth) || 0 : 0,
      caption: "Across all active courses",
    },
    {
      title: "Total Revenue",
      value: overview ? `$${overview.totalRevenue}` : "—",
      delta: overview ? Number(overview.revenueGrowth) || 0 : 0,
      caption: "Total earnings to date",
    },
    {
      title: "Average Course Rating",
      value: overview ? overview.avgRating : "—",
      delta: 0,
      caption: "Based on student feedback",
    },
  ];

  const pieLegend = useMemo(
    () =>
      pieSlices.map((s) => ({
        ...s,
        label: s.label + ` ${Math.round(s.value)} `,
      })),
    [pieSlices]
  );

  return (
    <div className="space-y-6 p-6">
      {/* top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="px-4 pt-4">
            <CardTitle>Enrollment Trends</CardTitle>
            <div className="text-sm text-muted-foreground">
              Monthly student sign-ups.
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MiniBarChart series={barSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 pt-4">
            <CardTitle>Revenue Distribution</CardTitle>
            <div className="text-sm text-muted-foreground">
              Breakdown by course categories.
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <MiniPie slices={pieSlices} />
            <div className="w-full flex flex-wrap gap-3 justify-center">
              {pieLegend.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span
                    style={{ width: 10, height: 10, background: l.color }}
                    className="rounded-sm block"
                  />
                  <span className="text-sm">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* recent activities table */}
      <Card>
        <CardHeader className="px-4 pt-4">
          <CardTitle>Recent Activities</CardTitle>
          <div className="text-sm text-muted-foreground">
            Overview of latest student interactions.
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="text-left text-sm text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Activity Type</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/5"}>
                  <td className="px-4 py-3 text-sm">{a.student}</td>
                  <td className="px-4 py-3 text-sm">{a.course}</td>
                  <td className="px-4 py-3 text-sm">{a.activity}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {a.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInstructor;

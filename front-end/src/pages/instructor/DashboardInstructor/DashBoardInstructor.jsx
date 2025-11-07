import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  // MOCK data - replace by API calls
  const stats = [
    {
      title: "Total Videos Uploaded",
      value: "1,234",
      delta: 10,
      caption: "Across all your courses",
    },
    {
      title: "Students Enrolled",
      value: "9,876",
      delta: 15,
      caption: "Across all active courses",
    },
    {
      title: "Total Revenue",
      value: "$123,456",
      delta: 20,
      caption: "Total earnings to date",
    },
    {
      title: "Average Course Rating",
      value: "4.8",
      delta: 0,
      caption: "Based on student feedback",
    },
  ];

  const barSeries = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 600 },
    { label: "Mar", value: 1400 },
    { label: "Apr", value: 1600 },
    { label: "May", value: 1800 },
    { label: "Jun", value: 2200 },
  ];

  const pieSlices = [
    { label: "Web Dev", value: 35, color: "#6366F1" },
    { label: "Data Sci", value: 25, color: "#FB7185" },
    { label: "Mobile", value: 19, color: "#34D399" },
    { label: "Graphic", value: 14, color: "#F59E0B" },
    { label: "Digital", value: 7, color: "#A78BFA" },
  ];

  const activities = [
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
    {
      student: "Charlie Brown",
      course: "UI/UX Design Fundamentals",
      activity: "Enrolled in Course",
      time: "2 hours ago",
    },
    {
      student: "Diana Miller",
      course: "Modern JavaScript",
      activity: "Started Quiz: ES6 Features",
      time: "4 hours ago",
    },
    {
      student: "Eve Davis",
      course: "Cloud Computing Basics",
      activity: "Posted Question: AWS S3",
      time: "1 day ago",
    },
    {
      student: "Frank White",
      course: "Advanced React",
      activity: "Completed Lesson: Redux",
      time: "2 days ago",
    },
  ];

  const pieLegend = useMemo(
    () => pieSlices.map((s) => ({ ...s, label: s.label + ` ${s.value}%` })),
    []
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

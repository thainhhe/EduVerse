import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockComments = Array.from({ length: 12 }).map((_, i) => ({
  id: `C-${i + 1}`,
  author:
    i % 3 === 0
      ? "Alice Johnson"
      : i % 3 === 1
      ? "Bob Williams"
      : "Diana Miller",
  role: i % 3 === 0 ? "Student" : i % 3 === 1 ? "Lecturer" : "Admin",
  course: i % 2 === 0 ? "Advanced Web Development" : "UI/UX Design Principles",
  content:
    "This course content on machine learning is excellent and very deep.",
  status: i % 4 === 0 ? "Flagged" : "Pending Review",
  date: "Sep 24, 2025 01:33",
}));

const CommentManagementPage = () => {
  const [filterText, setFilterText] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // TODO: replace with API call + filters
    setItems(mockComments);
  }, []);

  const applyFilters = () => {
    console.log("apply filters", {
      filterText,
      courseFilter,
      authorFilter,
      statusFilter,
      timeFilter,
    });
    // TODO: call API with filters
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Comment and Forum Management</h2>

      <Card>
        <CardHeader className="px-6 py-4">
          <h3 className="text-lg font-medium">Filter Comments</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search comment content..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Select
              value={courseFilter}
              onValueChange={(v) => setCourseFilter(v)}
            >
              <SelectTrigger className="w-full">All Courses</SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                <SelectItem value="advanced-web">
                  Advanced Web Development
                </SelectItem>
                <SelectItem value="uiux">UI/UX Design Principles</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={authorFilter}
              onValueChange={(v) => setAuthorFilter(v)}
            >
              <SelectTrigger className="w-full">All Authors</SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Authors</SelectItem>
                <SelectItem value="alice">Alice Johnson</SelectItem>
                <SelectItem value="bob">Bob Williams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-full">All Statuses</SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v)}>
              <SelectTrigger className="w-full">All Time</SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 py-4">
          <h3 className="text-lg font-medium">All Comments ({items.length})</h3>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Course/Forum</th>
                <th className="px-4 py-3">Comment Content</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr
                  key={c.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-muted/5"}
                >
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {c.author
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium">{c.author}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.course}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[420px] truncate">{c.content}</div>
                    <div>
                      <a className="text-indigo-600 text-xs">View Details</a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="text-xs">{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-center mt-4 gap-3 text-sm text-muted-foreground">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <div className="px-3 py-1 border rounded">{page}</div>
            <button onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentManagementPage;

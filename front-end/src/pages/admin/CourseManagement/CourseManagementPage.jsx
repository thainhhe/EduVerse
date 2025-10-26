import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

const courses = [
  {
    id: "1",
    name: "Advanced React Hooks",
    lecturer: "Alice Smith",
    category: "Programming",
    status: "Approved",
    creationDate: "1/15/2023",
  },
  {
    id: "2",
    name: "UX Design Fundamentals",
    lecturer: "Bob Johnson",
    category: "Design",
    status: "Pending Approval",
    creationDate: "2/20/2023",
  },
  {
    id: "3",
    name: "Digital Marketing Strategy",
    lecturer: "Carol White",
    category: "Marketing",
    status: "Rejected",
    creationDate: "3/10/2023",
  },
  {
    id: "4",
    name: "Data Science with Python",
    lecturer: "David Green",
    category: "Programming",
    status: "Approved",
    creationDate: "4/5/2023",
  },
  {
    id: "5",
    name: "Mobile App Development",
    lecturer: "Eve Black",
    category: "Programming",
    status: "Approved",
    creationDate: "5/12/2023",
  },
  {
    id: "6",
    name: "Graphic Design Principles",
    lecturer: "Frank Blue",
    category: "Design",
    status: "Pending Approval",
    creationDate: "6/12/2023",
  },
  {
    id: "7",
    name: "Content Creation Masterclass",
    lecturer: "Grace Red",
    category: "Marketing",
    status: "Approved",
    creationDate: "7/18/2023",
  },
];

const statusColor = {
  Approved: "success",
  "Pending Approval": "secondary",
  Rejected: "destructive",
};

const CourseManagementPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="py-8 px-4 bg-[#fafafd] min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Course Management</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search course name or lecturer..."
              className="border border-gray-200 rounded-lg px-4 py-2 w-64 bg-white text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-700"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Button className="ml-auto bg-primary px-6">
              + Add New Course
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.lecturer}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor[course.status]}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.creationDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border border-gray-300 px-3"
                      >
                        ✓ Approve
                      </Button>
                      <Button variant="destructive" size="sm" className="px-3">
                        ✗ Reject
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border border-gray-300 px-3 flex items-center gap-1"
                      >
                        <Link to={`/admin/courses/${course.id}`}>
                          <Eye className="w-4 h-4" /> View Details
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-4 mt-6">
        <Button variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <Button
          variant="outline"
          className="font-bold bg-white border border-gray-300"
        >
          1
        </Button>
        <Button variant="outline" className="bg-white border border-gray-300">
          2
        </Button>
        <Button variant="outline" className="bg-white border border-gray-300">
          3
        </Button>
        <Button variant="outline">
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default CourseManagementPage;

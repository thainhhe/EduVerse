import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
} from "lucide-react";

// Placeholder Data - Replace with actual props or state
const instructor = {
  name: "Alice Wonderland",
  role: "Student", // Note: Image says student, but context implies instructor? Using Student as per image.
  email: "alice.w@example.com",
  phone: "+1 (555) 123-4567",
  joined: "2023-01-15",
  status: "Active",
  avatar: "/female-instructor-professional.jpg", // Using a relevant placeholder
};

const createdCourses = [
  {
    name: "Introduction to React",
    category: "Web Development",
    status: "Approved",
    createdDate: "2023-02-01",
  },
  {
    name: "Advanced CSS Techniques",
    category: "Web Design",
    status: "Pending Approval",
    createdDate: "2023-03-10",
  },
  {
    name: "Data Structures in Python",
    category: "Programming",
    status: "Approved",
    createdDate: "2023-04-22",
  },
  {
    name: "Effective Communication",
    category: "Soft Skills",
    status: "Rejected",
    createdDate: "2023-05-05",
  },
  {
    name: "Full-Stack with Node.js",
    category: "Web Development",
    status: "Approved",
    createdDate: "2023-06-18",
  },
];

const attendedCourses = [
  {
    name: "Machine Learning Basics",
    lecturer: "Dr. Smith",
    enrollmentDate: "2023-01-20",
    status: "Completed",
  },
  {
    name: "Cloud Computing Fundamentals",
    lecturer: "Prof. Johnson",
    enrollmentDate: "2023-02-10",
    status: "In Progress",
  },
  {
    name: "Cybersecurity Essentials",
    lecturer: "Ms. Davis",
    enrollmentDate: "2023-03-15",
    status: "Completed",
  },
  {
    name: "Database Management",
    lecturer: "Dr. White",
    enrollmentDate: "2023-04-01",
    status: "Not Started",
  },
  {
    name: "Project Management with Agile",
    lecturer: "Mr. Brown",
    enrollmentDate: "2023-05-25",
    status: "In Progress",
  },
];

// Helper to map status strings to badge variants
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return "default"; // Or define a specific 'success' variant if you have one
    case "pending approval":
    case "in progress":
      return "secondary";
    case "rejected":
    case "not started":
      return "destructive"; // Or 'outline'
    default:
      return "outline";
  }
};
// Helper to map status strings to badge color classes (adjust colors as needed)
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending approval":
    case "in progress":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
    case "not started":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const InstructorProfileDetail = () => {
  // Basic pagination state (example)
  const [createdPage, setCreatedPage] = useState(1);
  const [attendedPage, setAttendedPage] = useState(1);
  // Add logic here to slice data based on page number if needed

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar: User Information */}
      <div className="lg:col-span-1 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <Link to="/admin/users">
            {" "}
            {/* Adjust link as needed */}
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
        <Card>
          <CardHeader className="items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={instructor.avatar} alt={instructor.name} />
              <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle>{instructor.name}</CardTitle>
            <Badge
              variant={instructor.status === "Active" ? "default" : "secondary"}
              className={
                instructor.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : ""
              }
            >
              {instructor.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{instructor.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{instructor.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined: {instructor.joined}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Content: Tables */}
      <div className="lg:col-span-3 space-y-8">
        {/* Created Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Created Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {createdCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(course.status)}
                        className={getStatusColor(course.status)}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {course.createdDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Simple Pagination Example */}
            <div className="flex justify-end items-center space-x-2 pt-4">
              <Button variant="outline" size="sm" disabled={createdPage === 1}>
                Previous
              </Button>
              <span>{createdPage}</span>{" "}
              {/* Replace with actual page numbers */}
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attended Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attended Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead className="text-right">
                    Completion Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendedCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.lecturer}</TableCell>
                    <TableCell>{course.enrollmentDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={getStatusVariant(course.status)}
                        className={getStatusColor(course.status)}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Simple Pagination Example */}
            <div className="flex justify-end items-center space-x-2 pt-4">
              <Button variant="outline" size="sm" disabled={attendedPage === 1}>
                Previous
              </Button>
              <span>{attendedPage}</span>{" "}
              {/* Replace with actual page numbers */}
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorProfileDetail;

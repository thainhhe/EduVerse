import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2 } from "lucide-react";

const course = {
  id: "1",
  name: "Advanced React Patterns",
  lecturer: "Dr. Eleanor Vance",
  category: "Web Development",
  status: "Approved",
  description:
    "Dive deep into advanced React concepts and patterns to build scalable and maintainable applications. This course covers topics like render props, higher-order components, custom hooks, context API, and advanced state management techniques. You'll learn to write cleaner, more efficient, and reusable React code, enhancing your development workflow and the performance of your applications.",
  statistics: {
    students: 1250,
    rating: 4.8,
    reviews: 320,
  },
  reviews: [
    {
      name: "Alice Johnson",
      comment:
        "This course transformed my understanding of React! Highly recommend it.",
      date: "2023-11-15",
      rating: 5,
    },
    {
      name: "Bob Williams",
      comment:
        "Excellent content, though some sections were a bit fast-paced for beginners.",
      date: "2023-10-28",
      rating: 4,
    },
    {
      name: "Carol Davis",
      comment:
        "Dr. Vance explains complex topics with incredible clarity. A must-take for any serious React developer.",
      date: "2023-09-01",
      rating: 5,
    },
    {
      name: "David Green",
      comment:
        "Learned so many new patterns. The examples were very practical.",
      date: "2023-08-20",
      rating: 4,
    },
  ],
  errors: [
    {
      reporter: "Student A",
      content: "Video in Section 3, Lecture 2 has no audio.",
      date: "2024-01-20",
      status: "Processed",
    },
    {
      reporter: "Student B",
      content: "Quiz question 5 in Module 1 has incorrect answer key.",
      date: "2024-01-18",
      status: "Unprocessed",
    },
    {
      reporter: "Student C",
      content: "Typo on slide 7 of 'Context API' lecture.",
      date: "2024-01-10",
      status: "Processed",
    },
  ],
};

const statusColor = {
  Approved: "success",
  "Pending Approval": "secondary",
  Rejected: "destructive",
};

const CourseDetailPage = () => {
  const { id } = useParams();
  // Nếu có nhiều course, lấy course theo id ở đây

  return (
    <div className="py-8 px-4 bg-[#fafafd] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Course Details: {course.name}</h1>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/courses">← Back to List</Link>
        </Button>
        <Button className="bg-primary text-white font-semibold">
          ✓ Approve Course
        </Button>
        <Button variant="destructive">✗ Reject Course</Button>
        <Button variant="destructive">
          <Trash2 className="w-4 h-4 mr-1 inline" /> Delete Course
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Left: Preview + Info */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Course Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-2">
            <div className="font-semibold mb-4">Course Preview</div>
            <div className="bg-gray-100 rounded-lg flex items-center justify-center h-56">
              <span className="text-5xl text-gray-300">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#e5e7eb" />
                  <polygon points="10,8 16,12 10,16" fill="#9ca3af" />
                </svg>
              </span>
            </div>
          </div>
          {/* Course Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="font-semibold mb-4">Course Information</div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-gray-500">Lecturer:</span>
              <span className="font-medium">{course.lecturer}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-gray-500">Category:</span>
              <Badge variant="secondary">{course.category}</Badge>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <Badge variant={statusColor[course.status]}>
                {course.status}
              </Badge>
            </div>
            <div className="mt-4 text-gray-700">
              <div className="font-semibold mb-1">Description</div>
              <div className="text-sm">{course.description}</div>
            </div>
          </div>
        </div>
        {/* Right: Statistics + Actions */}
        <div className="w-full md:w-72 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="font-semibold mb-4">Course Statistics</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="text-base">👥</span> Students Enrolled:
                </span>
                <span className="font-bold">
                  {course.statistics.students.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Average Rating:
                </span>
                <span className="font-bold">
                  {course.statistics.rating} / 5
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" /> Total Reviews:
                </span>
                <span className="font-bold">{course.statistics.reviews}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Student Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="font-semibold mb-4">Student Reviews</div>
        {course.reviews.map((review, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b last:border-b-0 py-4"
          >
            <div>
              <div className="font-medium">{review.name}</div>
              <div className="text-gray-600 text-sm mb-1">{review.comment}</div>
              <div className="text-xs text-gray-400">{review.date}</div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill={i < review.rating ? "#facc15" : "none"}
                />
              ))}
              <span className="ml-2 font-semibold text-gray-600">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Error Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="font-semibold mb-4">Associated Error Reports</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="py-2 text-left">Reporter</th>
              <th className="py-2 text-left">Content</th>
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {course.errors.map((err, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{err.reporter}</td>
                <td className="py-2">{err.content}</td>
                <td className="py-2">{err.date}</td>
                <td className="py-2">
                  <Badge
                    variant={
                      err.status === "Processed" ? "success" : "secondary"
                    }
                  >
                    {err.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseDetailPage;

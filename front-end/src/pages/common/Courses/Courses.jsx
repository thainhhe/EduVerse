import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Thay đổi import: thêm FaRegStar
import { FaRegStar } from "react-icons/fa";

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Dữ liệu giả lập
  const categories = [
    "All",
    "Technology",
    "Business",
    "Design",
    "Health & Fitness",
    "Languages",
  ];
  const courses = [
    {
      id: 1,
      title: "Mastering React Hooks",
      instructor: "Alice Johnson",
      rating: 4.8,
      students: 1234,
      price: 49.99,
      image: "/react-code-on-screen.png",
      category: "Technology",
    },
    {
      id: 2,
      title: "Introduction to Digital Marketing",
      instructor: "Mark Davis",
      rating: 4.5,
      students: 987,
      price: 39.99,
      image: "/business-meeting-marketing.jpg",
      category: "Marketing",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Sarah Miller",
      rating: 4.7,
      students: 2109,
      price: 59.99,
      image: "/colorful-geometric-design.jpg",
      category: "Design",
    },
    {
      id: 4,
      title: "Yoga & Mindfulness for Beginners",
      instructor: "Emily White",
      rating: 4.9,
      students: 345,
      price: 29.99,
      image: "/yoga-meditation-nature.png",
      category: "Health & Fitness",
    },
    {
      id: 5,
      title: "Effective Project Management",
      instructor: "David Green",
      rating: 4.6,
      students: 1500,
      price: 69.99,
      image: "/business-team-collaboration.png",
      category: "Business",
    },
    {
      id: 6,
      title: "Oil Painting Techniques",
      instructor: "Sophia Lee",
      rating: 4.4,
      students: 780,
      price: 45.0,
      image: "/oil-painting-art-studio.jpg",
      category: "Arts & Music",
    },
  ];

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Browse Courses
        </h1>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-colors ${
                  selectedCategory === category
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col group"
            >
              <div className="overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  By {course.instructor}
                </p>

                {/* ===== BẮT ĐẦU PHẦN THAY ĐỔI ===== */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return ratingValue <= course.rating ? (
                      <FaRegStar
                        key={index}
                        className="text-yellow-400 text-base"
                      />
                    ) : (
                      <FaRegStar
                        key={index}
                        className="text-gray-300 text-base"
                      />
                    );
                  })}
                  <span className="ml-2 text-gray-500 text-sm">
                    ({course.rating})
                  </span>
                </div>
                {/* ===== KẾT THÚC PHẦN THAY ĐỔI ===== */}

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    ${course.price}
                  </span>
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link to={`/courses/${course.id}`}>Enroll</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {currentPage} of 2</span>
          <Button
            variant="outline"
            disabled={currentPage === 2}
            onClick={() => setCurrentPage(2)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Courses;

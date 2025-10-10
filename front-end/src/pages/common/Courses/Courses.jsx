import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    "All",
    "Technology",
    "Business",
    "Design",
    "Health & Fitness",
    "Languages",
    "Arts & Music",
    "Marketing",
  ];

  const courses = [
    {
      id: 1,
      title: "Mastering React Hooks",
      instructor: "Alice Johnson",
      rating: 4.8,
      price: 49.99,
      image: "/react-code-on-screen.png",
      category: "Technology",
    },
    {
      id: 2,
      title: "Introduction to Digital Marketing",
      instructor: "Mark Davis",
      rating: 4.5,
      price: 39.99,
      image: "/business-meeting-marketing.jpg",
      category: "Marketing",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Sarah Miller",
      rating: 4.7,
      price: 59.99,
      image: "/colorful-geometric-design.jpg",
      category: "Design",
    },
    {
      id: 4,
      title: "Yoga & Mindfulness for Beginners",
      instructor: "Emily White",
      rating: 4.9,
      price: 29.99,
      image: "/yoga-meditation-nature.png",
      category: "Health & Fitness",
    },
    {
      id: 5,
      title: "Effective Project Management",
      instructor: "David Green",
      rating: 4.6,
      price: 69.99,
      image: "/business-team-collaboration.png",
      category: "Business",
    },
    {
      id: 6,
      title: "Oil Painting Techniques",
      instructor: "Sophia Lee",
      rating: 4.4,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Browse Courses
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {course.instructor}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                    <span className="text-sm text-gray-600">
                      ({course.rating})
                    </span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    ${course.price}
                  </span>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Enroll
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4">
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

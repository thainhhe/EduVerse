import { useState } from "react";
import "./Courses.css";

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
    <div className="courses-page">
      <div className="container">
        <h1>Browse Courses</h1>

        <div className="categories-section">
          <h2>Categories</h2>
          <div className="categories-pills">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                />
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-instructor">{course.instructor}</p>
                <div className="course-footer">
                  <div className="course-rating">
                    <span className="stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-value">({course.rating})</span>
                  </div>
                  <p className="course-price">${course.price}</p>
                </div>
                <button className="enroll-btn">Enroll</button>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button className="pagination-btn" disabled={currentPage === 1}>
            Previous
          </button>
          <span className="page-info">Page {currentPage} of 2</span>
          <button className="pagination-btn" disabled={currentPage === 2}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;

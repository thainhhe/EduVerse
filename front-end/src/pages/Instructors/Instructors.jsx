import { useState } from "react";
import { Link } from "react-router-dom";
import "./Instructors.css";

const Instructors = () => {
  const [instructors] = useState([
    {
      id: 1,
      name: "Instructor 1",
      specialty: "Data Science",
      image: "/female-instructor.png",
    },
    {
      id: 2,
      name: "Instructor 2",
      specialty: "Web Development",
      image: "/male-instructor-with-glasses.jpg",
    },
    {
      id: 3,
      name: "Instructor 3",
      specialty: "Artificial Intelligence",
      image: "/female-instructor-professional.jpg",
    },
    {
      id: 4,
      name: "Instructor 4",
      specialty: "Graphic Design",
      image: "/male-instructor-creative.jpg",
    },
    {
      id: 5,
      name: "Instructor 5",
      specialty: "Cybersecurity",
      image: "/male-instructor-security-expert.jpg",
    },
    {
      id: 6,
      name: "Instructor 6",
      specialty: "Digital Marketing",
      image: "/male-instructor-business.jpg",
    },
    {
      id: 7,
      name: "Instructor 7",
      specialty: "UX/UI Design",
      image: "/female-instructor-designer.jpg",
    },
    {
      id: 8,
      name: "Instructor 8",
      specialty: "Cloud Computing",
      image: "/male-instructor-tech-expert.jpg",
    },
  ]);

  return (
    <div className="instructors-page">
      <div className="container">
        <div className="instructors-header">
          <h1>Featured Instructors</h1>
          <p className="subtitle">
            Meet our talented instructors and learn from the best in the field.
          </p>
        </div>

        <div className="instructors-grid">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="instructor-card">
              <div className="instructor-avatar">
                <img
                  src={instructor.image || "/placeholder.svg"}
                  alt={instructor.name}
                />
              </div>
              <h3>{instructor.name}</h3>
              <span className="specialty-badge">{instructor.specialty}</span>
              <Link
                to={`/instructors/${instructor.id}`}
                className="view-profile-btn"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructors;

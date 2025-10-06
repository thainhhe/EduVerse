import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import "./InstructorProfile.css";

const InstructorProfile = () => {
  const { id } = useParams();

  const instructor = {
    name: "Dr. Eleanor Vance",
    title: "Quantum Computing & Advanced Algorithms",
    specialties: [
      "Quantum Physics",
      "Algorithm Design",
      "Theoretical Computer Science",
    ],
    image: "/female-professor.png",
    biography:
      "Dr. Eleanor Vance is a distinguished professor and researcher with over 15 years of experience in the field of theoretical computer science. Her groundbreaking work in quantum algorithms has been published in numerous top-tier journals and recognized with prestigious awards. She is passionate about making complex topics accessible to a wider audience and has a unique ability to simplify challenging concepts. Dr. Vance believes in a hands-on approach to learning, encouraging students to actively explore and experiment with the material. She is also a mentor to several budding scientists and engineers, guiding them in their research endeavors.",
    contact: {
      email: "eleanor.vance@educonnect.com",
      phone: "+1 (555) 123-4567",
      website: "www.eleanorvance.com",
      location: "Online / New York, USA",
    },
    courses: [
      {
        id: 1,
        title: "Introduction to Quantum Computing",
        duration: "8 Weeks",
        description:
          "Explore the fundamental principles of quantum mechanics and their application in computing.",
      },
      {
        id: 2,
        title: "Advanced Algorithm Design",
        duration: "10 Weeks",
        description:
          "Deep dive into complex algorithms, data structures, and optimization techniques.",
      },
      {
        id: 3,
        title: "Quantum Cryptography & Security",
        duration: "6 Weeks",
        description:
          "Understand how quantum mechanics impacts cybersecurity and modern encryption.",
      },
    ],
  };

  return (
    <div className="instructor-profile-page">
      <div className="container">
        <Link to="/instructors" className="back-link">
          <FaArrowLeft /> Back to Instructors
        </Link>

        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={instructor.image || "/placeholder.svg"}
              alt={instructor.name}
            />
          </div>
          <div className="profile-info">
            <h1>{instructor.name}</h1>
            <p className="profile-title">{instructor.title}</p>
            <div className="specialties">
              {instructor.specialties.map((specialty, index) => (
                <span key={index} className="specialty-tag">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="biography-section">
          <h2>Biography</h2>
          <p>{instructor.biography}</p>
        </section>

        <section className="contact-section">
          <h2>Contact Information</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>{instructor.contact.email}</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>{instructor.contact.phone}</span>
            </div>
            <div className="contact-item">
              <FaGlobe className="contact-icon" />
              <span>{instructor.contact.website}</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>{instructor.contact.location}</span>
            </div>
          </div>
        </section>

        <section className="courses-section">
          <h2>Courses Taught</h2>
          <div className="courses-grid">
            {instructor.courses.map((course) => (
              <div key={course.id} className="course-card">
                <h3>{course.title}</h3>
                <p className="course-duration">Duration: {course.duration}</p>
                <p className="course-description">{course.description}</p>
                <button className="view-course-btn">View Course Details</button>
              </div>
            ))}
          </div>
        </section>

        <section className="connect-section">
          <h2>Connect Online</h2>
          <div className="social-links">
            <a href="#" className="social-link">
              <FaLinkedin />
            </a>
            <a href="#" className="social-link">
              <FaTwitter />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InstructorProfile;

import { Link } from "react-router-dom";
// import { useAuth } from "@hooks/useAuth";
import {
  FaCalendarAlt,
  FaBook,
  FaUserTie,
  FaCog,
  FaChartLine,
  FaBolt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "./Dashboard.css";

const Dashboard = () => {
  //const { user } = useAuth();

  const enrolledCourses = [
    {
      id: 1,
      title: "Advanced Web Development with React",
      instructor: "Jane Doe",
      progress: 75,
      image: "/react-web-development.png",
    },
    {
      id: 2,
      title: "Introduction to Artificial Intelligence",
      instructor: "John Smith",
      progress: 40,
      image: "/artificial-intelligence-network.png",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily White",
      progress: 90,
      image: "/ui-ux-design-concept.png",
    },
    {
      id: 4,
      title: "Data Science for Beginners",
      instructor: "Michael Green",
      progress: 20,
      image: "/data-science-concept.png",
    },
    {
      id: 5,
      title: "Music Theory and Composition",
      instructor: "Sarah Brown",
      progress: 60,
      image: "/music-theory-guitar.jpg",
    },
    {
      id: 6,
      title: "Urban Planning and Development",
      instructor: "David Lee",
      progress: 85,
      image: "/urban-planning-city.jpg",
    },
  ];

  const upcomingDeadlines = [
    { title: "React Project Milestone 2", date: "2024-07-25" },
    { title: "AI Ethics Essay Submission", date: "2024-07-28" },
    { title: "UI/UX Case Study Presentation", date: "2024-08-01" },
    { title: "Data Visualization Assignment", date: "2024-08-05" },
    { title: "Music Composition Final Project", date: "2024-08-10" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome Back, User!</h1>
          <p>Here's an overview of your progress and upcoming activities.</p>
        </div>

        {/* Enrolled Courses */}
        <section className="enrolled-courses">
          <h2 className="section-title">Your Enrolled Courses</h2>
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="enrolled-course-card">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="course-image"
                />
                <div className="course-info">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{course.instructor}</p>
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Progress: {course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="continue-btn">Continue Learning</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Upcoming Deadlines */}
          <div className="deadlines-section">
            <div className="section-header">
              <FaCalendarAlt className="section-icon" />
              <h3>Upcoming Deadlines</h3>
            </div>
            <div className="deadline-list">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="deadline-item">
                  <span className="deadline-title">{deadline.title}</span>
                  <span className="deadline-date">{deadline.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links-section">
            <div className="section-header">
              <FaBolt className="section-icon" />
              <h3>Quick Links</h3>
            </div>
            <div className="quick-links-grid">
              <Link to="/courses" className="quick-link-card">
                <FaBook className="quick-link-icon" />
                <span>Browse Courses</span>
              </Link>
              <Link to="/instructors" className="quick-link-card">
                <FaUserTie className="quick-link-icon" />
                <span>Find Instructors</span>
              </Link>
              <Link to="/settings" className="quick-link-card">
                <FaCog className="quick-link-icon" />
                <span>Manage Settings</span>
              </Link>
              <Link to="/progress" className="quick-link-card">
                <MdDashboard className="quick-link-icon" />
                <span>View Progress</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <section className="activity-section">
          <div className="section-header">
            <FaChartLine className="section-icon" />
            <h3>Recent Activity</h3>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              Activity chart will be displayed here
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

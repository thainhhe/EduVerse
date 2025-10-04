import { Link } from "react-router-dom";
import {
  FaClock,
  FaUserGraduate,
  FaCertificate,
  FaLaptopCode,
  FaLanguage,
  FaBriefcase,
  FaPalette,
  FaComments,
  FaChartLine,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import { MdAccessTime, MdVerified, MdForum } from "react-icons/md";
import "./Home.css";

const Home = () => {
  const features = [
    {
      icon: <FaClock />,
      title: "Flexible Learning",
      description:
        "Study at your own pace with lifetime access to courses. Learn anytime, anywhere in the world.",
    },
    {
      icon: <FaUserGraduate />,
      title: "Expert Instructors",
      description:
        "Learn from industry professionals with years of real-world experience and expertise.",
    },
    {
      icon: <FaCertificate />,
      title: "Accredited Certifications",
      description:
        "Earn recognized certificates upon completion to boost your career prospects.",
    },
  ];

  const categories = [
    {
      icon: <FaLaptopCode />,
      title: "Information Technology",
      description: "Master web development, cybersecurity, and cloud computing",
    },
    {
      icon: <FaLanguage />,
      title: "Languages",
      description: "Become fluent in new languages with interactive lessons",
    },
    {
      icon: <FaBriefcase />,
      title: "Business",
      description: "Develop leadership, marketing, and financial skills",
    },
    {
      icon: <FaPalette />,
      title: "Design & Creativity",
      description: "Unleash your artistic potential with graphic design, UI/UX",
    },
    {
      icon: <FaComments />,
      title: "Soft Skills",
      description: "Enhance communication, problem-solving, and teamwork",
    },
    {
      icon: <FaChartLine />,
      title: "Personal Development",
      description: "Improve productivity, mindfulness, and goal-setting",
    },
  ];

  const courses = [
    {
      id: 1,
      image: "/web-development-coding.png",
      category: "Development",
      title: "Full Stack Web Development",
      instructor: "John Doe",
      rating: 4.8,
      students: 2340,
      price: "$49.99",
    },
    {
      id: 2,
      image: "/cryptocurrency-blockchain.png",
      category: "Finance",
      title: "Cryptocurrency Fundamentals",
      instructor: "Sarah Johnson",
      rating: 4.9,
      students: 1890,
      price: "$39.99",
    },
    {
      id: 3,
      image: "/data-science-python.png",
      category: "Data Science",
      title: "Data Science with Python",
      instructor: "Mike Chen",
      rating: 4.7,
      students: 3120,
      price: "$59.99",
    },
    {
      id: 4,
      image: "/digital-marketing-strategy.png",
      category: "Marketing",
      title: "Digital Marketing Masterclass",
      instructor: "Emily White",
      rating: 4.6,
      students: 2560,
      price: "$44.99",
    },
    {
      id: 5,
      image: "/ui-ux-design-concept.png",
      category: "Design",
      title: "UI/UX Design Principles",
      instructor: "David Lee",
      rating: 4.8,
      students: 1980,
      price: "$54.99",
    },
    {
      id: 6,
      image: "/public-speaking-stage.png",
      category: "Communication",
      title: "Effective Public Speaking",
      instructor: "Lisa Brown",
      rating: 4.9,
      students: 1450,
      price: "$34.99",
    },
  ];

  const instructors = [
    {
      id: 1,
      name: "Dr. Anna Martinez",
      title: "AI Researcher",
      avatar: "/professional-woman-diverse.png",
    },
    {
      id: 2,
      name: "Prof. Ben Carter",
      title: "Business Strategy",
      avatar: "/professional-man.jpg",
    },
    {
      id: 3,
      name: "Ms. Olivia Lee",
      title: "UX Design Lead",
      avatar: "/stylish-woman.png",
    },
    {
      id: 4,
      name: "Mr. Daniel Green",
      title: "Full Stack Developer",
      avatar: "/developer-man.png",
    },
  ];

  const benefits = [
    {
      icon: <MdAccessTime />,
      title: "Learn Anytime, Anywhere",
      description:
        "Access courses on mobile, tablet, or desktop with flexible scheduling",
    },
    {
      icon: <FaUserGraduate />,
      title: "Qualified Instructors",
      description: "Learn from certified experts with proven track records",
    },
    {
      icon: <MdVerified />,
      title: "Industry Certification",
      description: "Get credentials recognized by top employers worldwide",
    },
    {
      icon: <MdForum />,
      title: "Vibrant Community",
      description: "Connect with peers and mentors in discussion forums",
    },
  ];

  const testimonials = [
    {
      text: "This Web Academy with Python changed my career! The instructors were top-notch, and the projects allowed me to build a real-world portfolio. Highly recommend!",
      author: "Ethan Diaz",
      role: "Student",
      avatar: "/student-man.jpg",
    },
    {
      text: "I loved the flexibility of the courses. The content was engaging, and the platform allowed me to learn at my own pace. The instructors were always available to help.",
      author: "Mark Stevenson",
      role: "Student",
      avatar: "/student-man-2.jpg",
    },
    {
      id: 3,
      text: "The UI/UX Design course was phenomenal! I gained practical skills that I immediately applied to my freelance projects. The community support was amazing too!",
      author: "Jessica Lee",
      role: "Student",
      avatar: "/student-woman.png",
    },
  ];

  const blogPosts = [
    {
      id: 1,
      image: "/education-future.jpg",
      date: "May 15, 2024",
      title: "The Future of AI in Education",
      excerpt:
        "Explore how artificial intelligence is revolutionizing the way we learn and teach in modern classrooms.",
    },
    {
      id: 2,
      image: "/study-skills.png",
      date: "May 10, 2024",
      title: "Top 5 Study Skills for 2024",
      excerpt:
        "Discover the latest research-backed study techniques that can boost your learning efficiency.",
    },
    {
      id: 3,
      image: "/online-learning-concept.png",
      date: "May 5, 2024",
      title: "Mastering Online Learning: A Comprehensive Guide",
      excerpt:
        "Learn proven strategies to stay motivated and succeed in your online education journey.",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Eduverse–Learn Anytime, Anywhere</h1>
            <p>
              Unlock your potential with our extensive range of expert-led
              courses. Designed for flexibility, designed for you.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary btn-large">
                Get Started Today
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/students-learning-online-illustration.jpg"
              alt="Students learning"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose">
        <div className="section-header">
          <h2>Why Choose Our Platform?</h2>
          <p>
            We offer a world-class learning experience designed to fit your
            schedule and goals. Unlock your potential with our expert-led
            courses.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="section-header">
          <h2>Explore Our Top Categories</h2>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
        <button className="view-all-btn">
          View All Courses <FaArrowRight />
        </button>
      </section>

      {/* Popular Courses Section */}
      <section className="popular-courses">
        <div className="section-header">
          <h2>Popular Courses</h2>
        </div>
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                className="course-image"
              />
              <div className="course-content">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">by {course.instructor}</p>
                <div className="course-footer">
                  <div className="course-rating">
                    <FaStar />
                    <span>{course.rating}</span>
                    <span>({course.students})</span>
                  </div>
                  <span className="course-price">{course.price}</span>
                </div>
                <button className="btn btn-primary course-btn">
                  Newest Sale
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instructors Section */}
      <section className="instructors">
        <div className="section-header">
          <h2>Meet Our Expert Instructors</h2>
        </div>
        <div className="instructors-grid">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="instructor-card">
              <img
                src={instructor.avatar || "/placeholder.svg"}
                alt={instructor.name}
                className="instructor-avatar"
              />
              <h3 className="instructor-name">{instructor.name}</h3>
              <p className="instructor-title">{instructor.title}</p>
            </div>
          ))}
        </div>
        <button className="view-all-btn">
          View All Instructors <FaArrowRight />
        </button>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="section-header">
          <h2>Benefits of Learning With Us</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Students Say</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="author-avatar"
                />
                <div>
                  <p className="author-name">{testimonial.author}</p>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog">
        <div className="section-header">
          <h2>Latest From Our Blog</h2>
        </div>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <div key={post.id} className="blog-card">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="blog-image"
              />
              <div className="blog-content">
                <p className="blog-date">{post.date}</p>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <a href="#" className="read-more">
                  Read more <FaArrowRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

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
  FaRegStar, // Import FaRegStar
} from "react-icons/fa";
import { MdAccessTime, MdVerified, MdForum } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import CategoriesSection from "./CategoriesSection";
import PopularCoursesSection from "./PopularCoursesSection";
import InstructorsSection from "./InstructorsSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";
import BlogSection from "./BlogSection";

const Home = () => {
  const features = [
    {
      icon: <FaClock className="w-8 h-8" />,
      title: "Flexible Learning",
      description:
        "Study at your own pace with lifetime access to courses. Learn anytime, anywhere in the world.",
    },
    {
      icon: <FaUserGraduate className="w-8 h-8" />,
      title: "Expert Instructors",
      description:
        "Learn from industry professionals with years of real-world experience and expertise.",
    },
    {
      icon: <FaCertificate className="w-8 h-8" />,
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
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <FeaturesSection features={features} />
      <CategoriesSection categories={categories} />
      <PopularCoursesSection courses={courses} />
      <InstructorsSection instructors={instructors} />
      <BenefitsSection benefits={benefits} />
      <TestimonialsSection testimonials={testimonials} />
      <BlogSection blogPosts={blogPosts} />
    </div>
  );
};

export default Home;

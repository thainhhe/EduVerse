import { FaClock, FaUserGraduate, FaCertificate } from "react-icons/fa";
import { MdAccessTime, MdVerified, MdForum } from "react-icons/md";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import CategoriesSection from "./CategoriesSection";
import PopularCoursesSection from "./PopularCoursesSection";
import InstructorsSection from "./InstructorsSection";
import BenefitsSection from "./BenefitsSection";
import TestimonialsSection from "./TestimonialsSection";

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
            description: "Earn recognized certificates upon completion to boost your career prospects.",
        },
    ];

    const benefits = [
        {
            icon: <MdAccessTime />,
            title: "Learn Anytime, Anywhere",
            description: "Access courses on mobile, tablet, or desktop with flexible scheduling",
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

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <FeaturesSection features={features} />
            <CategoriesSection />
            <PopularCoursesSection />
            <InstructorsSection />
            <BenefitsSection benefits={benefits} />
            <TestimonialsSection testimonials={testimonials} />
            {/* <BlogSection blogPosts={blogPosts} /> */}
        </div>
    );
};

export default Home;

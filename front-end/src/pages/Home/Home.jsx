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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Eduverse–Learn Anytime, Anywhere
              </h1>
              <p className="text-lg text-gray-600">
                Unlock your potential with our extensive range of expert-led
                courses. Designed for flexibility, designed for you.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Link to="/courses">Get Started Today</Link>
              </Button>
            </div>
            <div className="relative">
              <img
                src="/students-learning-online-illustration.jpg"
                alt="Students learning"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We offer a world-class learning experience designed to fit your
              schedule and goals. Unlock your potential with our expert-led
              courses.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex justify-center mb-4 text-indigo-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Explore Our Top Categories
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4 text-indigo-600 text-4xl">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-sm">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All Courses <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Popular Courses
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
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
                  <Badge className="mb-3">{course.category}</Badge>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    by {course.instructor}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <FaStar className="text-yellow-400" />
                      <span className="font-semibold">{course.rating}</span>
                      <span className="text-gray-500">({course.students})</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">
                      {course.price}
                    </span>
                  </div>
                  <Button className="w-full bg-indigo-500 hover:bg-indigo-700 text-white">
                    Newest Sale
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Meet Our Expert Instructors
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {instructors.map((instructor) => (
              <Card
                key={instructor.id}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-8 pb-6">
                  <img
                    src={instructor.avatar || "/placeholder.svg"}
                    alt={instructor.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-1">
                    {instructor.name}
                  </h3>
                  <p className="text-sm text-indigo-600">{instructor.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All Instructors <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Benefits of Learning With Us
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex justify-center mb-4 text-secondary-500 text-4xl">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              What Our Students Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Latest From Our Blog
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                  <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="link" className="p-0 text-indigo-600">
                    Read more <FaArrowRight className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const InstructorProfile = () => {
  const { id } = useParams();

  // Dữ liệu giả lập
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
      "Dr. Eleanor Vance is a distinguished professor and researcher with over 15 years of experience...",
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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/instructors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Instructors
          </Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
              <AvatarImage
                src={instructor.image || "/placeholder.svg"}
                alt={instructor.name}
              />
              <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">
                {instructor.name}
              </h1>
              <p className="text-md sm:text-lg text-gray-600 mb-4">
                {instructor.title}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {instructor.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-100"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Biography
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {instructor.biography}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="h-5 w-5 text-indigo-600" />
                <span>{instructor.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="h-5 w-5 text-indigo-600" />
                <span>{instructor.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Globe className="h-5 w-5 text-indigo-600" />
                <span>{instructor.contact.website}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span>{instructor.contact.location}</span>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Courses Taught
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructor.courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg text-indigo-600">
                      {course.title}
                    </CardTitle>
                    <CardDescription>
                      Duration: {course.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow p-6 pt-0">
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      {course.description}
                    </p>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto">
                      View Course Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Connect Online
            </h2>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="h-5 w-5 text-indigo-600" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="h-5 w-5 text-indigo-600" />
                </a>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;

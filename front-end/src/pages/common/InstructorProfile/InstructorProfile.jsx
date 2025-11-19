import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, MapPin, BookOpen } from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getMyCourses } from "@/services/courseService";

const InstructorProfile = () => {
    const { id } = useParams();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                setLoading(true);
                const res = await getMyCourses(id);
                console.log("res", res);
                const data = res?.data?.[0];
                console.log("data", data);
                if (data) setInstructor(data);
            } catch (error) {
                console.error("❌ Failed to fetch instructor data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInstructorData();
    }, [id]);

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
                Loading instructor information...
            </div>
        );

    if (!instructor)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
                <p className="mb-4">Instructor not found.</p>
                <Button asChild>
                    <Link to="/instructors">Go Back</Link>
                </Button>
            </div>
        );

    const { username, email, avatar, courses } = instructor;

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-6">
                    <Link to="/instructors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Instructors
                    </Link>
                </Button>

                {/* Instructor Info */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                            <AvatarImage src={avatar || "/default-avatar.png"} alt={username} />
                            <AvatarFallback>{username?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">{username}</h1>
                            <p className="text-gray-600 text-sm mb-2">{email}</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <section className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                <span>{email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <MapPin className="h-5 w-5 text-indigo-600" />
                                <span>Online / Global</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Globe className="h-5 w-5 text-indigo-600" />
                                <span>www.educonnect.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone className="h-5 w-5 text-indigo-600" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </section>

                    {/* Courses */}
                    <section className="mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-indigo-600" />
                            Courses Taught
                        </h2>

                        {!courses?.length ? (
                            <p className="text-gray-500 italic">This instructor hasn’t published any courses yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.slice(0, 3).map((course) => (
                                    <Card key={course._id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-indigo-600 line-clamp-2">
                                                {course.title}
                                            </CardTitle>
                                            <CardDescription>
                                                Duration:{" "}
                                                {course.duration?.value
                                                    ? `${course.duration.value} ${course.duration.unit}`
                                                    : "N/A"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col flex-grow p-6 pt-0">
                                            <img
                                                src={
                                                    course.thumbnail
                                                        ? `/uploads/${course.thumbnail}`
                                                        : "/course-placeholder.png"
                                                }
                                                alt={course.title}
                                                className="rounded-lg w-full h-36 object-cover mb-4"
                                            />
                                            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-4">
                                                {course.description}
                                            </p>
                                            <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                                                <span>💵 {course.price.toLocaleString()} VND</span>
                                                <span>⭐ {course.rating}/5</span>
                                            </div>
                                            <Button
                                                asChild
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto"
                                            >
                                                <Link to={`/courses/${course._id}`}>View Details</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Connect Section */}
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Connect Online</h2>
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

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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-4">
                    <Link to="/instructors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Instructors
                    </Link>
                </Button>

                {/* Instructor Info */}
                <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 mb-4">
                    {/* Header Banner */}
                    <div className="h-32 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg relative"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-6 -mt-12 mb-8">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg z-10 bg-white">
                            <AvatarImage
                                src={avatar || "/default-avatar.png"}
                                alt={username}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl bg-gray-100">
                                {username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left pt-2 md:pt-0 md:mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{username}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600 mt-1">
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full text-sm font-medium border border-indigo-100 capitalize">
                                    {instructor.job_title || "Instructor"}
                                </span>
                                {instructor.subject_instructor && (
                                    <span className="bg-purple-50 text-purple-700 px-3 py-0.5 rounded-full text-sm font-medium border border-purple-100">
                                        {instructor.subject_instructor}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    {(instructor.bio || instructor.introduction) && (
                        <section className="mb-8 px-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">About Me</h2>
                            {instructor.bio && <p className="text-gray-600 mb-3 italic">{instructor.bio}</p>}
                            {instructor.introduction && (
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {instructor.introduction}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Contact Info */}
                    <section className="mb-8 px-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                <span>{email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <MapPin className="h-5 w-5 text-indigo-600" />
                                <span>{instructor.address || "Online / Global"}</span>
                            </div>
                            {instructor.phoneNumber && (
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="h-5 w-5 text-indigo-600" />
                                    <span>{instructor.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Courses */}
                    <section className="mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Courses Taught
                        </h2>

                        {!courses.filter((course) => course.status === "approve")?.length ? (
                            <p className="text-gray-500 italic">
                                This instructor hasn’t published any courses yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {courses
                                    .filter((course) => course.status === "approve")
                                    .slice(0, 3)
                                    .map((course) => (
                                        <Card
                                            key={course._id}
                                            className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 group h-full"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={
                                                        course.thumbnail
                                                            ? `${course.thumbnail}`
                                                            : "/course-placeholder.png"
                                                    }
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-indigo-600 shadow-sm">
                                                    {course.duration?.value
                                                        ? `${course.duration.value} ${course.duration.unit}`
                                                        : "N/A"}
                                                </div>
                                            </div>

                                            <CardContent className="flex flex-col flex-grow p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                                                        <span>⭐</span>
                                                        <span>{course.rating || 0}/5</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        {course.price
                                                            ? `${course.price.toLocaleString()} VND`
                                                            : "Free"}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {course.title}
                                                </h3>

                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                                                    {course.description || "No description available."}
                                                </p>

                                                <Button
                                                    asChild
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all mt-auto"
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

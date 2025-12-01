import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { getUserById } from "@/services/userService";
import { ToastHelper } from "@/helper/ToastHelper";

const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case "approve":
        case "approved":
            return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
        case "pending":
            return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
        case "reject":
        case "rejected":
            return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const InstructorProfileDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await getUserById(userId);
            if (res?.success) {
                setUser(res.data);
            } else {
                ToastHelper.error("Failed to fetch user data");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            ToastHelper.error("Error loading user data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-gray-500">User not found</p>
                <Button asChild>
                    <Link to="/admin/users">Back to User List</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Button variant="ghost" size="sm" asChild className="mb-4">
                <Link to="/admin/users" className="p-2 border">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to User List
                </Link>
            </Button>
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: User Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback className="text-2xl">
                                    {user.username?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">{user.username}</CardTitle>
                            <Badge
                                className={
                                    user.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : user.status === "locked"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }
                            >
                                {user.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>Joined: {new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="w-full text-xs text-gray-500 space-y-1">
                                <p>
                                    <span className="font-medium">User ID:</span>
                                    <br />
                                    <span className="font-mono">{user._id}</span>
                                </p>
                                <p>
                                    <span className="font-medium">Last Login:</span>
                                    <br />
                                    {user.lastLogin
                                        ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                                        : "Never"}
                                </p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Content: Courses */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Created Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Created Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.createdCourses && user.createdCourses.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Created Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.createdCourses.map((course) => (
                                            <TableRow key={course._id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        to={`/admin/courses/${course._id}`}
                                                        className="hover:text-primary hover:underline"
                                                    >
                                                        {course.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{course.category?.name || "N/A"}</TableCell>
                                                <TableCell>{getStatusBadge(course.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No courses created yet</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enrolled Courses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrolled Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course Name</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead>Enrollment Date</TableHead>
                                            <TableHead className="text-right">Progress</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.enrolledCourses.map((enrollment) => (
                                            <TableRow key={enrollment._id}>
                                                <TableCell className="font-medium">
                                                    {enrollment.course?.title || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {enrollment.course?.main_instructor?.username || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {enrollment.progress || 0}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No enrolled courses</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User Bio/Description if available */}
                    {user.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorProfileDetail;

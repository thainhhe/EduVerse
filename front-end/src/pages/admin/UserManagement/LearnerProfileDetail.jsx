import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Mail, Calendar, User } from "lucide-react";
import { getUserById } from "@/services/userService";
import { ToastHelper } from "@/helper/ToastHelper";

const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
            return <Badge className="bg-green-100 text-green-700">Active</Badge>;
        case "locked":
            return <Badge className="bg-red-100 text-red-700">Locked</Badge>;
        case "pending":
            return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const LearnerProfileDetail = () => {
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
            console.log("User data:", res);
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
                            {getStatusBadge(user.status)}
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="capitalize">{user.role}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>Joined: {new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </CardContent>
                        <CardContent className="pt-0 border-t">
                            <div className="text-xs text-gray-500 space-y-2 mt-4">
                                <div>
                                    <p className="font-medium text-gray-700">User ID:</p>
                                    <p className="font-mono break-all">{user._id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Last Login:</p>
                                    <p>
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                                            : "Never"}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Last Updated:</p>
                                    <p>{new Date(user.updatedAt).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content: Enrolled Courses */}
                <div className="lg:col-span-3 space-y-6">
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
                                            <TableHead>Category</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead>Enrolled Date</TableHead>
                                            <TableHead className="text-right">Progress</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.enrolledCourses.map((enrollment) => (
                                            <TableRow key={enrollment._id}>
                                                <TableCell className="font-medium">
                                                    {enrollment.course ? (
                                                        <Link
                                                            to={`/admin/courses/${enrollment.course._id}`}
                                                            className="hover:text-primary hover:underline"
                                                        >
                                                            {enrollment.course.title}
                                                        </Link>
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {enrollment.course?.category?.name || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {enrollment.course?.main_instructor?.username || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(enrollment.enrollmentDate).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{
                                                                    width: `${enrollment.progress || 0}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {enrollment.progress || 0}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="text-lg font-medium">No enrolled courses yet</p>
                                    <p className="text-sm mt-2">
                                        This learner hasn't enrolled in any courses
                                    </p>
                                </div>
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

                    {/* Permissions */}
                    {user.permissions && user.permissions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Permissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.permissions.map((permission, index) => (
                                        <Badge key={index} variant="secondary">
                                            {permission.name || permission}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearnerProfileDetail;

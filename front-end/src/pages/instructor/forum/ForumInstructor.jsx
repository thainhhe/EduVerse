import { useEffect, useState } from "react";
import { getForumByCourseId } from "@/services/forumService";
import { useAuth } from "@/hooks/useAuth";
import CommentList from "./CommentList";
import { Edit, MessageSquare, Users, BookOpen } from "lucide-react";
import { EditForum } from "./EditForum";
import { useCourse } from "@/context/CourseProvider";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForumManagement() {
    const sessionCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;
    const rawCourseData = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseData") : null;
    const sessionCourseData = rawCourseData ? JSON.parse(rawCourseData) : null;
    const { user } = useAuth();
    const [forum, setForum] = useState(null);

    const [isOpenEdit, setIsOpenEdit] = useState(false);

    const fetchForum = async () => {
        try {
            const res = await getForumByCourseId(sessionCourseId);
            if (res.success) {
                setForum(res.data);
            }
        } catch (err) {
            console.error("Error loading forum:", err);
        }
    };

    useEffect(() => {
        fetchForum();
    }, [sessionCourseId]);

    const { isMainInstructor, hasPermission } = useCourse();
    const isCollab = hasPermission("manage_forum") || isMainInstructor;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">{sessionCourseData?.title || "Course"}</span>
                                <span className="text-gray-300">/</span>
                                <span className="text-indigo-600 font-medium flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    Discussion Forum
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    {forum?.title || "Forum"}
                                </h1>
                                {isMainInstructor && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                        onClick={() => setIsOpenEdit(true)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            {forum?.description && (
                                <p className="text-gray-600 text-sm max-w-3xl break-all whitespace-pre-wrap">
                                    {forum.description}
                                </p>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 min-w-[120px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-medium text-indigo-600">Participants</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-700">
                                    {isCollab ? "Active" : "View Only"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forum Content */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Discussion Board</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Share ideas, ask questions, and collaborate with others
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <CommentList
                            userId={user?._id}
                            forumId={forum?._id}
                            courseId={sessionCourseId}
                            canComment={isCollab}
                            isMainInstructor={isMainInstructor}
                            isCollab={isCollab}
                        />
                    </CardContent>
                </Card>
            </div>

            <EditForum open={isOpenEdit} onOpenChange={setIsOpenEdit} onUpdate={fetchForum} forum={forum} />
        </div>
    );
}

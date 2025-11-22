import { useEffect, useState } from "react";

import { getForumByCourseId } from "@/services/forumService";
import { useAuth } from "@/hooks/useAuth";
import CommentList from "./CommentList";
import { Edit } from "lucide-react";
import { EditForum } from "./EditForum";
import { useCourse } from "@/context/CourseProvider";

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
        <div className="max-w-full">
            <div className="flex-1 border-b-1 border-indigo-600 pb-2">
                <div className="flex items-center justify-between">
                    <div className="text-2xl max-w-200px truncate">Forum : {forum?.title}</div>
                    {isMainInstructor && (
                        <Edit className="text-blue-600 cursor-pointer" onClick={() => setIsOpenEdit(true)} />
                    )}
                </div>
                <span className="text-gray-600 max-w-full line-clamp-3">{forum?.description}</span>
            </div>
            <div className="max-w-full border-0">
                <CommentList
                    userId={user?._id}
                    forumId={forum?._id}
                    courseId={[]}
                    canComment={isCollab}
                    isMainInstructor={isMainInstructor}
                    isCollab={isCollab}
                />
            </div>
            <EditForum open={isOpenEdit} onOpenChange={setIsOpenEdit} onUpdate={fetchForum} forum={forum} />
        </div>
    );
}

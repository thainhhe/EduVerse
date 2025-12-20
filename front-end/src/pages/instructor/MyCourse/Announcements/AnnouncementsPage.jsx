import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, Eye, Pencil, Trash2, Bell } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AnnouncementDialog } from "./AnnouncementForm";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/context/CourseProvider";
import notificationService from "@/services/notificationService";
import { format } from "date-fns";

const AnnouncementsPage = () => {
    const { user } = useAuth();
    const { courseId } = useCourse();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("add");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?._id || !courseId) return;
            try {
                setLoading(true);
                // Fetch all notifications for the user
                const res = await notificationService.getByReceiverId(user._id);
                if (res.success || res.status === 200) {
                    const allNotifications = res.data.notifications || [];

                    // Filter notifications related to this course
                    // Assuming the link format is /course/{courseId} or similar
                    const courseNotifications = allNotifications.filter(
                        (n) => (n?.link && n?.link.includes(courseId)) || allNotifications
                    );

                    setAnnouncements(courseNotifications);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user, courseId]);

    const handleAdd = () => {
        setDialogMode("add");
        setSelectedAnnouncement(null);
        setOpenDialog(true);
    };

    const handleEdit = (announcement) => {
        // System notifications might not be editable in the same way,
        // but for now we'll keep the handler or disable it for system types.
        if (announcement.type === "system") return;
        setDialogMode("edit");
        setSelectedAnnouncement(announcement);
        setOpenDialog(true);
    };

    const handleSubmit = (data) => {
        if (dialogMode === "add") {
            console.log("Adding new announcement:", data);
            // TODO: Implement create announcement backend
        } else {
            console.log("Updating announcement:", data);
            // TODO: Implement update announcement backend
        }
    };

    return (
        <div className="mx-auto max-w-full">
            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <div className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded bg-indigo-500" />
                            Announcements & Notifications
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 mt-5 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4 font-bold">
                            <ChevronDown className="h-7 w-7 text-muted-foreground" />
                            Course Notifications ({announcements.length})
                        </div>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Type</TableHead>
                                        {/* <TableHead>Actions</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.length > 0 ? (
                                        announcements.map((announcement) => (
                                            <TableRow key={announcement._id}>
                                                <TableCell>
                                                    {announcement.createdAt
                                                        ? format(
                                                              new Date(announcement.createdAt),
                                                              "yyyy-MM-dd"
                                                          )
                                                        : "-"}
                                                </TableCell>
                                                <TableCell className="text-indigo-600 font-medium flex items-center gap-2">
                                                    {announcement.title}
                                                </TableCell>
                                                <TableCell>{announcement.message}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            announcement.type === "error"
                                                                ? "bg-red-100 text-red-700"
                                                                : announcement.type === "success"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {announcement.type || "Info"}
                                                    </span>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:text-foreground"
                                                        onClick={() => handleEdit(announcement)}
                                                        disabled
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TableCell> */}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                                No notifications found for this course.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnnouncementsPage;

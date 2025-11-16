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
import { ChevronDown, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { AnnouncementDialog } from "./AnnouncementForm";

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            date: "2024-10-10",
            title: "Live Q&A Session Tomorrow!",
            message: "Message 1",
        },
        {
            id: 2,
            date: "2024-10-08",
            title: "Assignment",
            message: "Message 2",
        },
        {
            id: 3,
            date: "2024-10-05",
            title: "New Module Released",
            message: "Message 3",
        },
        {
            id: 4,
            date: "2024-10-01",
            title: "Course Introduction",
            message: "Message 4",
        },
    ]);

    const [pastAnnouncements, setPastAnnouncements] = useState([
        {
            id: 1,
            date: "2024-10-08",
            title: "Welcome to the Course!",
            message: "Message 1",
        },
        {
            id: 2,
            date: "2024-10-08",
            title: "Course Registration Closing Soon",
            message: "Message 2",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("add");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const handleAdd = () => {
        setDialogMode("add");
        setSelectedAnnouncement(null);
        setOpenDialog(true);
    };

    const handleEdit = (announcement) => {
        setDialogMode("edit");
        setSelectedAnnouncement(announcement);
        setOpenDialog(true);
    };

    const handleSubmit = (data) => {
        if (dialogMode === "add") {
            console.log("Adding new announcement:", data);
        } else {
            console.log("Updating announcement:", data);
        }
    };

    return (
        <div className="mx-auto max-w-full">
            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <div className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded bg-indigo-500" />
                            Announcements
                        </div>
                        <Button onClick={handleAdd} className="bg-indigo-600">
                            + Announcement
                        </Button>
                        <AnnouncementDialog
                            open={openDialog}
                            onOpenChange={setOpenDialog}
                            mode={dialogMode}
                            initialData={selectedAnnouncement}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 border rounded-xl p-4 shadow-sm bg-white mt-5">
                        <div className="flex items-center gap-2 mb-4 font-bold">
                            <ChevronDown className="h-7 w-7 text-muted-foreground" />
                            Current Announcements (4)
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message Summary</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.map((announcement) => (
                                    <TableRow key={announcement.id}>
                                        <TableCell>{announcement.date}</TableCell>
                                        <TableCell className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-2">
                                            <i className="bi bi-megaphone"></i> {announcement.title}
                                        </TableCell>
                                        <TableCell>{announcement.message}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8  hover:text-foreground"
                                                onClick={() => handleEdit(announcement)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8  hover:text-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mb-6 border rounded-xl p-4 shadow-sm bg-white mt-5">
                        <div className="flex items-center gap-2 mt-10 mb-4 font-bold">
                            <ChevronDown className="h-7 w-7 text-muted-foreground" />
                            Past Announcements ({pastAnnouncements.length})
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message Summary</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastAnnouncements.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-2">
                                            <i className="bi bi-megaphone"></i> {item.title}
                                        </TableCell>
                                        <TableCell>{item.message}</TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-8 flex items-center justify-between mx-5 my-2">
                        <Button variant="ghost" className="gap-2 bg-gray-100">
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            Back
                        </Button>
                        <Button variant="ghost" className="gap-2 text-indigo-600 bg-gray-100">
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnnouncementsPage;

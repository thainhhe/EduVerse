import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { updateLesson } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";

export function EditLesson({ open, onOpenChange, lesson, onUpdate }) {
    const [lessonTitle, setLessonTitle] = useState("");
    const [contentGroup, setContentGroup] = useState("");

    useEffect(() => {
        if (!open) return;
        if (lesson) {
            setLessonTitle(lesson.title || "");
            setContentGroup(lesson.content || "");
        }
    }, [lesson]);

    const handleSave = async () => {
        try {
            const payload = {
                moduleId: lesson.moduleId,
                title: lessonTitle?.trim(),
                content: contentGroup?.trim(),
                status: lesson.status,
                order: lesson.order,
            };
            Object.keys(payload).forEach((k) => {
                if (payload[k] === "" || payload[k] === undefined) delete payload[k];
            });
            const res = await updateLesson(lesson.id, payload);
            if (res.success) {
                ToastHelper.success("Update lesson successfully");
                setLessonTitle("");
                setContentGroup("");
                onOpenChange(false);
                if (typeof onUpdate === "function") onUpdate();
            } else {
                ToastHelper.error("Update lesson failed");
            }
        } catch (err) {
            console.error("Update lesson failed:", err.response?.status, err.response?.data ?? err.message);
            ToastHelper.error("Update lesson failed");
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Lesson</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Update lesson for your course, including its title and detailed content.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Lesson Title */}
                    <div className="space-y-2">
                        <Label htmlFor="lesson-title" className="text-sm font-medium">
                            Lesson Title
                        </Label>
                        <Input
                            id="lesson-title"
                            placeholder="Introduction to Course Creation"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Content Group */}
                    <div className="space-y-2">
                        <Label htmlFor="content-group" className="text-sm font-medium">
                            Content
                        </Label>
                        <textarea
                            id="content-group"
                            placeholder="Enter content group"
                            value={contentGroup}
                            onChange={(e) => setContentGroup(e.target.value)}
                            className="min-h-[170px] resize-y !w-full !block whitespace-pre-wrap break-all p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCancel} className="border-border bg-transparent">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Save Lesson
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

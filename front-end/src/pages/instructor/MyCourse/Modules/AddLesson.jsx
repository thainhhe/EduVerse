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
// import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createLesson } from "@/services/courseService";
import { Textarea } from "@/components/ui/textarea";

export function AddLessonModal({ open, onOpenChange, moduleId, moduleLessonsCount = 0, onCreated }) {
    const [lessonTitle, setLessonTitle] = useState("");
    const [contentGroup, setContentGroup] = useState("");
    // const [description, setDescription] = useState("");
    const [quiz, setQuiz] = useState(""); // nếu có selector quiz, giữ state ở đây

    const handleSave = async () => {
        if (!moduleId) {
            console.error("Missing moduleId - cannot create lesson");
            return;
        }
        try {
            const payload = {
                title: lessonTitle?.trim(),
                // description: description?.trim(),
                content: contentGroup?.trim(),
                moduleId,
                order: (moduleLessonsCount || 0) + 1,
            };

            // xử lý trường quiz: nếu có nhưng là chuỗi rỗng -> gửi null
            if (typeof quiz !== "undefined") {
                payload.quiz = quiz === "" ? null : quiz;
            }

            // xóa các key rỗng/undefined
            Object.keys(payload).forEach((k) => {
                if (payload[k] === "" || payload[k] === undefined) delete payload[k];
            });

            const res = await createLesson(payload);
            console.log("Create lesson response:", res?.data ?? res);
            // reset + close + notify parent
            setLessonTitle("");
            setContentGroup("");
            // setDescription("");
            setQuiz("");
            onOpenChange(false);
            if (typeof onCreated === "function") onCreated();
        } catch (err) {
            console.error("Create lesson failed:", err.response?.status, err.response?.data ?? err.message);
            alert("Create lesson failed. Kiểm tra console/server logs.");
        }
    };

    const handleCancel = () => {
        // Reset form
        setLessonTitle("");
        setContentGroup("");
        // setDescription("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Lesson</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Define a new lesson for your course, including its title and detailed content.
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
                        <Textarea
                            id="content-group"
                            placeholder="Enter content group"
                            value={contentGroup}
                            onChange={(e) => setContentGroup(e.target.value)}
                            className="w-full min-h-[170px] resize-y"
                        />
                    </div>

                    {/* Description */}
                    {/* <div className="space-y-2">
            <Label htmlFor="lesson-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="lesson-description"
              placeholder="Provide a detailed description of the lesson content, learning objectives, and activities."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div> */}
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

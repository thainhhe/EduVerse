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

export function AddLessonModal({
  open,
  onOpenChange,
  moduleId,
  moduleLessonsCount = 0,
  onCreated,
}) {
  const [lessonTitle, setLessonTitle] = useState("");
  const [contentGroup, setContentGroup] = useState("");
  const [quiz, setQuiz] = useState("");
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    setErrors({});

    if (!lessonTitle || !lessonTitle.trim()) {
      setErrors({ lessonTitle: "Lesson title is required." });
      document.getElementById("lesson-title")?.focus();
      return;
    }

    if (!moduleId) {
      console.error("Missing moduleId - cannot create lesson");
      return;
    }
    try {
      const payload = {
        title: lessonTitle?.trim(),
        content: contentGroup?.trim(),
        moduleId,
        order: (moduleLessonsCount || 0) + 1,
      };

      if (typeof quiz !== "undefined") {
        payload.quiz = quiz === "" ? null : quiz;
      }

      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) delete payload[k];
      });

      const res = await createLesson(payload);
      console.log("Create lesson response:", res?.data ?? res);
      // reset + close + notify parent
      setLessonTitle("");
      setContentGroup("");
      setQuiz("");
      onOpenChange(false);
      if (typeof onCreated === "function") onCreated();
    } catch (err) {
      console.error(
        "Create lesson failed:",
        err.response?.status,
        err.response?.data ?? err.message
      );
      // show inline general error instead of browser alert
      setErrors({
        general: "Create lesson failed. Check console/server logs.",
      });
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
          <DialogTitle className="text-xl font-semibold">
            Add New Lesson
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define a new lesson for your course, including its title and
            detailed content.
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
              onChange={(e) => {
                setLessonTitle(e.target.value);
                if (errors.lessonTitle)
                  setErrors((p) => ({ ...p, lessonTitle: undefined }));
              }}
              className={`w-full ${
                errors.lessonTitle ? "border-red-500 ring-1 ring-red-300" : ""
              }`}
            />
            {errors.lessonTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.lessonTitle}</p>
            )}
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
        </div>

        {/* show general/server error above footer so it's visible without scrolling */}
        {errors.general && (
          <div className="text-sm text-red-600 mt-2 px-1">{errors.general}</div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-border bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { useState } from "react";
import { createLesson } from "@/services/courseService";
import { Textarea } from "@/components/ui/textarea";
import { ToastHelper } from "@/helper/ToastHelper";

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

  // Normalize lesson title: trim and collapse multiple spaces
  const normalizeLessonTitle = () => {
    const normalized = lessonTitle.trim().replace(/\s+/g, " ");
    if (normalized !== lessonTitle) {
      setLessonTitle(normalized);
    }
  };

  // Normalize content: trim and collapse multiple spaces
  const normalizeContent = () => {
    const normalized = contentGroup.trim().replace(/\s+/g, " ");
    if (normalized !== contentGroup) {
      setContentGroup(normalized);
    }
  };

  const handleSave = async () => {
    // Normalize before validation
    const normalized = lessonTitle.trim().replace(/\s+/g, " ");
    if (normalized !== lessonTitle) {
      setLessonTitle(normalized);
    }

    const normalizedContent = contentGroup.trim().replace(/\s+/g, " ");
    if (normalizedContent !== contentGroup) {
      setContentGroup(normalizedContent);
    }

    if (!moduleId) {
      setErrors({ moduleId: "Module ID is required." });
      return;
    }

    const newErrors = {};

    const trimmedTitle = normalized || lessonTitle.trim();
    if (!trimmedTitle) newErrors.lessonTitle = "Title is required";
    else if (trimmedTitle.length < 3)
      newErrors.lessonTitle = "Title must be at least 3 characters";
    else if (trimmedTitle.length > 200)
      newErrors.lessonTitle = "Title must be at most 200 characters";

    const trimmedContent = normalizedContent || contentGroup.trim();
    if (!trimmedContent) newErrors.contentGroup = "Content is required";
    else if (trimmedContent.length < 10)
      newErrors.contentGroup = "Content must be at least 10 characters";
    else if (trimmedContent.length > 5000)
      newErrors.contentGroup = "Content must be at most 5000 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        title: normalized,
        content: normalizedContent,
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
      if (res.success) {
        ToastHelper.success("Lesson created successfully");
        setLessonTitle("");
        setContentGroup("");
        setQuiz("");
        onOpenChange(false);
        if (typeof onCreated === "function") onCreated();
      } else {
        ToastHelper.error("Create lesson failed");
      }
    } catch (err) {
      console.error(
        "Create lesson failed:",
        err.response?.status,
        err.response?.data ?? err.message
      );
      ToastHelper.error("Create lesson failed");
    }
  };

  const handleCancel = () => {
    setLessonTitle("");
    setContentGroup("");
    setQuiz("");
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
              Lesson Title <span className="text-red-500">*</span>
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
              onBlur={normalizeLessonTitle}
              className={`w-full ${
                errors.lessonTitle ? "border-red-500 ring-1 ring-red-300" : ""
              }`}
            />

            {errors.lessonTitle && (
              <p className="text-red-600 text-sm mt-1">{errors.lessonTitle}</p>
            )}
          </div>

          {/* Content Group */}
          <div className="space-y-2">
            <Label htmlFor="content-group" className="text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content-group"
              placeholder="Enter content group"
              value={contentGroup}
              onChange={(e) => setContentGroup(e.target.value)}
              onBlur={normalizeContent}
              className={`w-full min-h-[170px] resize-y ${
                errors.contentGroup ? "border-red-500 ring-1 ring-red-300" : ""
              }`}
            />
          </div>
          {errors.contentGroup && (
            <p className="text-sm text-red-600">{errors.contentGroup}</p>
          )}
        </div>

        {/* show general/server error above footer so it's visible without scrolling */}

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

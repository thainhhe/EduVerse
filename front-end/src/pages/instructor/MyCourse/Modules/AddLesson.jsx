

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"


export function AddLessonModal({ open, onOpenChange, moduleId }) {
    const [lessonTitle, setLessonTitle] = useState("")
    const [contentGroup, setContentGroup] = useState("")
    const [description, setDescription] = useState("")

    const handleSave = () => {
        // Handle save logic here
        console.log({
            moduleId,
            lessonTitle,
            contentGroup,
            description,
        })
        // Reset form
        setLessonTitle("")
        setContentGroup("")
        setDescription("")
        onOpenChange(false)
    }

    const handleCancel = () => {
        // Reset form
        setLessonTitle("")
        setContentGroup("")
        setDescription("")
        onOpenChange(false)
    }

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
                            Content Group
                        </Label>
                        <Input
                            id="content-group"
                            placeholder="Enter content group"
                            value={contentGroup}
                            onChange={(e) => setContentGroup(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
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
    )
}

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
import { updateForum } from "@/services/forumService";
import { Textarea } from "@/components/ui/textarea";

export function EditForum({ open, onOpenChange, forum, onUpdate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
    };

    // Load data khi mở dialog hoặc khi forum thay đổi
    useEffect(() => {
        if (open && forum) {
            setTitle(forum.title || "");
            setDescription(forum.description || "");
        }
    }, [open, forum]);

    const handleSave = async () => {
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
            };

            console.log("payload", payload);
            const res = await updateForum(forum._id, payload);
            console.log("Update forum response:", res?.data ?? res);

            resetForm();

            // Notify parent BEFORE closing
            if (typeof onUpdate === "function") onUpdate();

            onOpenChange(false);
        } catch (err) {
            console.error("Update forum failed:", err);
            alert("Update forum failed. Kiểm tra console/server logs.");
        }
    };

    const handleCancel = () => {
        resetForm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Forum</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Update forum information including title and description.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="forum-title">Title</Label>
                        <Input
                            id="forum-title"
                            placeholder="Enter forum title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter forum description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[170px]"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UploadZone from "@/components/minio/UploadZone";

const UploadVideoModal = ({ open, onOpenChange, lessonId, onUploaded }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accessLevel, setAccessLevel] = useState("public");

    console.log(" lessonId: ", lessonId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-full p-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-500" />
                        Upload Video
                    </h2>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="Enter video title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            className="w-full border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows="3"
                            placeholder="Enter description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Access level */}
                    <div className="space-y-2">
                        <Label>Access Level</Label>
                        <Select value={accessLevel} onValueChange={setAccessLevel}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Upload area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                        <UploadZone
                            data={{ title, description, accessLevel, lessonId, uploadedBy: user._id }}
                            type="video"
                            onUploadSuccess={onUploaded}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UploadVideoModal;

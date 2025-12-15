import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UploadZone from "@/components/minio/UploadZone";
import { Button } from "@/components/ui/button";

const UploadMaterialModal = ({ open, lessonId, onUploaded, onOpenChange }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accessLevel, setAccessLevel] = useState("public");

    useEffect(() => {
        setTitle("");
        setDescription("");
        setAccessLevel("public");
    }, [open]);

    return (
        <div className={`mt-2 overflow-y-auto ${open ? "block" : "hidden"}`}>
            <div className="max-w-full p-4 border border-gray-300 rounded-sm">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">Upload Material</h2>
                        <Button variant="outline" onClick={onOpenChange} className="ml-auto">
                            Close
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="Enter material title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
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
                    <UploadZone
                        data={{ title, description, accessLevel, lessonId, uploadedBy: user._id }}
                        onUploadSuccess={onUploaded}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadMaterialModal;

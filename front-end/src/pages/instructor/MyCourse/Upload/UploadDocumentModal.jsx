import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { ToastHelper } from "@/helper/ToastHelper";

const UploadDocumentModal = ({ open, onOpenChange, lessonId, onUploaded }) => {
  console.log(" lessonId: ", lessonId);

  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] = useState("public");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setMessage("⚠️ Please select a file and enter title.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("Uploading...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "document");
      formData.append("title", title);
      formData.append("description", description || "No description");
      formData.append("uploadedBy", user?._id);
      formData.append("accessLevel", accessLevel);
      if (lessonId) formData.append("lessonId", lessonId);

      const res = await api.post("/material", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0,
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setMessage(`📤 Uploading: ${percent}%`);
          }
        },
      });

      if (res.success) {
        setMessage("✅ Upload successful!");
        ToastHelper.success("Upload document successful!");
        if (onUploaded) onUploaded(res.data);
        setTimeout(() => onOpenChange(false), 1000);
      } else {
        ToastHelper.error(res.message || "❌ Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      ToastHelper.error(error.message || "❌ Error uploading document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            Upload Document
          </h2>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Enter document title"
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
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="font-medium mt-2">Choose a document file</p>
            <p className="text-sm text-gray-500 mb-2">
              Supported formats: PDF, Word(doc, docx).
            </p>
            <label className="text-indigo-600 cursor-pointer hover:underline">
              Browse files
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {selectedFile && (
              <p className="mt-3 text-sm text-green-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Status message */}
          {message && (
            <p
              className={`text-sm ${
                message.includes("✅")
                  ? "text-green-600"
                  : message.includes("❌")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;

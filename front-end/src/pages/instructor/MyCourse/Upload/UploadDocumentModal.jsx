import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import React, { useState } from "react";

const UploadDocumentModal = ({ open, onOpenChange }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = () => {
        console.log("Uploading document:", selectedFile);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <div className="border rounded-xl p-4 bg-white">
                    <div className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-600 rounded" />
                        Upload file
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50">
                        <Upload className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="font-medium mt-2">Upload file</p>
                        <p className="text-sm text-gray-500">Supported format: Word, Excel, PDF...</p>
                        <p className="my-2 text-sm text-gray-500">OR</p>
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

                    <div className="flex justify-end mt-4">
                        <Button onClick={handleUpload} disabled={!selectedFile}>
                            Upload
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UploadDocumentModal;

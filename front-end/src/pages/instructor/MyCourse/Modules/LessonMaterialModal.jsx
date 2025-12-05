import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import VideoPlayer from "@/components/minio/VideoPlayer";
import DocumentViewer from "@/components/minio/DocumentViewer";
import { getFilesByLessonId } from "@/services/minio";
import FileList from "@/components/minio/FileList";
import { X } from "lucide-react";

const LessonMaterialModal = ({ open, onOpenChange, lessonId, canUpdate = true }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const loadFilesByLessonId = async () => {
        try {
            setLoading(true);
            const data = await getFilesByLessonId(lessonId);
            console.log("data file:", data);
            setFiles(data);
        } catch (error) {
            console.error("Error loading files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && lessonId) {
            loadFilesByLessonId();
        } else {
            setFiles([]);
        }
    }, [lessonId, open]);

    const handleFileDeleted = (fileId) => {
        setFiles(files.filter((f) => f._id !== fileId));
    };

    const handleFileClick = (file) => {
        console.log("file click:", file);
        if (file.fileType === "video") {
            setSelectedVideo(file);
        } else if (file.fileType === "document") {
            setSelectedDocument(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-9/12 p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Lesson Materials</DialogTitle>
                </DialogHeader>
                <div className="app">
                    <main className="main-content">
                        <section className="files-section">
                            <h2 className="section-title">
                                Your Files <span className="file-count">({files.length})</span>
                            </h2>
                            {loading ? (
                                <div className="loading">Loading files...</div>
                            ) : (
                                <FileList
                                    files={files}
                                    onFileClick={handleFileClick}
                                    onFileDeleted={handleFileDeleted}
                                    canUpdate={canUpdate}
                                />
                            )}
                        </section>
                    </main>
                    {selectedVideo && (
                        <div className="mt-6 border rounded-lg overflow-hidden bg-black shadow-lg">
                            <div className="flex items-center justify-between p-3 bg-gray-900 text-white border-b border-gray-800">
                                <span className="text-sm font-medium truncate">
                                    {selectedVideo.originalName}
                                </span>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative w-full h-[500px] max-h-[500px]">
                                <VideoPlayer
                                    file={selectedVideo}
                                    onClose={() => setSelectedVideo(null)}
                                    canClose={false}
                                />
                            </div>
                        </div>
                    )}

                    {selectedDocument && (
                        <div className="mt-6 border rounded-lg overflow-y-auto max-h-[500px] bg-white shadow-lg">
                            <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                                <span className="text-sm font-medium text-gray-700 truncate">
                                    {selectedDocument.originalName}
                                </span>
                                <button
                                    onClick={() => setSelectedDocument(null)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
                                >
                                    Close Preview
                                </button>
                            </div>
                            <div className="h-[500px] w-full bg-gray-100">
                                <DocumentViewer
                                    file={selectedDocument}
                                    onClose={() => setSelectedDocument(null)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LessonMaterialModal;

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ImageIcon,
    Send,
    ChevronLeft,
    ChevronRight,
    FileText,
    MessageSquare,
    Info,
    Download,
    Eye,
} from "lucide-react";
import { getFilesByLessonId } from "@/services/minio";
import VideoPlayer from "@/components/minio/VideoPlayer";
import DocumentViewer from "@/components/minio/DocumentViewer";

const LessonContent = ({ lesson, course }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [videoIndex, setVideoIndex] = useState(0);

    const loadFilesByLessonId = async () => {
        try {
            setLoading(true);
            const data = await getFilesByLessonId(lesson._id);
            setFiles(data);
        } catch (error) {
            console.error("Error loading files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lesson._id) {
            loadFilesByLessonId();
            setVideoIndex(0); // Reset video index when lesson changes
            setSelectedDocument(null); // Reset selected document
        } else {
            setFiles([]);
        }
    }, [lesson._id]);

    const lessonVideos = files.filter((m) => m.fileType === "video" && m.lessonId === lesson._id);
    const lessonDocuments = files.filter((m) => m.fileType === "document" && m.lessonId === lesson._id);

    const handleNext = () => {
        setVideoIndex((prev) => (prev < lessonVideos.length - 1 ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setVideoIndex((prev) => (prev > 0 ? prev - 1 : lessonVideos.length - 1));
    };

    const handleFileClick = (file) => {
        if (file.fileType === "document") {
            setSelectedDocument(file);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12 min-h-screen">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                    <Info size={16} />
                    {course?.title} &bull; {lesson.type || "Lesson"}
                </p>
            </div>

            {/* Video Player Section */}
            {lessonVideos.length > 0 ? (
                <div className="mb-8 rounded-lg bg-gray-100 overflow-hidden">
                    <div className="aspect-video w-full relative group">
                        <div className="absolute inset-0">
                            <VideoPlayer
                                key={lessonVideos[videoIndex]._id}
                                file={lessonVideos[videoIndex]}
                                onClose={() => {}}
                                canClose={false}
                            />
                        </div>
                    </div>

                    {lessonVideos.length > 1 && (
                        <div className="p-4 flex items-center justify-between border-t border-gray-800">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrev}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                                disabled={lessonVideos.length <= 1}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Previous Video
                            </Button>

                            <span className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                Video {videoIndex + 1} of {lessonVideos.length}
                            </span>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNext}
                                className="text-gray-400 hover:text-white hover:bg-gray-800"
                                disabled={lessonVideos.length <= 1}
                            >
                                Next Video <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mb-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <FileText className="h-full w-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No video content</h3>
                    <p className="mt-1 text-gray-500">
                        This lesson focuses on reading materials and exercises.
                    </p>
                </div>
            )}

            {/* Content Tabs */}
            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 h-auto rounded-none mb-6">
                    <TabsTrigger
                        value="summary"
                        className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="resources"
                        className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Resources ({lessonDocuments.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="discussion"
                        className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Discussion
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this lesson</h3>
                        <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
                            {lesson.content ? (
                                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                            ) : (
                                <p className="italic text-gray-400">
                                    No description available for this lesson.
                                </p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                        {selectedDocument ? (
                            <div className="flex flex-col h-[600px]">
                                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-indigo-600" />
                                        <span className="font-medium text-gray-700">
                                            {selectedDocument.originalName}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedDocument(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Close Viewer
                                    </Button>
                                </div>
                                <div className="flex-1 bg-gray-100">
                                    <DocumentViewer
                                        file={selectedDocument}
                                        onClose={() => setSelectedDocument(null)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                {lessonDocuments.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {lessonDocuments.map((doc) => (
                                            <div
                                                key={doc._id}
                                                onClick={() => handleFileClick(doc)}
                                                className="group relative flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
                                            >
                                                <div className="flex-shrink-0 p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                        {doc.originalName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(doc.size / 1024 / 1024).toFixed(2)} MB &bull;{" "}
                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 group-hover:underline">
                                                            <Eye className="h-3 w-3" /> Preview
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                            <FileText className="h-full w-full" />
                                        </div>
                                        <p className="text-gray-500">No resources attached to this lesson.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* <TabsContent value="discussion" className="mt-0 animate-in fade-in-50 duration-300">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-4 mb-8">
                            <Avatar className="h-10 w-10 border border-gray-200">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-medium">
                                    ME
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="relative">
                                    <textarea
                                        className="w-full min-h-[100px] p-4 pr-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all text-sm"
                                        placeholder="Ask a question or share your thoughts..."
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                        Post Comment <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="text-center py-12 border-t border-gray-100">
                            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                <MessageSquare className="h-full w-full" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900">No comments yet</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Be the first to start the discussion!
                            </p>
                        </div>
                    </div>
                </TabsContent> */}
            </Tabs>
        </div>
    );
};

export default LessonContent;

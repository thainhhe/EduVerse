import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ChevronDown,
    Circle,
    CheckCircle2,
    PlayCircle,
    FileText,
    HelpCircle,
    Clock,
    User,
    ArrowLeft,
    Check,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { approveCourse, getAllCourseById, rejectCourse } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import { getFilesByLessonId } from "@/services/minio";
import VideoPlayer from "@/components/minio/VideoPlayer";
import DocumentViewer from "@/components/minio/DocumentViewer";

const CourseDetailPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [files, setFiles] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [videoIndex, setVideoIndex] = useState(0);
    const [selectedDocument, setSelectedDocument] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            const res = await getAllCourseById(id);
            if (res?.success) {
                const data = res.data || {};
                setCourse(data);
                // Select the first module's first lesson by default if available, or the course info
                if (data.modules?.[0]?.lessons?.[0]) {
                    handleSelectItem(data.modules[0].lessons[0], "lesson");
                } else {
                    setSelectedItem({ ...data, type: "course_info" });
                }
            }
            setLoading(false);
        };
        fetchCourses();
    }, [id]);

    const loadFilesByLessonId = async (lessonId) => {
        try {
            const data = await getFilesByLessonId(lessonId);
            setFiles(data);
        } catch (error) {
            console.error("Error loading files:", error);
            setFiles([]);
        }
    };

    const handleSelectItem = (item, type) => {
        if (type === "lesson") {
            loadFilesByLessonId(item._id);
            setVideoIndex(0);
            setSelectedDocument(null);
        } else {
            setFiles([]);
        }
        setSelectedItem({ ...item, type });
    };

    const handleApprove = async () => {
        const res = await approveCourse(id);
        if (res?.success) {
            ToastHelper.success("✅ Khóa học đã được duyệt!");
            setCourse((prev) => ({ ...prev, status: "approve" }));
        } else {
            ToastHelper.error("❌ Duyệt thất bại!");
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            ToastHelper.warning("Vui lòng nhập lý do từ chối!");
            return;
        }
        const res = await rejectCourse(id, rejectReason);
        if (res?.success) {
            ToastHelper.success("⚠ Khóa học đã bị từ chối!");
            setCourse((prev) => ({ ...prev, status: "reject" }));
            setShowRejectModal(false);
            setRejectReason("");
        } else {
            ToastHelper.error("❌ Từ chối thất bại!");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approve":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        Approved
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
                        Pending
                    </Badge>
                );
            case "reject":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const lessonVideos = files.filter((m) => m.fileType === "video" && m.lessonId === selectedItem?._id);
    const lessonDocuments = files.filter(
        (m) => m.fileType === "document" && m.lessonId === selectedItem?._id
    );

    const handleNextVideo = () => {
        setVideoIndex((prev) => (prev < lessonVideos.length - 1 ? prev + 1 : 0));
    };

    const handlePrevVideo = () => {
        setVideoIndex((prev) => (prev > 0 ? prev - 1 : lessonVideos.length - 1));
    };

    const handleFileClick = (file) => {
        if (file.fileType === "document") {
            setSelectedDocument(file);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!course) {
        return <div className="flex items-center justify-center min-h-screen">Course not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="max-w-[1600px] mx-auto mb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/admin/courses" className=" py-2 px-4 border rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" /> {course?.main_instructor?.username}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />{" "}
                                    {new Date(course.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                                <span>•</span>
                                {getStatusBadge(course.status)}
                                {course.status === "reject" && (
                                    <span className="text-red-500">({course.reasonReject})</span>
                                )}
                                <span>•</span>
                                {course.isDeleted ? (
                                    <span className="text-red-500">Deleted</span>
                                ) : (
                                    <span className="text-green-500">Active</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {course.status === "pending" && (
                            <>
                                <ConfirmationHelper
                                    trigger={
                                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                            <Check className="w-4 h-4" /> Approve
                                        </Button>
                                    }
                                    title="Approve Course"
                                    description="Are you sure you want to approve this course?"
                                    confirmText="Approve"
                                    onConfirm={handleApprove}
                                />
                                <Button
                                    variant="destructive"
                                    className="gap-2"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <X className="w-4 h-4" /> Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                {/* LEFT - Content Preview */}
                <Card className="lg:col-span-2 flex flex-col h-full border-none shadow-sm overflow-hidden">
                    <Tabs defaultValue="info" className="flex flex-col h-full">
                        <CardHeader className="border-b bg-white px-6 py-3">
                            <TabsList className="w-full justify-start border-b-0 bg-transparent p-0 h-auto">
                                <TabsTrigger
                                    value="info"
                                    className="px-6 py-2 rounded-t-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Info
                                </TabsTrigger>
                                <TabsTrigger
                                    value="content"
                                    className="px-6 py-2 rounded-t-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Content
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        {/* Info Tab */}
                        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 bg-white m-0">
                            <div className="space-y-6">
                                {/* Thumbnail */}
                                {course.thumbnail && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                                        {course.description || "No description available."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {course.price?.toLocaleString("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            })}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {course.category?.name || "Uncategorized"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {course?.duration?.value || "N/A"}{" "}
                                            {course?.duration?.unit || "N/A"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Instructor</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {course?.main_instructor?.username || "N/A"}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Created At</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(course?.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Last update</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(course?.updatedAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Course Structure</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <span className="text-sm font-medium text-blue-900">
                                                Total Modules
                                            </span>
                                            <span className="text-lg font-bold text-blue-700">
                                                {course.modules?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium text-green-900">
                                                Total Lessons
                                            </span>
                                            <span className="text-lg font-bold text-green-700">
                                                {course.modules?.reduce(
                                                    (acc, m) => acc + (m.lessons?.length || 0),
                                                    0
                                                ) || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                            <span className="text-sm font-medium text-orange-900">
                                                Total Quizzes
                                            </span>
                                            <span className="text-lg font-bold text-orange-700">
                                                {(course.courseQuizzes?.length || 0) +
                                                    (course.modules?.reduce(
                                                        (acc, m) => acc + (m.moduleQuizzes?.length || 0),
                                                        0
                                                    ) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Content Tab */}
                        <TabsContent value="content" className="flex-1 overflow-y-auto p-6 bg-white m-0">
                            {!selectedItem || selectedItem?.type === "course_info" ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Select a lesson or quiz
                                    </h3>
                                    <p className="text-gray-500">
                                        Choose from the course structure on the right to view content
                                    </p>
                                </div>
                            ) : selectedItem?.type === "lesson" ? (
                                <div className="space-y-6">
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
                                                        onClick={handlePrevVideo}
                                                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                                                        disabled={lessonVideos.length <= 1}
                                                    >
                                                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                                        Video
                                                    </Button>

                                                    <span className="text-sm font-medium text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                                        Video {videoIndex + 1} of {lessonVideos.length}
                                                    </span>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleNextVideo}
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
                                            <h3 className="text-lg font-medium text-gray-900">
                                                No video content
                                            </h3>
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
                                        </TabsList>

                                        <TabsContent
                                            value="summary"
                                            className="mt-0 animate-in fade-in-50 duration-300"
                                        >
                                            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    About this lesson
                                                </h3>
                                                <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
                                                    {selectedItem.content ? (
                                                        <div className="whitespace-pre-wrap break-all">
                                                            {selectedItem.content}
                                                        </div>
                                                    ) : (
                                                        <p className="italic text-gray-400">
                                                            No description available for this lesson.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="resources"
                                            className="mt-0 animate-in fade-in-50 duration-300"
                                        >
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
                                                                                {(
                                                                                    doc.size /
                                                                                    1024 /
                                                                                    1024
                                                                                ).toFixed(2)}{" "}
                                                                                MB &bull;{" "}
                                                                                {new Date(
                                                                                    doc.createdAt
                                                                                ).toLocaleDateString()}
                                                                            </p>
                                                                            <div className="flex items-center gap-3 mt-3">
                                                                                <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 group-hover:underline">
                                                                                    <Eye className="h-3 w-3" />{" "}
                                                                                    Preview
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
                                                                <p className="text-gray-500">
                                                                    No resources attached to this lesson.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            ) : selectedItem?.type === "quiz" ? (
                                <div className="space-y-6">
                                    {selectedItem.questions?.length > 0 ? (
                                        selectedItem.questions.map((q, index) => (
                                            <Card key={index} className="border border-gray-200 shadow-none">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base font-medium">
                                                        Question {index + 1}: {q.questionText}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    {q.options?.map((option, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border border-gray-100"
                                                        >
                                                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white border text-sm font-medium text-gray-600 shadow-sm">
                                                                {String.fromCharCode(65 + i)}
                                                            </span>
                                                            <span className="text-gray-700">{option}</span>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No questions available in this quiz.
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* RIGHT - Course Structure */}
                <Card className="h-full border-none shadow-sm flex flex-col overflow-hidden">
                    <CardHeader className="border-b bg-white px-4 py-4">
                        <CardTitle className="text-lg">Course Structure</CardTitle>
                        <CardDescription>Modules, lessons, and quizzes</CardDescription>
                    </CardHeader>
                    <ScrollArea className="flex-1 bg-white">
                        <div className="p-4 space-y-4">
                            {/* Course Info Button */}
                            <button
                                onClick={() => setSelectedItem({ ...course, type: "course_info" })}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                    selectedItem?.type === "course_info"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                        : "hover:bg-gray-50 border border-transparent"
                                }`}
                            >
                                <div className="p-2 bg-white rounded-md shadow-sm">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="font-medium text-sm">General Information</span>
                            </button>

                            {/* Course Quizzes */}
                            {course.courseQuizzes?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                                        Course Quizzes
                                    </h4>
                                    {course.courseQuizzes.map((quiz) => (
                                        <button
                                            key={quiz._id}
                                            onClick={() => handleSelectItem(quiz, "quiz")}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                                                selectedItem?._id === quiz._id
                                                    ? "bg-orange-50 text-orange-700"
                                                    : "hover:bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            <HelpCircle className="w-4 h-4" />
                                            <span className="text-sm truncate">{quiz.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Modules Accordion */}
                            <Accordion
                                type="multiple"
                                defaultValue={course.modules?.map((m) => m._id)}
                                className="space-y-2"
                            >
                                {course.modules?.map((module, index) => (
                                    <AccordionItem
                                        key={module._id}
                                        value={module._id}
                                        className="border rounded-lg px-2"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-3">
                                            <div className="flex items-center gap-2 text-left">
                                                <span className="font-medium text-sm text-gray-900">
                                                    Module {index + 1}: {module.title}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-3 pt-1 space-y-1">
                                            {/* Module Description */}
                                            {module.description && (
                                                <div className="px-4 py-2 mb-2 text-sm text-gray-600 bg-gray-50/50 rounded-md border border-gray-100 whitespace-pre-wrap break-all">
                                                    {module.description}
                                                </div>
                                            )}

                                            {/* Lessons */}
                                            {module.lessons?.map((lesson) => (
                                                <button
                                                    key={lesson._id}
                                                    onClick={() => handleSelectItem(lesson, "lesson")}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left pl-4 ${
                                                        selectedItem?._id === lesson._id
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "hover:bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {lesson.type === "video" ? (
                                                        <PlayCircle className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <FileText className="w-3.5 h-3.5" />
                                                    )}
                                                    <span className="text-sm truncate">{lesson.title}</span>
                                                </button>
                                            ))}

                                            {/* Module Quizzes */}
                                            {module.moduleQuizzes?.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs text-gray-400 font-medium px-4 mb-1">
                                                        Quizzes
                                                    </p>
                                                    {module.moduleQuizzes.map((quiz) => (
                                                        <button
                                                            key={quiz._id}
                                                            onClick={() => handleSelectItem(quiz, "quiz")}
                                                            className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left pl-4 ${
                                                                selectedItem?._id === quiz._id
                                                                    ? "bg-orange-50 text-orange-700"
                                                                    : "hover:bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            <HelpCircle className="w-3.5 h-3.5" />
                                                            <span className="text-sm truncate">
                                                                {quiz.title}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Reject Course
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this course.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CourseDetailPage;

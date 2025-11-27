import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Edit,
    Ellipsis,
    FileText,
    Plus,
    Settings,
    BookOpen,
    FileQuestion,
    Trash2,
    Eye,
    TextAlignJustify,
    ScrollText,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AddModuleModal } from "./AddModule";
import { AddLessonModal } from "./AddLesson";
import QuizManager from "../Quiz/quiz-manager";
import {
    getModulesInCourse,
    getQuizzesByCourse,
    getQuizzesByModule,
    getQuizzesByLesson,
    deleteModule,
    deleteLesson,
} from "@/services/courseService";
import LessonMaterialModal from "./LessonMaterialModal";
import { EditLesson } from "./EditLesson";
import { EditModuleModal } from "./EditModule";
import { toast } from "react-toastify";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import UploadMaterialModal from "../Upload/UploadMaterialModal";

const ModulesPage = () => {
    const [expandedModules, setExpandedModules] = useState([]);
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
    const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [isQuizManagerOpen, setIsQuizManagerOpen] = useState(false);
    const [currentQuizContext, setCurrentQuizContext] = useState({
        courseId: null,
        moduleId: null,
        lessonId: null,
    });

    const [courseQuizCount, setCourseQuizCount] = useState(0);
    const [moduleQuizCounts, setModuleQuizCounts] = useState({});
    const [lessonQuizCounts, setLessonQuizCounts] = useState({});

    const [openModuleMenuId, setOpenModuleMenuId] = useState(null);
    const [openLessonMenuId, setOpenLessonMenuId] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    const [openMaterialModal, setOpenMaterialModal] = useState(null);

    const location = useLocation();
    const params = useParams();

    const getCourseIdFromQuery = () => {
        try {
            const qp = new URLSearchParams(location.search);
            return qp.get("courseId");
        } catch {
            return null;
        }
    };

    const storageCourseId = typeof window !== "undefined" ? sessionStorage.getItem("currentCourseId") : null;
    const sessionCourse =
        typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem("currentCourseData")) : null;

    const courseIdFromState =
        location?.state?.id ?? params?.id ?? getCourseIdFromQuery() ?? storageCourseId ?? null;

    useEffect(() => {
        if (courseIdFromState) {
            try {
                sessionStorage.setItem("currentCourseId", courseIdFromState);
            } catch (e) {
                // ignore
            }
        }
    }, [courseIdFromState]);

    useEffect(() => {
        if (!courseIdFromState) return;
        setCurrentQuizContext((prev) => ({ ...prev, courseId: courseIdFromState }));
        if (location?.state?.openQuiz) {
            setIsQuizManagerOpen(true);
        }
    }, [courseIdFromState, location?.state?.openQuiz]);

    useEffect(() => {
        const onDocClick = (e) => {
            setOpenModuleMenuId((prev) => {
                if (!prev) return prev;
                const el = document.getElementById(`module-menu-${prev}`);
                if (!el) return null;
                if (!el.contains(e.target)) return null;
                return prev;
            });
            setOpenLessonMenuId((prev) => {
                if (!prev) return prev;
                const el = document.getElementById(`lesson-menu-${prev}`);
                if (!el) return null;
                if (!el.contains(e.target)) return null;
                return prev;
            });
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const fetchQuizCounts = async (courseId, modulesList = []) => {
        if (!courseId) return;
        try {
            const courseRes = await getQuizzesByCourse(courseId);
            const normalizeArray = (res) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (Array.isArray(res.data?.data)) return res.data.data;
                if (Array.isArray(res.data?.items)) return res.data.items;
                return [];
            };
            const courseItems = normalizeArray(courseRes);
            setCourseQuizCount(Array.isArray(courseItems) ? courseItems.length : 0);

            const modulePromises = modulesList.map((m) =>
                getQuizzesByModule(m.id)
                    .then((r) => {
                        const items = normalizeArray(r);
                        return { id: m.id, count: Array.isArray(items) ? items.length : 0 };
                    })
                    .catch(() => ({ id: m.id, count: 0 }))
            );
            const moduleResults = await Promise.all(modulePromises);
            const mCounts = {};
            moduleResults.forEach((r) => (mCounts[r.id] = r.count));
            setModuleQuizCounts(mCounts);

            const lessonPromises = [];
            modulesList.forEach((m) => {
                (m.lessons || []).forEach((lesson) => {
                    lessonPromises.push(
                        getQuizzesByLesson(lesson.id)
                            .then((r) => {
                                const items = normalizeArray(r);
                                return { id: lesson.id, count: items.length };
                            })
                            .catch(() => ({ id: lesson.id, count: 0 }))
                    );
                });
            });
            if (lessonPromises.length) {
                const lessonResults = await Promise.all(lessonPromises);
                const lCounts = {};
                lessonResults.forEach((r) => (lCounts[r.id] = r.count));
                setLessonQuizCounts(lCounts);
            }
        } catch (err) {
            console.error("Failed to fetch quiz counts:", err);
        }
    };

    const [modules, setModules] = useState([]);

    const fetchModules = async (cid) => {
        if (!cid) return;
        try {
            const res = await getModulesInCourse(cid);
            const items = res?.data?.data ?? res?.data ?? [];
            const normalized = Array.isArray(items)
                ? items.map((m) => ({
                      id: m.id ?? m._id ?? m._id?.toString?.(),
                      name: m.title ?? m.name ?? "Untitled",
                      lessons: m.lessons ?? [],
                      ...m,
                  }))
                : [];
            setModules(normalized);
            await fetchQuizCounts(cid, normalized);
        } catch (err) {
            console.error("Failed to fetch modules:", err);
            setModules([]);
        }
    };

    useEffect(() => {
        const cid = courseIdFromState;
        if (cid) fetchModules(cid);
    }, [courseIdFromState]);

    const toggleModule = (id) => {
        setExpandedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleAddLesson = (moduleId) => {
        setSelectedModuleId(moduleId);
        setIsAddLessonOpen(true);
    };

    const toggleModuleMenu = (moduleId) => {
        setOpenModuleMenuId((prev) => (prev === moduleId ? null : moduleId));
        setOpenLessonMenuId(null);
    };

    const toggleLessonMenu = (lessonId) => {
        setOpenLessonMenuId((prev) => (prev === lessonId ? null : lessonId));
        setOpenModuleMenuId(null);
    };

    const handleDeleteModule = async (id) => {
        try {
            if (!id) return;
            const res = await deleteModule(id);
            if (res.success) {
                await fetchModules(courseIdFromState);
                toast.success("Đã xóa module!");
                setOpenModuleMenuId(null);
            }
        } catch (error) {
            console.log("Lỗi khi xóa", error);
            toast.error("Lỗi khi xóa!");
        }
    };

    const handleDeleteLesson = async (id) => {
        try {
            if (!id) return;
            const res = await deleteLesson(id);
            if (res.success) {
                await fetchModules(courseIdFromState);
                toast.success("Đã xóa lesson!");
                setOpenLessonMenuId(null);
            }
        } catch (error) {
            console.log("Lỗi khi xóa", error);
            toast.error("Lỗi khi xóa!");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">Course Management</span>
                                <span className="text-gray-300">/</span>
                                <span className="text-indigo-600 font-medium">Modules & Lessons</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {sessionCourse?.title || "Course Modules"}
                            </h1>
                            <p className="text-gray-600 text-sm max-w-2xl">
                                Organize and structure your course content into modules and lessons for better
                                learning experience.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                                onClick={() => {
                                    if (!courseIdFromState) return;
                                    setCurrentQuizContext({
                                        courseId: courseIdFromState,
                                        moduleId: null,
                                        lessonId: null,
                                    });
                                    setIsQuizManagerOpen(true);
                                }}
                            >
                                <FileQuestion className="w-4 h-4 mr-2" />
                                Manage Quizzes
                                <Badge
                                    variant="secondary"
                                    className="ml-2 bg-indigo-100 text-indigo-700 border-none"
                                >
                                    {courseQuizCount}
                                </Badge>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="max-w-7xl mx-auto">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {modules.length} {modules.length === 1 ? "module" : "modules"} in this
                                        course
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                                onClick={() => setIsAddModuleOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Module
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        {modules.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <BookOpen className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Get started by creating your first module to organize your course content.
                                </p>
                                <Button
                                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                                    onClick={() => setIsAddModuleOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Module
                                </Button>
                            </div>
                        ) : (
                            modules.map((module, moduleIndex) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <Card
                                        key={module.id}
                                        className={cn(
                                            "border-2 transition-all duration-300 ease-in-out relative",
                                            isExpanded
                                                ? "border-indigo-200 shadow-lg bg-gradient-to-br from-white to-indigo-50/30"
                                                : "border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md bg-white",
                                            openModuleMenuId === module.id && "z-50"
                                        )}
                                    >
                                        {/* Module Header */}
                                        <div
                                            className="flex items-center justify-between p-5 cursor-pointer group"
                                            onClick={() => toggleModule(module.id)}
                                        >
                                            <div className="flex gap-4 flex-1 min-w-0">
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-center w-12 h-12 transition-all duration-300",
                                                        isExpanded
                                                            ? "text-gradient-to-br from-indigo-500 to-indigo-600"
                                                            : "text-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-indigo-200"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "text-lg font-bold transition-colors",
                                                            isExpanded
                                                                ? "text-indigo-600"
                                                                : "text-gray-600 group-hover:text-indigo-600 hover:text-indigo-600"
                                                        )}
                                                    >
                                                        <TextAlignJustify />
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                                            {module.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {module.lessons.length > 0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                                                >
                                                                    {module.lessons.length} lessons
                                                                </Badge>
                                                            )}
                                                            {moduleQuizCounts[module.id] > 0 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                                                                >
                                                                    {moduleQuizCounts[module.id]} quizzes
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-1 break-all">
                                                        {module.description || "No description provided"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                {/* Module Actions Menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleModuleMenu(module.id);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                                                    >
                                                        <Ellipsis className="w-5 h-5" />
                                                    </button>

                                                    {openModuleMenuId === module.id && (
                                                        <div
                                                            id={`module-menu-${module.id}`}
                                                            className="absolute right-0 mt-2 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="relative group/edit">
                                                                <button
                                                                    className="p-2.5 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                                                                    onClick={() => {
                                                                        setSelectedModule(module);
                                                                        setIsEditModuleOpen(true);
                                                                        setOpenModuleMenuId(null);
                                                                    }}
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                </button>
                                                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/edit:opacity-100 group-hover/edit:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100] shadow-lg">
                                                                    Edit
                                                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                                                                </span>
                                                            </div>
                                                            <div className="relative group/add">
                                                                <button
                                                                    className="p-2.5 rounded-lg hover:bg-green-50 transition-all duration-200 hover:scale-110"
                                                                    onClick={() => {
                                                                        handleAddLesson(module.id);
                                                                        setOpenModuleMenuId(null);
                                                                    }}
                                                                >
                                                                    <Plus className="w-4 h-4 text-green-600" />
                                                                </button>
                                                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/add:opacity-100 group-hover/add:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100] shadow-lg">
                                                                    Add Lesson
                                                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                                                                </span>
                                                            </div>
                                                            <div className="relative group/quiz">
                                                                <button
                                                                    className="p-2.5 rounded-lg hover:bg-purple-50 transition-all duration-200 hover:scale-110"
                                                                    onClick={() => {
                                                                        setCurrentQuizContext({
                                                                            courseId:
                                                                                courseIdFromState ?? null,
                                                                            moduleId: module.id,
                                                                            lessonId: null,
                                                                        });
                                                                        setIsQuizManagerOpen(true);
                                                                        setOpenModuleMenuId(null);
                                                                    }}
                                                                >
                                                                    <FileQuestion className="w-4 h-4 text-purple-600" />
                                                                </button>
                                                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/quiz:opacity-100 group-hover/quiz:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100] shadow-lg">
                                                                    Quiz
                                                                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                                                                </span>
                                                            </div>
                                                            <ConfirmationHelper
                                                                trigger={
                                                                    <div className="relative group/delete">
                                                                        <button className="p-2.5 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110">
                                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100] shadow-lg">
                                                                            Delete
                                                                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                                                                        </span>
                                                                    </div>
                                                                }
                                                                title="Delete Module?"
                                                                description="This action cannot be undone. All lessons will also be deleted."
                                                                confirmText="Delete"
                                                                onConfirm={() =>
                                                                    handleDeleteModule(module.id)
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all duration-300",
                                                        isExpanded
                                                            ? "bg-indigo-100 text-indigo-600 rotate-180"
                                                            : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                                    )}
                                                >
                                                    <ChevronDown className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lessons List */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white p-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                                {module.lessons.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500 text-sm">
                                                        No lessons yet. Click "Add Lesson" to create one.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {module.lessons.map((lesson, lessonIndex) => (
                                                            <div
                                                                key={lesson.id}
                                                                className={cn(
                                                                    "group/lesson bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200 relative",
                                                                    openLessonMenuId === lesson.id && "z-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-semibold text-sm flex-shrink-0">
                                                                            <ScrollText />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <h4 className="font-semibold text-gray-900 truncate">
                                                                                    {lesson.title}
                                                                                </h4>
                                                                                {/* <Badge
                                                                                    variant={
                                                                                        lesson.status ===
                                                                                        "published"
                                                                                            ? "default"
                                                                                            : "secondary"
                                                                                    }
                                                                                    className={cn(
                                                                                        "text-xs",
                                                                                        lesson.status ===
                                                                                            "published"
                                                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                                            : "bg-gray-100 text-gray-600"
                                                                                    )}
                                                                                >
                                                                                    {lesson.status}
                                                                                </Badge> */}
                                                                                <span className="text-xs text-gray-500">
                                                                                    {lessonQuizCounts[
                                                                                        lesson.id
                                                                                    ] ?? 0}{" "}
                                                                                    quiz
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 line-clamp-1 break-all">
                                                                                {lesson.content ||
                                                                                    "No content"}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                            onClick={() => {
                                                                                setOpenMaterialModal(true);
                                                                                setSelectedLessonId(
                                                                                    lesson.id
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-1" />
                                                                            Materials
                                                                        </Button>

                                                                        <div className="relative">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleLessonMenu(
                                                                                        lesson.id
                                                                                    );
                                                                                }}
                                                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110"
                                                                            >
                                                                                <Ellipsis className="w-4 h-4" />
                                                                            </button>

                                                                            {openLessonMenuId ===
                                                                                lesson.id && (
                                                                                <div
                                                                                    id={`lesson-menu-${lesson.id}`}
                                                                                    className="absolute right-0 mt-2 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                                                                    onClick={(e) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                >
                                                                                    <div className="relative group">
                                                                                        <button
                                                                                            className="p-2.5 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                                                                                            onClick={() => {
                                                                                                setSelectedLesson(
                                                                                                    lesson
                                                                                                );
                                                                                                setIsEditLessonOpen(
                                                                                                    true
                                                                                                );
                                                                                                setOpenLessonMenuId(
                                                                                                    null
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                                                        </button>
                                                                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100]">
                                                                                            Edit
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="relative group">
                                                                                        <button
                                                                                            className="p-2.5 rounded-lg hover:bg-purple-50 transition-all duration-200 hover:scale-110"
                                                                                            onClick={() => {
                                                                                                setCurrentQuizContext(
                                                                                                    {
                                                                                                        ...currentQuizContext,
                                                                                                        moduleId:
                                                                                                            module.id,
                                                                                                        lessonId:
                                                                                                            lesson.id,
                                                                                                    }
                                                                                                );
                                                                                                setIsQuizManagerOpen(
                                                                                                    true
                                                                                                );
                                                                                                setOpenLessonMenuId(
                                                                                                    null
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <Plus className="w-4 h-4 text-purple-600" />
                                                                                        </button>
                                                                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100]">
                                                                                            Add Quiz
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="relative group">
                                                                                        <button
                                                                                            className="p-2.5 rounded-lg hover:bg-orange-50 transition-all duration-200 hover:scale-110"
                                                                                            onClick={() => {
                                                                                                setIsDocumentModalOpen(
                                                                                                    true
                                                                                                );
                                                                                                setSelectedLessonId(
                                                                                                    lesson.id
                                                                                                );
                                                                                                setOpenLessonMenuId(
                                                                                                    null
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            <FileText className="w-4 h-4 text-orange-600" />
                                                                                        </button>
                                                                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100]">
                                                                                            Material
                                                                                        </span>
                                                                                    </div>
                                                                                    <ConfirmationHelper
                                                                                        trigger={
                                                                                            <div className="relative group">
                                                                                                <button className="p-2.5 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110">
                                                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                                                </button>
                                                                                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 delay-300 whitespace-nowrap z-[100]">
                                                                                                    Delete
                                                                                                </span>
                                                                                            </div>
                                                                                        }
                                                                                        title="Delete Lesson?"
                                                                                        description="This action cannot be undone."
                                                                                        confirmText="Delete"
                                                                                        onConfirm={() =>
                                                                                            handleDeleteLesson(
                                                                                                lesson.id
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quiz Manager Modal */}
            {isQuizManagerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1400px] mx-auto p-6 relative overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
                        <QuizManager
                            courseId={currentQuizContext.courseId}
                            moduleId={currentQuizContext.moduleId}
                            lessonId={currentQuizContext.lessonId}
                            onClose={() => setIsQuizManagerOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddModuleModal
                open={isAddModuleOpen}
                onOpenChange={setIsAddModuleOpen}
                courseId={courseIdFromState}
                nextOrder={modules.length + 1}
                onCreated={() => fetchModules(courseIdFromState)}
            />
            <EditModuleModal
                open={isEditModuleOpen}
                onOpenChange={setIsEditModuleOpen}
                module_={selectedModule}
                onUpdate={() => fetchModules(courseIdFromState)}
            />
            <AddLessonModal
                open={isAddLessonOpen}
                onOpenChange={setIsAddLessonOpen}
                moduleId={selectedModuleId}
                moduleLessonsCount={modules.find((m) => m.id === selectedModuleId)?.lessons?.length ?? 0}
                onCreated={() => fetchModules(courseIdFromState)}
            />
            <EditLesson
                open={isEditLessonOpen}
                onOpenChange={setIsEditLessonOpen}
                lesson={selectedLesson}
                onUpdate={() => fetchModules(courseIdFromState)}
            />
            <UploadMaterialModal
                open={isDocumentModalOpen}
                lessonId={selectedLessonId}
                onOpenChange={setIsDocumentModalOpen}
                onUpdate={() => fetchModules(courseIdFromState)}
            />
            <LessonMaterialModal
                open={openMaterialModal}
                onOpenChange={setOpenMaterialModal}
                lessonId={selectedLessonId}
            />
        </div>
    );
};

export default ModulesPage;

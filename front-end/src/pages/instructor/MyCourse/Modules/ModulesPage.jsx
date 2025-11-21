import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Ellipsis,
  EllipsisVertical,
  FileText,
  GripVertical,
  Logs,
  Pencil,
  Plus,
  PlusIcon,
  Settings,
  TextAlignJustify,
  TextAlignStart,
  Trash2,
  Video,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AddModuleModal } from "./AddModule";
import { AddLessonModal } from "./AddLesson";
import QuizManager from "../Quiz/quiz-manager";
import UploadVideoModal from "../Upload/UploadVideoModal";
import UploadDocumentModal from "../Upload/UploadDocumentModal";
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

const ModulesPage = () => {
  const [expandedModules, setExpandedModules] = useState([]);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [addOptionsIds, setAddOptionsIds] = useState([]);
  const [isQuizManagerOpen, setIsQuizManagerOpen] = useState(false);
  const [currentQuizContext, setCurrentQuizContext] = useState({
    courseId: null,
    moduleId: null,
    lessonId: null,
  });

  const [courseQuizCount, setCourseQuizCount] = useState(0);
  const [moduleQuizCounts, setModuleQuizCounts] = useState({}); // { [moduleId]: count }
  const [lessonQuizCounts, setLessonQuizCounts] = useState({}); // optional: { [lessonId]: count }

  // NEW: menu state for compact "⋯" menus
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

  const storageCourseId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("currentCourseId")
      : null;
  const sessionCourse =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("currentCourseData"))
      : null;

  const courseIdFromState =
    location?.state?.id ??
    params?.id ??
    getCourseIdFromQuery() ??
    storageCourseId ??
    null;

  // ensure sessionCourseId persisted for other pages / on back navigation
  useEffect(() => {
    if (courseIdFromState) {
      try {
        sessionStorage.setItem("currentCourseId", courseIdFromState);
      } catch (e) {
        // ignore storage errors
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
      // if clicked outside, both will be set to null by logic above
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fetchQuizCounts = async (courseId, modulesList = []) => {
    if (!courseId) return;
    try {
      const courseRes = await getQuizzesByCourse(courseId);
      // normalize server response to array
      const normalizeArray = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data?.items)) return res.data.items;
        return [];
      };
      const courseItems = normalizeArray(courseRes);
      console.debug(
        "fetchQuizCounts - courseRes:",
        courseRes,
        "=>",
        courseItems.length
      );
      setCourseQuizCount(Array.isArray(courseItems) ? courseItems.length : 0);

      // module counts in parallel
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
      console.debug("module quiz counts:", mCounts);

      // optional: prefetch lesson quiz counts (skip if many lessons)
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
        console.debug("lesson quiz counts:", lCounts);
      }
    } catch (err) {
      console.error("Failed to fetch quiz counts:", err);
    }
  };

  // modules fetched from backend
  const [modules, setModules] = useState([]);

  const fetchModules = async (cid) => {
    if (!cid) return;
    try {
      const res = await getModulesInCourse(cid);
      const items = res?.data?.data ?? res?.data ?? [];
      console.log("items", items);
      // normalize to { id, name/title, lessons }
      const normalized = Array.isArray(items)
        ? items.map((m) => ({
            id: m.id ?? m._id ?? m._id?.toString?.(),
            name: m.title ?? m.name ?? "Untitled",
            lessons: m.lessons ?? [],
            ...m,
          }))
        : [];
      setModules(normalized);
      // ngay sau khi có modules, lấy counts
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

  const toggleAddOptions = (lessonId) => {
    setAddOptionsIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleAddLesson = (moduleId) => {
    setSelectedModuleId(moduleId);
    setIsAddLessonOpen(true);
  };

  // MENU helpers
  const toggleModuleMenu = (moduleId) => {
    setOpenModuleMenuId((prev) => (prev === moduleId ? null : moduleId));
    // close lesson menu when opening module menu
    setOpenLessonMenuId(null);
  };
  const toggleLessonMenu = (lessonId) => {
    setOpenLessonMenuId((prev) => (prev === lessonId ? null : lessonId));
    // close module menu when opening lesson menu
    setOpenModuleMenuId(null);
  };

  const handleDeleteModule = async (id) => {
    try {
      if (!id) return;
      const res = await deleteModule(id);
      if (res.success) {
        // setModules((prev) => prev.filter((m) => m.id !== id));
        await fetchModules(courseIdFromState);
        toast.success("Đã xóa!");
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
        toast.success("Đã xóa!");
      }
    } catch (error) {
      console.log("Lỗi khi xóa", error);
      toast.error("Lỗi khi xóa!");
    }
  };

  return (
    <div className="flex-row max-w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold max-w-[400px] truncate">
            Course : {sessionCourse.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
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
            Manage course quizzes ({courseQuizCount})
          </Button>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Submit Course
          </Button>
        </div>
      </div>
      <div className="max-w-full mt-5">
        <Card>
          {/* Header */}
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold flex items-center gap-2">
                <span className="w-1.5 h-6 rounded bg-indigo-500" />
                Modules
              </div>
              <Button
                variant="outline"
                className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                onClick={() => setIsAddModuleOpen(true)}
              >
                <Plus /> Module
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-4">
            {modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              return (
                <Card key={module.id} className="border-2 shadow-sm bg-card">
                  {/* Module Header */}
                  <div
                    className="flex items-center justify-between border-border p-4 cursor-pointer"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex align-content-center justify-between w-full hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3 text-left align-content-center">
                        <TextAlignJustify className="h-5 w-5 mt-1 text-indigo-500" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 text-lg font-bold truncate max-w-[280px]">
                              {module.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({module.lessons.length} lessons ·{" "}
                              {moduleQuizCounts[module.id] ?? 0} quizzes)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-[800px]">
                            {module.description || "No description available."}
                          </p>
                        </div>
                      </div>

                      <button
                        className="ml-4 text-gray-500 hover:text-gray-800 transition"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Compact action menu for module */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleMenu(module.id);
                        }}
                        className="px-2 py-1 rounded hover:bg-gray-100 text-muted-foreground"
                        aria-expanded={openModuleMenuId === module.id}
                        aria-haspopup="menu"
                      >
                        <Ellipsis />
                      </button>

                      {openModuleMenuId === module.id && (
                        <div
                          id={`module-menu-${module.id}`}
                          className="absolute right-0 mt-2 flex items-center gap-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative group">
                            <button
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                              onClick={() => {
                                setSelectedModule(module);
                                setIsEditModuleOpen(true);
                                setOpenModuleMenuId(null);
                              }}
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                              Edit Module
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                              onClick={() => {
                                handleAddLesson(module.id);
                                setOpenModuleMenuId(null);
                              }}
                            >
                              <Plus className="w-5 h-5 text-green-500" />
                            </button>
                            <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                              Add Lesson
                            </span>
                          </div>

                          <div className="relative group">
                            <button
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                setCurrentQuizContext({
                                  courseId: courseIdFromState ?? null,
                                  moduleId: module.id,
                                  lessonId: null,
                                });
                                setIsQuizManagerOpen(true);
                                setOpenModuleMenuId(null);
                              }}
                            >
                              <Settings className="w-5 h-5 text-black" />
                            </button>
                            <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                              Manage Quiz
                            </span>
                          </div>

                          <ConfirmationHelper
                            trigger={
                              <div className="relative group">
                                <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                                <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                  Delete Module
                                </span>
                              </div>
                            }
                            title="Xóa module?"
                            description="Hành động này không thể hoàn tác."
                            confirmText="Xóa"
                            onConfirm={() => {
                              console.log("delete module", module.id);
                              handleDeleteModule(module.id);
                              setOpenModuleMenuId(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson List */}
                  {isExpanded && (
                    <div>
                      {module.lessons.map((lesson, index) => {
                        const isOptionsOpen = addOptionsIds.includes(lesson.id);
                        return (
                          <div key={lesson.id} className="max-w-full pb-3 px-4">
                            <div className="flex items-center justify-content-between gap-2 py-2 hover:bg-muted/50 pl-7 border-2 rounded-md">
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 flex-1">
                                  <TextAlignStart className="text-indigo-600 h-5 w-5" />
                                  <div className="flex items-center max-w-[750px]">
                                    <div className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span className="text-sm font-semibold">
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <span className="mx-1 text-sm text-gray-500">
                                      ({lessonQuizCounts[lesson.id] ?? 0} quiz)
                                    </span>
                                  </div>
                                  <button
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={() => {
                                      setOpenMaterialModal(true);
                                      setOpenLessonMenuId(null);
                                      setOpenModuleMenuId(null);
                                      setSelectedLessonId(lesson.id);
                                    }}
                                  >
                                    <span className="text-indigo-600">
                                      Material
                                    </span>
                                  </button>

                                  <Badge
                                    variant={
                                      lesson.status === "published"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={cn(
                                      "text-xs",
                                      lesson.status === "published"
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {lesson.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center flex-1 pl-9">
                                  <span className="text-sm text-gray-600 line-clamp-3">
                                    {lesson.content}
                                  </span>
                                </div>
                              </div>

                              {/* compact lesson action menu */}
                              <div className="relative ml-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonMenu(lesson.id);
                                  }}
                                  className="px-2 py-1 rounded hover:bg-gray-100 text-muted-foreground"
                                  aria-expanded={openLessonMenuId === lesson.id}
                                  aria-haspopup="menu"
                                >
                                  <Ellipsis />
                                </button>

                                {openLessonMenuId === lesson.id && (
                                  <div
                                    id={`lesson-menu-${lesson.id}`}
                                    className="absolute right-0 mt-2 flex items-center gap-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="relative group">
                                      <button
                                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          setSelectedLesson(lesson);
                                          setIsEditLessonOpen(true);
                                          setOpenLessonMenuId(null);
                                        }}
                                      >
                                        <Edit className="w-5 h-5 text-blue-500" />
                                      </button>
                                      <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                        Edit Lesson
                                      </span>
                                    </div>
                                    <div className="relative group">
                                      <button
                                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          setCurrentQuizContext({
                                            ...currentQuizContext,
                                            moduleId: module.id,
                                            lessonId: lesson.id,
                                          });
                                          setIsQuizManagerOpen(true);
                                          setOpenLessonMenuId(null);
                                        }}
                                      >
                                        <Plus className="w-5 h-5 text-green-500" />
                                      </button>
                                      <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                        Add Quiz
                                      </span>
                                    </div>
                                    <div className="relative group">
                                      <button
                                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          setIsVideoModalOpen(true);
                                          setOpenLessonMenuId(null);
                                          setSelectedLessonId(lesson.id);
                                        }}
                                      >
                                        <Video className="w-5 h-5 text-purple-500" />
                                      </button>
                                      <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                        Add Video
                                      </span>
                                    </div>
                                    <div className="relative group">
                                      <button
                                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          setIsDocumentModalOpen(true);
                                          setOpenLessonMenuId(null);
                                          setSelectedLessonId(lesson.id);
                                        }}
                                      >
                                        <FileText className="w-5 h-5 text-orange-500" />
                                      </button>
                                      <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                        Add Document
                                      </span>
                                    </div>

                                    <ConfirmationHelper
                                      trigger={
                                        <div className="relative group">
                                          <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                          </button>
                                          <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                            Delete Lesson
                                          </span>
                                        </div>
                                      }
                                      title="Xóa Lesson?"
                                      description="Hành động này không thể hoàn tác."
                                      confirmText="Xóa"
                                      onConfirm={() => {
                                        console.log("delete lesson", lesson.id);
                                        handleDeleteLesson(lesson.id);
                                        setOpenLessonMenuId(null);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Options Dropdown (legacy) */}
                            {isOptionsOpen && (
                              <div className="flex justify-between p-4 pl-16 bg-gray-50 border-l border-gray-200 rounded-md shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 text-indigo-600 bg-gray-100"
                                  onClick={() => setIsVideoModalOpen(true)}
                                >
                                  <Plus className="h-4 w-4" /> Add Video
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 text-indigo-600 bg-gray-100"
                                  onClick={() => setIsDocumentModalOpen(true)}
                                >
                                  <Plus className="h-4 w-4" /> Add Document
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 text-indigo-600 bg-gray-100"
                                  onClick={() => {
                                    setCurrentQuizContext({
                                      ...currentQuizContext,
                                      moduleId: module.id,
                                      lessonId: lesson.id,
                                    });
                                    setIsQuizManagerOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" /> Add Quiz
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
            {isQuizManagerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                {/* max-w thay đổi ở đây để mở rộng modal */}
                <div className="bg-white rounded-lg shadow-lg w-full max-w-[1400px] mx-auto p-6 relative overflow-y-auto max-h-[92vh]">
                  <QuizManager
                    courseId={currentQuizContext.courseId}
                    moduleId={currentQuizContext.moduleId}
                    lessonId={currentQuizContext.lessonId}
                    onClose={() => setIsQuizManagerOpen(false)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
          moduleLessonsCount={
            modules.find((m) => m.id === selectedModuleId)?.lessons?.length ?? 0
          }
          onCreated={() => fetchModules(courseIdFromState)}
        />
        <EditLesson
          open={isEditLessonOpen}
          onOpenChange={setIsEditLessonOpen}
          lesson={selectedLesson}
          onUpdate={() => fetchModules(courseIdFromState)}
        />
        <UploadVideoModal
          open={isVideoModalOpen}
          lessonId={selectedLessonId}
          onOpenChange={setIsVideoModalOpen}
        />
        <UploadDocumentModal
          open={isDocumentModalOpen}
          lessonId={selectedLessonId}
          onOpenChange={setIsDocumentModalOpen}
        />
        <LessonMaterialModal
          open={openMaterialModal}
          onOpenChange={setOpenMaterialModal}
          lessonId={selectedLessonId}
        />
      </div>
    </div>
  );
};

export default ModulesPage;

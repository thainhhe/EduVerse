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
  FileText,
  GripVertical,
  Pencil,
  Plus,
  PlusIcon,
  Trash2,
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
} from "@/services/courseService";
import LessonMaterialModal from "./LessonMaterialModal";

const ModulesPage = () => {
  const [expandedModules, setExpandedModules] = useState([]);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
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

  const [openMaterialModal, setOpenMaterialModal] = useState(null);

  const location = useLocation();
  const params = useParams();
  // prefer state.id (when navigated with state), fallback to URL param :id
  const courseIdFromState = location?.state?.id ?? params?.id ?? null;

  // if opened from course card with openQuiz flag, set context and open modal
  useEffect(() => {
    if (!courseIdFromState) return;
    setCurrentQuizContext((prev) => ({ ...prev, courseId: courseIdFromState }));
    if (location?.state?.openQuiz) {
      setIsQuizManagerOpen(true);
    }
  }, [courseIdFromState, location?.state?.openQuiz]);

  // Close menus when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      // if click outside any menu, close
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
      console.log("items", items)
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

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Course Modules</h1>
          <div className="text-sm text-muted-foreground">
            Course quizzes:{" "}
            <span className="font-medium">{courseQuizCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
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
      <div className="mx-auto max-w-4xl mt-5">
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
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 bg-transparent"
                onClick={() => setIsAddModuleOpen(true)}
              >
                + Module
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-4">
            {modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              return (
                <Card
                  key={module.id}
                  className="border border-border shadow-sm bg-card"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex items-center gap-3 text-left hover:opacity-70"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {module.name} ({module.lessons.length} lessons)
                      </span>
                      <Badge className="ml-3 text-xs">
                        {moduleQuizCounts[module.id] ?? 0} quiz
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

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
                        ⋯
                      </button>

                      {openModuleMenuId === module.id && (
                        <div
                          id={`module-menu-${module.id}`}
                          className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              handleAddLesson(module.id);
                              setOpenModuleMenuId(null);
                            }}
                          >
                            <span className="mr-2">＋</span> Add Lesson
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
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
                            <span className="mr-2">🎯</span> Manage Module
                            Quizzes
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                            onClick={() => {
                              // placeholder for delete module
                              console.log("delete module", module.id);
                              setOpenModuleMenuId(null);
                            }}
                          >
                            <span className="mr-2">🗑</span> Delete Module
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson List */}
                  {isExpanded && (
                    <div className="divide-y divide-border">
                      {module.lessons.map((lesson, index) => {
                        const isOptionsOpen = addOptionsIds.includes(lesson.id);
                        return (
                          <div key={lesson.id}>
                            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 pl-10">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <button
                                className="text-sm font-medium text-primary hover:underline"
                                onClick={() => {
                                  setOpenMaterialModal(true);
                                  setOpenLessonMenuId(null);
                                  setOpenModuleMenuId(null)
                                  setSelectedLessonId(lesson.id);
                                }}
                              >
                                Lesson {index + 1}
                              </button>

                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {lesson.title}
                                </span>
                                <Badge className="ml-3 text-xs">
                                  {lessonQuizCounts[lesson.id] ?? 0}
                                </Badge>
                              </div>

                              <div className="flex-1" />

                              <Badge
                                variant={
                                  lesson.status === "Published"
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  "text-xs",
                                  lesson.status === "Published"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {lesson.status}
                              </Badge>

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
                                  ⋯
                                </button>

                                {openLessonMenuId === lesson.id && (
                                  <div
                                    id={`lesson-menu-${lesson.id}`}
                                    className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-md z-50"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                      onClick={() => {
                                        // edit lesson
                                        console.log("edit lesson", lesson.id);
                                        setOpenLessonMenuId(null);
                                      }}
                                    >
                                      <span className="mr-2">✏️</span> Edit
                                      Lesson
                                    </button>

                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
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
                                      <span className="mr-2">＋</span> Add Quiz
                                    </button>

                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                      onClick={() => {
                                        setIsVideoModalOpen(true);
                                        setOpenLessonMenuId(null);
                                        setSelectedLessonId(lesson.id);
                                      }}
                                    >
                                      <span className="mr-2">🎬</span> Add Video
                                    </button>

                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                      onClick={() => {
                                        setIsDocumentModalOpen(true);
                                        setOpenLessonMenuId(null);
                                        setSelectedLessonId(lesson.id);

                                      }}
                                    >
                                      <span className="mr-2">📄</span> Add
                                      Document
                                    </button>

                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                                      onClick={() => {
                                        // delete lesson placeholder
                                        console.log("delete lesson", lesson.id);
                                        setOpenLessonMenuId(null);
                                      }}
                                    >
                                      <span className="mr-2">🗑</span> Delete
                                      Lesson
                                    </button>
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsQuizManagerOpen(false)}
                  >
                    ✕
                  </button>
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
        <AddLessonModal
          open={isAddLessonOpen}
          onOpenChange={setIsAddLessonOpen}
          moduleId={selectedModuleId}
          moduleLessonsCount={
            modules.find((m) => m.id === selectedModuleId)?.lessons?.length ?? 0
          }
          onCreated={() => fetchModules(courseIdFromState)}
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

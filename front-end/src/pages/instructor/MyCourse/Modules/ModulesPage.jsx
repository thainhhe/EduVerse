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
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AddModuleModal } from "./AddModule";
import { AddLessonModal } from "./AddLesson";
import QuizManager from "../Quiz/quiz-manager";
import UploadVideoModal from "../Upload/UploadVideoModal";
import UploadDocumentModal from "../Upload/UploadDocumentModal";
import { getModulesInCourse } from "@/services/courseService";

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

  const location = useLocation();
  const courseIdFromState = location?.state?.id ?? null;

  // if opened from course card with openQuiz flag, set context and open modal
  useEffect(() => {
    if (!courseIdFromState) return;
    setCurrentQuizContext((prev) => ({ ...prev, courseId: courseIdFromState }));
    if (location?.state?.openQuiz) {
      setIsQuizManagerOpen(true);
    }
  }, [courseIdFromState, location?.state?.openQuiz]);

  // modules fetched from backend
  const [modules, setModules] = useState([]);

  const fetchModules = async (cid) => {
    if (!cid) return;
    try {
      const res = await getModulesInCourse(cid);
      const items = res?.data?.data ?? res?.data ?? [];
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

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold"></h1>
        <div className="flex items-center gap-2">
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
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handleAddLesson(module.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        // open module-level quiz: only moduleId (omit courseId)
                        setCurrentQuizContext({
                          courseId: null,
                          moduleId: module.id,
                          lessonId: null,
                        });
                        setIsQuizManagerOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Quiz
                    </Button>
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
                              <button className="text-sm font-medium text-primary hover:underline">
                                Lesson {index + 1}
                              </button>

                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {lesson.title}
                                </span>
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

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => toggleAddOptions(lesson.id)}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Options Dropdown */}
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
          onOpenChange={setIsVideoModalOpen}
        />
        <UploadDocumentModal
          open={isDocumentModalOpen}
          onOpenChange={setIsDocumentModalOpen}
        />
      </div>
    </div>
  );
};

export default ModulesPage;

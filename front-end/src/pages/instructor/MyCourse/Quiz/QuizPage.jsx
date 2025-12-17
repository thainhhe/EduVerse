import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { QuestionForm } from "./question-form";
import { QuestionGrid } from "./question-grid";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/toastHelper";
import {
  createQuiz,
  updateQuiz,
  getQuizzesByCourse,
  getQuizzesByModule,
  getQuizzesByLesson,
  getQuizById,
} from "@/services/courseService";
import { Plus, X, ArrowLeft } from "lucide-react";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import api from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastHelper } from "@/helper/ToastHelper";

const QuizPage = () => {
  const location = useLocation();
  const { courseId, moduleId, lessonId } = location.state;
  const navigator = useNavigate();

  const [initialMode, setInitialMode] = useState(
    location.state?.mode || "list"
  );
  const [initialQuizData, setInitialQuizData] = useState(
    location.state?.quizData || null
  );
  const [mode, setMode] = useState(initialMode);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    timeLimit: 0,
    passingScore: 0,
    attemptsAllowed: 1,
    isPublished: false,
  });
  const [questions, setQuestions] = useState([]);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [errors, setErrors] = useState({});

  // Normalize title: trim and collapse multiple spaces
  const normalizeTitle = () => {
    const normalized = (quizInfo.title || "").trim().replace(/\s+/g, " ");
    if (normalized !== quizInfo.title) {
      setQuizInfo({ ...quizInfo, title: normalized });
    }
  };

  // Normalize description: trim and collapse multiple spaces
  const normalizeDescription = () => {
    const normalized = (quizInfo.description || "").trim().replace(/\s+/g, " ");
    if (normalized !== quizInfo.description) {
      setQuizInfo({ ...quizInfo, description: normalized });
    }
  };

  const mapServerToLocal = (q) => {
    if (!q) return null;
    return {
      id: q._id ?? q.id ?? q.quizId ?? null,
      title: q.title ?? q.name ?? "",
      description: q.description ?? q.desc ?? "",
      timeLimit: q.timeLimit ?? q.duration ?? 0,
      passingScore: q.passingScore ?? q.passing ?? 0,
      attemptsAllowed: q.attemptsAllowed ?? q.attempt ?? 1,
      isPublished: !!q.isPublished,
      questions:
        (q.questions || q.items || []).map((qq) => ({
          questionText: qq.questionText ?? qq.text ?? "",
          questionType: qq.questionType ?? qq.type ?? "multiple_choice",
          options: qq.options ?? qq.choices ?? [],
          correctAnswer: qq.correctAnswer ?? qq.answer ?? [],
          explanation: qq.explanation ?? qq.feedback ?? "",
          points: qq.points ?? 1,
        })) || [],
    };
  };

  const loadQuizzes = useCallback(async () => {
    const scopeName = lessonId
      ? "lesson"
      : moduleId
      ? "module"
      : courseId
      ? "course"
      : null;
    if (!scopeName) {
      setQuizzes([]);
      return;
    }
    setLoadingList(true);
    try {
      let res;
      if (lessonId) res = await getQuizzesByLesson(lessonId);
      else if (moduleId) res = await getQuizzesByModule(moduleId);
      else res = await getQuizzesByCourse(courseId);

      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : res?.data?.items ?? [];
      const mapped = (arr || []).map((q) => ({
        id: q._id ?? q.id ?? q.quizId ?? null,
        title: q.title ?? q.name ?? "(untitled)",
        isPublished: !!q.isPublished,
        raw: q,
      }));
      setQuizzes(mapped);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
      setQuizzes([]);
    } finally {
      setLoadingList(false);
    }
  }, [courseId, moduleId, lessonId]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    if ((initialMode === "edit" || initialQuizData) && initialQuizData) {
      startEdit(initialQuizData);
    }
  }, [initialMode, initialQuizData]);

  const startAdd = () => {
    setMode("add");
    setEditingQuizId(null);
    setQuizInfo({
      title: "",
      description: "",
      timeLimit: 0,
      passingScore: 0,
      attemptsAllowed: 1,
      isPublished: false,
    });
    setQuestions([]);
    setErrors({});
  };

  const startEdit = async (quizRaw) => {
    const local = mapServerToLocal(quizRaw);
    if (!local) return;
    setErrors({});
    let source = local;
    try {
      const firstQ = (local.questions || [])[0];
      const missingCorrect =
        firstQ &&
        (!("correctAnswer" in firstQ) ||
          (Array.isArray(firstQ.correctAnswer) &&
            firstQ.correctAnswer.length === 0));
      if (missingCorrect && local.id) {
        const res = await getQuizById(`${local.id}?includeAnswers=true`);
        const quizObj = res?.data?.data ?? res?.data ?? res;
        const full = mapServerToLocal(quizObj);
        if (full) source = full;
      }
    } catch (err) {
      console.warn(
        "Failed to fetch full quiz (includeAnswers); using provided data.",
        err
      );
    }

    setMode("edit");
    setEditingQuizId(source.id);
    setQuizInfo({
      title: source.title,
      description: source.description,
      timeLimit: source.timeLimit,
      passingScore: source.passingScore,
      attemptsAllowed: source.attemptsAllowed,
      isPublished: source.isPublished,
    });

    const mappedQuestions = (source.questions || []).map((q, idx) => {
      const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
      const options = (q.options || []).map((opt, i) => {
        console.log("opt", opt);
        let isCorrect = correctArr.includes(String(opt));
        return {
          id: String(i),
          text: opt,
          isCorrect,
        };
      });
      return {
        id: `Question ${idx + 1}`,
        text: q.questionText,
        type: (q.questionType || "multiple_choice")
          .toString()
          .replace(/_/g, "-"),
        options,
        explanation: q.explanation || "",
        points: q.points || 1,
        _originalCorrectAnswer: correctArr,
      };
    });
    setQuestions(mappedQuestions);
  };

  const handleSaveQuiz = async () => {
    setErrors({});
    const newErrors = {};

    // Normalize title and description before validation
    const normalizedTitle = (quizInfo.title ?? "").trim().replace(/\s+/g, " ");
    if (normalizedTitle !== quizInfo.title) {
      setQuizInfo({ ...quizInfo, title: normalizedTitle });
    }

    const normalizedDescription = (quizInfo.description ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (normalizedDescription !== quizInfo.description) {
      setQuizInfo({ ...quizInfo, description: normalizedDescription });
    }

    const title = normalizedTitle;

    if (!title) {
      newErrors.title = "Please enter quiz title!";
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.length > 200) {
      newErrors.title = "Title must be at most 200 characters";
    }

    console.log("AFTER TRIM:", quizInfo.description);
    const description = normalizedDescription;
    console.log("description", description);
    if (!description) {
      console.log("description empty");
      newErrors.description = "Description is required";
    } else if (description.length < 10) {
      console.log("vô đây");
      newErrors.description = "description must be at least 10 characters";
    } else if (description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (quizInfo.timeLimit < 5)
      newErrors.timeLimit = "Time limit must be at least 5 minutes";
    if (quizInfo.timeLimit > 720)
      newErrors.timeLimit = "Time limit cannot exceed 720 minutes";

    if (quizInfo.passingScore < 1)
      newErrors.passingScore = "Passing score must be at least 1%";
    if (quizInfo.passingScore > 100)
      newErrors.passingScore = "Passing score cannot exceed 100%";

    if (quizInfo.attemptsAllowed < 1)
      newErrors.attemptsAllowed = "Attempts must be at least 1";

    if (Object.keys(newErrors).length > 0) {
      console.log(
        "%c--- VALIDATION ERRORS ---",
        "color: red; font-weight: bold"
      );

      Object.entries(newErrors).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      setErrors(newErrors);
      return;
    }

    const normalizeType = (t) =>
      (t ?? "").toString().replace(/[-\s]/g, "_").toLowerCase();

    let normalizedQuestions;
    try {
      normalizedQuestions = (questions || [])
        .map((q, idx) => {
          const questionText = ((q.text ?? q.questionText) + "").trim();

          const rawOptions = q.options || [];
          const optionTexts = rawOptions
            .map((opt) =>
              typeof opt === "string"
                ? opt
                : (opt?.text ?? "").toString().trim()
            )
            .filter(Boolean);
          let correct = [];
          const optsWithFlags = rawOptions.filter(
            (opt) => opt && typeof opt === "object" && "isCorrect" in opt
          );

          if (optsWithFlags.length) {
            correct = rawOptions
              .filter((opt) => opt && typeof opt === "object" && opt.isCorrect)
              .map((opt) =>
                typeof opt === "string"
                  ? opt
                  : (opt?.text ?? "").toString().trim()
              )
              .filter(Boolean);
          } else if (
            Array.isArray(q._originalCorrectAnswer) &&
            q._originalCorrectAnswer.length
          ) {
            const orig = q._originalCorrectAnswer;
            const hasNumeric = orig.some(
              (c) => typeof c === "number" || /^\d+$/.test(String(c))
            );
            const hasIdLike = orig.some(
              (c) => typeof c === "string" && /^[0-9a-fA-F]{24}$/.test(c)
            );
            console.log("orig", orig);
            console.log("hasNumeric", hasNumeric);
            console.log("hasIdLike", hasIdLike);

            if (hasNumeric) {
              correct = orig
                .map((c) => {
                  const idxOpt = Number(c);
                  return optionTexts[idxOpt] ?? null;
                })
                .filter(Boolean);
            } else if (hasIdLike) {
              correct = rawOptions
                .map((opt) => {
                  if (
                    opt &&
                    typeof opt === "object" &&
                    opt.id &&
                    orig.includes(String(opt.id))
                  ) {
                    return opt.text ?? "";
                  }
                  return null;
                })
                .filter(Boolean);
            } else {
              correct = orig
                .map((c) => String(c))
                .filter((c) => optionTexts.includes(c));
            }
          } else if (Array.isArray(q.correctAnswer) && q.correctAnswer.length) {
            correct = q.correctAnswer
              .map((c) => (typeof c === "number" ? optionTexts[c] : c))
              .map((c) => (c ?? "").toString().trim())
              .filter((c) => optionTexts.includes(c));
          } else {
            correct = [];
          }

          if (!questionText || optionTexts.length === 0) return null;
          if (!correct || correct.length === 0) {
            throw new Error(
              `Question ${idx + 1} requires at least one correct answer`
            );
          }

          return {
            questionText,
            questionType: normalizeType(q.type) || "multiple_choice",
            options: optionTexts,
            correctAnswer: correct,
            explanation: (q.explanation ?? "").trim() || undefined,
            points: Number(q.points) || 1,
            order: idx + 1,
          };
        })
        .filter(Boolean);
    } catch (mapErr) {
      console.error("Quiz mapping error:", mapErr);
      setErrors((prev) => ({
        ...prev,
        questions:
          mapErr.message ||
          "Question mapping error. Check questions and correct answers.",
      }));
      return;
    }
    if (normalizedQuestions.length === 0) {
      setErrors((prev) => ({
        ...prev,
        questions:
          "Please add at least one valid question with options and correct answer.",
      }));
      return;
    }

    const isObjectId = (id) =>
      typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    const scope = {};
    if (isObjectId(lessonId)) scope.lessonId = lessonId;
    else if (isObjectId(moduleId)) scope.moduleId = moduleId;
    else if (isObjectId(courseId)) scope.courseId = courseId;

    const payload = {
      title: title,
      description: (quizInfo.description ?? "").trim() || undefined,
      timeLimit: Number(quizInfo.timeLimit) || 0,
      passingScore: Number(quizInfo.passingScore) || 0,
      attemptsAllowed: Number(quizInfo.attemptsAllowed) || 1,
      isPublished: !!quizInfo.isPublished,
      questions: normalizedQuestions,
      ...scope,
    };

    try {
      const res =
        mode === "edit" && editingQuizId
          ? await updateQuiz(editingQuizId, payload)
          : await createQuiz(payload);

      const ok =
        (res && res.status >= 200 && res.status < 300) ||
        (res && res.data && (res.data.id || res.data._id)) ||
        (res && (res.id || res._id));
      if (ok) {
        notifySuccess("Saved quiz successfully");
        await loadQuizzes();
        setMode("list");
      } else {
        console.error("Failed saving quiz:", res);
        notifyError("Failed to save quiz. See console.");
      }
    } catch (err) {
      console.error("Save quiz error:", err);
      const msg =
        err?.message || err?.response?.data?.message || "server error";
      notifyError("Failed to save quiz: " + msg);
    }
  };

  const handleDelete = async (quizId) => {
    try {
      const res = await api.delete(`/quiz/${quizId}`);
      console.log("res", res);
      if (res.success) {
        ToastHelper.success("Delete quiz successfully");
      }
      await loadQuizzes();
    } catch (err) {
      console.error("Delete failed", err);
      notifyError("Delete failed");
    }
  };

  const handleBack = () => {
    if (mode === "add" || mode === "edit") {
      setMode("list");
    } else {
      navigator(-1);
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 border-b-2 border-dashed border-gray-200 pb-2">
        <div className="flex gap-3 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-sm hover:bg-gray-100"
            onClick={handleBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">
            {lessonId
              ? `Lesson Quizzes`
              : moduleId
              ? `Module Quizzes`
              : `Course Quizzes`}
          </h2>
        </div>
        {mode === "list" && (
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm"
            onClick={() => {
              setMode("add");
              startAdd();
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Quiz
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {mode === "list" && (
          <div className="col-span-1">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              Total Quizzes: {loadingList ? "Loading..." : `${quizzes.length}`}
            </div>
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="group relative bg-white border border-gray-200 rounded-sm hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => startEdit(q.raw)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 flex-1 pr-4">
                        {q.title}
                      </h3>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          q.isPublished
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}
                      >
                        {q.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    {q?.raw?.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {q.raw.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium text-indigo-600">
                          {q?.raw?.questions?.length ?? 0}
                        </span>
                        <span>questions</span>
                      </div>
                      {q?.raw?.timeLimit > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{q.raw.timeLimit} min</span>
                        </div>
                      )}
                      {q?.raw?.passingScore > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{q.raw.passingScore}% to pass</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-[50%] right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ConfirmationHelper
                      trigger={
                        <button
                          className="p-2 bg-white border border-gray-200 rounded-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 text-gray-400 shadow-sm"
                          title="Delete Quiz"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      }
                      onConfirm={() => handleDelete(q.id)}
                      title="Delete Quiz"
                      message="Are you sure you want to delete this quiz? This action cannot be undone."
                    />
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-sm border border-dashed border-gray-300">
                  No quizzes found for this scope.
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={
            mode === "list"
              ? "col-span-1 lg:col-span-2"
              : "col-span-1 lg:col-span-3"
          }
        >
          {(mode === "add" || mode === "edit") && (
            <div className="space-y-4">
              <div className="flex gap-1 border-b-2 border-gray-200">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
                    activeTab === "info"
                      ? "text-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Quiz Info
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
                    activeTab === "questions"
                      ? "text-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Questions{" "}
                  {questions.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                      {questions.length}
                    </span>
                  )}
                  {activeTab === "questions" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </button>
              </div>

              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-sm border border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Quiz Title
                      </label>
                      <input
                        type="text"
                        className={`w-full border rounded-sm p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.title
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        placeholder="Enter quiz title..."
                        value={quizInfo.title}
                        onChange={(e) => {
                          setQuizInfo({ ...quizInfo, title: e.target.value });
                          if (errors.title)
                            setErrors((prev) => ({
                              ...prev,
                              title: undefined,
                            }));
                        }}
                        onBlur={normalizeTitle}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        className={`w-full border rounded-sm p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.timeLimit
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        value={quizInfo.timeLimit}
                        onChange={(e) =>
                          setQuizInfo({
                            ...quizInfo,
                            timeLimit: Number(e.target.value),
                          })
                        }
                      />
                      {errors.timeLimit && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.timeLimit}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        className={`w-full border rounded-sm p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.passingScore
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        value={quizInfo.passingScore}
                        onChange={(e) =>
                          setQuizInfo({
                            ...quizInfo,
                            passingScore: Number(e.target.value),
                          })
                        }
                      />
                      {errors.passingScore && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.passingScore}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Attempts Allowed
                      </label>
                      <input
                        type="number"
                        className={`w-full border rounded-sm p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.attemptsAllowed
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        value={quizInfo.attemptsAllowed}
                        onChange={(e) =>
                          setQuizInfo({
                            ...quizInfo,
                            attemptsAllowed: Number(e.target.value),
                          })
                        }
                      />
                      {errors.attemptsAllowed && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.attemptsAllowed}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        className={`w-full border rounded-sm p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none ${
                          errors.description
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white"
                        }`}
                        rows={3}
                        placeholder="Short description..."
                        value={quizInfo.description}
                        onChange={(e) =>
                          setQuizInfo({
                            ...quizInfo,
                            description: e.target.value,
                          })
                        }
                        onBlur={normalizeDescription}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="md:col-span-2 border border-gray-300 flex items-center justify-start gap-2 p-3 rounded-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setQuizInfo({
                          ...quizInfo,
                          isPublished: !quizInfo.isPublished,
                        })
                      }
                    >
                      <input
                        type="checkbox"
                        checked={quizInfo.isPublished}
                        onChange={(e) =>
                          setQuizInfo({
                            ...quizInfo,
                            isPublished: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-indigo-600 rounded-sm"
                      />
                      <label className="text-sm font-medium text-gray-700 cursor-pointer">
                        Published
                      </label>
                    </div>
                  </div>

                  {/* Navigation hint */}
                  <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 text-sm text-blue-800">
                    💡 Click on the <strong>Questions</strong> tab above to add
                    questions to your quiz.
                  </div>
                </div>
              )}

              {activeTab === "questions" && (
                <div className="space-y-4 bg-white p-4 rounded-sm border border-gray-200">
                  {errors.questions && (
                    <div className="text-sm text-red-600 mt-2 text-center bg-red-50 p-3 rounded-sm border border-red-200">
                      {errors.questions}
                    </div>
                  )}
                  {!showQuestionForm && (
                    <div className="flex justify-between items-center">
                      <div className="border-b border-gray-200 pb-0.5">
                        <h2 className="text-lg font-semibold text-gray-800">
                          Existing Questions
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          View and manage questions with their answer options
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowQuestionForm(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Question
                      </Button>
                    </div>
                  )}

                  {showQuestionForm && (
                    <div className="w-full">
                      <QuestionForm
                        onAddQuestion={(q) => {
                          setQuestions((prev) => {
                            setErrors((p) => ({ ...p, questions: undefined }));
                            return [...prev, q];
                          });
                          setShowQuestionForm(false);
                        }}
                      />
                      <div className="flex justify-end mt-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowQuestionForm(false)}
                          className="rounded-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showQuestionForm && (
                    <ScrollArea className="max-h-[60vh] overflow-auto">
                      <div className="w-full">
                        <QuestionGrid
                          questions={questions}
                          onDeleteQuestion={(id) =>
                            setQuestions((prev) => {
                              setErrors((p) => ({
                                ...p,
                                questions: undefined,
                              }));
                              return prev.filter((q) => q.id !== id);
                            })
                          }
                        />
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm"
                >
                  Save Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

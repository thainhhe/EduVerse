import { useEffect, useState, useCallback } from "react";
import { QuestionForm } from "./question-form";
import { QuestionGrid } from "./question-grid";
import { ImportSection } from "./import-section";
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
import { Trash2, Plus, CloverIcon, X } from "lucide-react";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import api from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastHelper } from "@/helper/ToastHelper";

const QuizManager = ({
    mode: initialMode = "list", // default show list
    quizData: initialQuizData = null,
    lessonTitle,
    moduleTitle,
    courseTitle,
    courseId,
    moduleId,
    lessonId,
    onClose,
}) => {
    const [mode, setMode] = useState(initialMode); // 'list' | 'add' | 'edit'
    const [quizzes, setQuizzes] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    console.log("lessonTitle", lessonTitle);
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

    // Normalize server quiz -> local editor shape if needed
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
        const scopeName = lessonId ? "lesson" : moduleId ? "module" : courseId ? "course" : null;
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

            // courseService returns axios .get result (api interceptor returns response.data)
            // normalize to array
            const arr = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : res?.data?.items ?? [];
            // map to minimal preview info
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

    // Nếu component được mở ở chế độ edit kèm quiz data, populate editor ngay
    useEffect(() => {
        // bỏ rule eslint cho phụ thuộc hàm startEdit để đơn giản
        if ((initialMode === "edit" || initialQuizData) && initialQuizData) {
            // safe: startEdit có kiểm tra null bên trong
            startEdit(initialQuizData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMode, initialQuizData]);

    // prepare editor for new quiz
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

    // open existing quiz for edit (fetch full quiz with answers when needed)
    const startEdit = async (quizRaw) => {
        const local = mapServerToLocal(quizRaw);
        if (!local) return;
        setErrors({});

        // If questions exist but seem to lack correctAnswer info, try fetching full quiz
        let source = local;
        try {
            const firstQ = (local.questions || [])[0];
            const missingCorrect =
                firstQ &&
                (!("correctAnswer" in firstQ) ||
                    (Array.isArray(firstQ.correctAnswer) && firstQ.correctAnswer.length === 0));
            if (missingCorrect && local.id) {
                const res = await getQuizById(`${local.id}?includeAnswers=true`);
                const quizObj = res?.data?.data ?? res?.data ?? res;
                const full = mapServerToLocal(quizObj);
                if (full) source = full;
            }
        } catch (err) {
            console.warn("Failed to fetch full quiz (includeAnswers); using provided data.", err);
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

        // map to UI question shape used in QuestionForm/QuestionGrid
        const mappedQuestions = (source.questions || []).map((q, idx) => {
            const correctArr = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
            const hasNumeric = correctArr.some((c) => typeof c === "number" || /^\d+$/.test(String(c)));
            const hasIdLike = correctArr.some((c) => typeof c === "string" && /^[0-9a-fA-F]{24}$/.test(c));

            const options = (q.options || []).map((opt, i) => {
                const text = typeof opt === "string" ? opt : opt?.text ?? "";
                let isCorrect = false;

                if (hasNumeric) {
                    const numericSet = new Set(correctArr.map((c) => Number(c)));
                    isCorrect = numericSet.has(i);
                } else if (hasIdLike && typeof opt === "object" && opt.id) {
                    isCorrect = correctArr.includes(String(opt.id));
                } else {
                    // compare by text/value
                    isCorrect = correctArr.some((c) => String(c) === String(text));
                }

                return typeof opt === "string"
                    ? { id: String(i + 1), text, isCorrect }
                    : { ...opt, id: opt.id ?? String(i + 1), text, isCorrect };
            });

            return {
                id: `Question ${idx + 1}`,
                text: q.questionText,
                type: (q.questionType || "multiple_choice").toString().replace(/_/g, "-"),
                options,
                explanation: q.explanation || "",
                points: q.points || 1,
                _originalCorrectAnswer: correctArr,
            };
        });
        setQuestions(mappedQuestions);
    };

    const handleSaveQuiz = async () => {
        // const title = (quizInfo.title ?? "").trim();
        // if (!title) {
        //   setErrors({ title: "Please enter quiz title!" });
        //   // focus title input if available
        //   document
        //     .querySelector('input[placeholder="Enter quiz title..."]')
        //     ?.focus();
        //   return;
        // }
        // setErrors({});
        const newErrors = {};

        // --- Quiz info validation ---
        const title = (quizInfo.title ?? "").trim();
        if (!title) newErrors.title = "Please enter quiz title!";
        else if (title.length < 3) newErrors.title = "Title must be at least 3 characters";
        else if (title.length > 200) newErrors.title = "Title must be at most 200 characters";

        const description = (quizInfo.description ?? "").trim();
        if (!description) newErrors.description = "Description is required";
        else if (description.length > 500) newErrors.description = "Description cannot exceed 500 characters";

        if (quizInfo.timeLimit < 5) newErrors.timeLimit = "Time limit must be at least 5 minutes";
        if (quizInfo.timeLimit > 720) newErrors.timeLimit = "Time limit cannot exceed 720 minutes";

        if (quizInfo.passingScore < 1) newErrors.passingScore = "Passing score must be at least 1%";
        if (quizInfo.passingScore > 100) newErrors.passingScore = "Passing score cannot exceed 100%";

        if (quizInfo.attemptsAllowed < 1) newErrors.attemptsAllowed = "Attempts must be at least 1";

        // --- Questions validation ---
        if (!questions || questions.length === 0) newErrors.questions = "Please add at least one question";

        // Nếu có lỗi, update state và stop
        if (Object.keys(newErrors).length > 0) {
            console.log("%c--- VALIDATION ERRORS ---", "color: red; font-weight: bold");

            Object.entries(newErrors).forEach(([key, value]) => {
                console.log(`${key}:`, value);
            });

            setErrors(newErrors);
            return;
        }

        console.log("đến đấy");

        const normalizeType = (t) => (t ?? "").toString().replace(/[-\s]/g, "_").toLowerCase();

        let normalizedQuestions;
        try {
            normalizedQuestions = (questions || [])
                .map((q, idx) => {
                    const questionText = ((q.text ?? q.questionText) + "").trim();

                    const rawOptions = q.options || [];
                    const optionTexts = rawOptions
                        .map((opt) => (typeof opt === "string" ? opt : (opt?.text ?? "").toString().trim()))
                        .filter(Boolean);

                    // Build correct answers:
                    // 1) prefer explicit isCorrect flags on option objects
                    // 2) else fallback to stored _originalCorrectAnswer (could be indices / texts / ids)
                    let correct = [];
                    const optsWithFlags = rawOptions.filter(
                        (opt) => opt && typeof opt === "object" && "isCorrect" in opt
                    );

                    if (optsWithFlags.length) {
                        correct = rawOptions
                            .filter((opt) => opt && typeof opt === "object" && opt.isCorrect)
                            .map((opt) =>
                                typeof opt === "string" ? opt : (opt?.text ?? "").toString().trim()
                            )
                            .filter(Boolean);
                    } else if (Array.isArray(q._originalCorrectAnswer) && q._originalCorrectAnswer.length) {
                        const orig = q._originalCorrectAnswer;
                        const hasNumeric = orig.some((c) => typeof c === "number" || /^\d+$/.test(String(c)));
                        const hasIdLike = orig.some(
                            (c) => typeof c === "string" && /^[0-9a-fA-F]{24}$/.test(c)
                        );

                        if (hasNumeric) {
                            correct = orig
                                .map((c) => {
                                    const idxOpt = Number(c);
                                    return optionTexts[idxOpt] ?? null;
                                })
                                .filter(Boolean);
                        } else if (hasIdLike) {
                            // try to match option.id -> optionTexts
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
                            // assume orig are texts
                            correct = orig.map((c) => String(c)).filter((c) => optionTexts.includes(c));
                        }
                    } else if (Array.isArray(q.correctAnswer) && q.correctAnswer.length) {
                        correct = q.correctAnswer
                            .map((c) => (typeof c === "number" ? optionTexts[c] : c))
                            .map((c) => (c ?? "").toString().trim())
                            .filter((c) => optionTexts.includes(c));
                    } else {
                        // no flags and no original correct info -> try infer (none)
                        correct = [];
                    }

                    if (!questionText || optionTexts.length === 0) return null;
                    if (!correct || correct.length === 0) {
                        // surface friendly error and stop saving
                        throw new Error(`Question ${idx + 1} requires at least one correct answer`);
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
            // show inline error instead of browser alert
            setErrors((prev) => ({
                ...prev,
                questions: mapErr.message || "Question mapping error. Check questions and correct answers.",
            }));
            return;
        }

        if (normalizedQuestions.length === 0) {
            setErrors((prev) => ({
                ...prev,
                questions: "Please add at least one valid question with options and correct answer.",
            }));
            return;
        }

        const isObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
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
            const msg = err?.message || err?.response?.data?.message || "server error";
            notifyError("Failed to save quiz: " + msg);
        }
    };

    const handleDelete = async (quizId) => {
        try {
            const res = await api.delete(`/quiz/${quizId}`);
            console.log("res", res)
            if (res.success) {
                ToastHelper.success("Delete quiz successfully")
            }
            await loadQuizzes();
        } catch (err) {
            console.error("Delete failed", err);
            notifyError("Delete failed");
        }
    };

    return (
        // Mở rộng chiều ngang modal bằng max-w; nếu parent là modal, nội dung sẽ rộng hơn
        <div className="p-2 bg-white rounded-md w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quiz Manager</h2>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                        onClick={() => {
                            setMode("list");
                            startAdd();
                        }}
                    >
                        <Plus /> New Quiz
                    </Button>
                    <Button
                        onClick={onClose}
                        className="bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                        <X className="w-5 h-5" /> Close
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {mode === "list" && (
                    <div className="col-span-1 border rounded-md p-2 max-h-[60vh] overflow-auto">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-muted-foreground">Quizzes</div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-md font-semibold">Scope</h3>
                                <div className="text-sm text-muted-foreground">
                                    {lessonId
                                        ? `Lesson Quizzes`
                                        : moduleId
                                            ? `Module Quizzes`
                                            : `Course Quizzes`}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {loadingList ? "Loading..." : `${quizzes.length}`}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {quizzes.map((q) => (
                                <div
                                    key={q.id}
                                    className="p-2 border-1 rounded hover:bg-muted/50 flex items-center justify-between cursor-pointer"
                                    onClick={() => startEdit(q.raw)}
                                >
                                    <div className="truncate">
                                        <div className="font-medium">{q.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {q.isPublished ? "Published" : "Draft"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ConfirmationHelper
                                            trigger={
                                                <button
                                                    className="bg-white border p-1 rounded border-indigo-600 hover:bg-red-600 hover:text-white transition-colors duration-200 text-sm text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            }
                                            onConfirm={() => handleDelete(q.id)}
                                            title="Delete Quiz"
                                            message="Are you sure you want to delete this quiz?"
                                        />
                                    </div>
                                </div>
                            ))}
                            {quizzes.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    No quizzes found for this scope.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={mode === "list" ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-3"}>
                    {(mode === "add" || mode === "edit") && (
                        <div className="space-y-4">
                            {/* metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">
                                        Quiz Title<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full border rounded-lg p-2 mt-1 ${errors.title ? "border-red-500" : ""
                                            } bg-gray-200`}
                                        placeholder="Enter quiz title..."
                                        value={quizInfo.title}
                                        onChange={(e) => {
                                            setQuizInfo({ ...quizInfo, title: e.target.value });
                                            if (errors.title)
                                                setErrors((prev) => ({ ...prev, title: undefined }));
                                        }}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Time Limit (minutes)<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 mt-1 bg-gray-200"
                                        value={quizInfo.timeLimit}
                                        onChange={(e) =>
                                            setQuizInfo({
                                                ...quizInfo,
                                                timeLimit: Number(e.target.value),
                                            })
                                        }
                                    />
                                    {errors.timeLimit && (
                                        <p className="text-sm text-red-600 mt-1">{errors.timeLimit}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Passing Score (%)<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 mt-1 bg-gray-200"
                                        value={quizInfo.passingScore}
                                        onChange={(e) =>
                                            setQuizInfo({
                                                ...quizInfo,
                                                passingScore: Number(e.target.value),
                                            })
                                        }
                                    />
                                    {errors.passingScore && (
                                        <p className="text-sm text-red-600 mt-1">{errors.passingScore}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Attempts Allowed <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 mt-1 bg-gray-200"
                                        value={quizInfo.attemptsAllowed}
                                        onChange={(e) =>
                                            setQuizInfo({
                                                ...quizInfo,
                                                attemptsAllowed: Number(e.target.value),
                                            })
                                        }
                                    />
                                    {errors.attemptsAllowed && (
                                        <p className="text-sm text-red-600 mt-1">{errors.attemptsAllowed}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">
                                        Description<span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 mt-1 bg-gray-200"
                                        rows={2}
                                        placeholder="Short description..."
                                        value={quizInfo.description}
                                        onChange={(e) =>
                                            setQuizInfo({ ...quizInfo, description: e.target.value })
                                        }
                                    />
                                </div>
                                <div
                                    className="md:col-span-2 border border-gray-200 flex items-center justify-start gap-2 p-2 rounded-lg cursor-pointer bg-gray-200"
                                    onClick={() =>
                                        setQuizInfo({ ...quizInfo, isPublished: !quizInfo.isPublished })
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={quizInfo.isPublished}
                                        onChange={(e) =>
                                            setQuizInfo({ ...quizInfo, isPublished: e.target.checked })
                                        }
                                    />
                                    <label className="text-sm font-medium">Published</label>
                                </div>
                            </div>

                            {/* Questions stacked vertically, full width, trong vùng cuộn */}
                            <ScrollArea className="max-h-[60vh] overflow-auto pb-28 space-y-6">
                                {/* Add form - full width */}
                                <div className="w-full">
                                    <QuestionForm
                                        onAddQuestion={(q) =>
                                            setQuestions((prev) => {
                                                setErrors((p) => ({ ...p, questions: undefined }));
                                                return [...prev, q];
                                            })
                                        }
                                    />
                                </div>

                                {/* Existing questions list/grid - full width */}
                                <div className="w-full">
                                    <QuestionGrid
                                        questions={questions}
                                        onDeleteQuestion={(id) =>
                                            setQuestions((prev) => {
                                                setErrors((p) => ({ ...p, questions: undefined }));

                                                return prev.filter((q) => q.id !== id);
                                            })
                                        }
                                        onEditQuestion={(id, updated) =>
                                            setQuestions((prev) => {
                                                setErrors((p) => ({ ...p, questions: undefined }));
                                                return prev.map((q) => (q.id === id ? updated : q));
                                            })
                                        }
                                    />
                                </div>
                                {errors.questions && (
                                    <div className="text-sm text-red-600 mt-2">{errors.questions}</div>
                                )}
                            </ScrollArea>

                            {/* Footer buttons below scrollable area */}
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setMode("list")}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveQuiz} className="bg-indigo-600 text-white">
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

export default QuizManager;

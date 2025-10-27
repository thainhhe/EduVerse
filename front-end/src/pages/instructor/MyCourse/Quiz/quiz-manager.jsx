import { useEffect, useState } from "react";
import { QuestionForm } from "./question-form";
import { QuestionGrid } from "./question-grid";
import { ImportSection } from "./import-section";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/toastHelper";
import { createQuiz, updateQuiz } from "@/services/courseService";

const QuizManager = ({
  mode = "add",
  quizData = null,
  courseId,
  moduleId,
  lessonId,
  onClose,
}) => {
  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    timeLimit: 0,
    passingScore: 0,
    attemptsAllowed: 1,
    isPublished: false,
  });

  console.log({ quizData, courseId, moduleId, lessonId });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (mode === "edit" && quizData) {
      setQuizInfo({
        title: quizData.title || "",
        description: quizData.description || "",
        timeLimit: quizData.timeLimit || 0,
        passingScore: quizData.passingScore || 0,
        attemptsAllowed: quizData.attemptsAllowed || 1,
        isPublished: quizData.isPublished || false,
      });

      setQuestions(
        quizData.questions?.map((q, idx) => ({
          id: `Q-${idx + 1}`,
          text: q.questionText,
          type: q.questionType || "multiple_choice",
          options: q.options.map((opt) => ({
            id: crypto.randomUUID(),
            text: opt,
            isCorrect: q.correctAnswer.includes(opt),
          })),
          explanation: q.explanation || "",
          points: q.points || 1,
        })) || []
      );
    }
  }, [mode, quizData]);

  const handleAddQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: `Q-${String(
        Math.max(
          ...questions.map((q) => Number.parseInt(q.id.split("-")[1])),
          1000
        ) + 1
      )}`,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));
  const handleEditQuestion = (id, updatedQuestion) =>
    setQuestions(questions.map((q) => (q.id === id ? updatedQuestion : q)));

  // ✅ Gửi toàn bộ quiz lên backend (sử dụng courseService API)
  const handleSaveQuiz = async () => {
    const title = (quizInfo.title ?? "").trim();
    if (!title) return alert("Please enter quiz title!");

    // normalize question type from UI -> backend enum (multiple_choice / true_false / checkbox)
    const normalizeType = (t) =>
      (t ?? "").toString().replace(/[-\s]/g, "_").toLowerCase();

    const normalizedQuestions = (questions || [])
      .map((q, idx) => {
        const questionText = ((q.text ?? q.questionText) + "").trim();
        const optionsArr = (q.options || [])
          .map((opt) =>
            typeof opt === "string" ? opt : (opt?.text ?? "").trim()
          )
          .filter(Boolean);
        const correct = (q.options || [])
          .filter((opt) => opt?.isCorrect)
          .map((opt) =>
            typeof opt === "string" ? opt : (opt?.text ?? "").trim()
          )
          .filter(Boolean);

        if (!questionText || optionsArr.length === 0) return null;

        return {
          questionText,
          questionType: normalizeType(q.type) || "multiple_choice",
          options: optionsArr,
          correctAnswer: correct.length ? correct : [],
          explanation: (q.explanation ?? "").trim() || undefined,
          points: Number(q.points) || 1,
          order: idx + 1,
        };
      })
      .filter(Boolean);

    if (normalizedQuestions.length === 0)
      return alert("Please add at least one valid question with options.");

    // choose single scope id only
    const isObjectId = (id) =>
      typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    const scope = {};
    if (isObjectId(lessonId)) scope.lessonId = lessonId;
    else if (isObjectId(moduleId)) scope.moduleId = moduleId;
    else if (isObjectId(courseId)) scope.courseId = courseId;

    const payload = {
      title,
      description: (quizInfo.description ?? "").trim() || undefined,
      timeLimit: Number(quizInfo.timeLimit) || 0,
      passingScore: Number(quizInfo.passingScore) || 0,
      attemptsAllowed: Number(quizInfo.attemptsAllowed) || 1,
      isPublished: !!quizInfo.isPublished,
      questions: normalizedQuestions,
      ...scope, // only one of courseId/moduleId/lessonId will be included
    };

    try {
      const res =
        mode === "edit" && quizData?.id
          ? await updateQuiz(quizData.id, payload)
          : await createQuiz(payload);

      // normalize/detect success for various response shapes:
      const normalizeSuccess = (r) => {
        if (!r) return false;
        // axios response with HTTP status
        if (typeof r.status === "number")
          return r.status >= 200 && r.status < 300;
        // axios response with .data wrapper
        if (r.data && typeof r.data === "object") {
          if (typeof r.data.success === "boolean")
            return r.data.success === true;
          if (r.data.id || r.data._id) return true;
        }
        // direct object returned (no wrapper)
        if (typeof r.success === "boolean") return r.success === true;
        if (r.id || r._id) return true;
        return false;
      };

      if (normalizeSuccess(res)) {
        notifySuccess("Thêm quizzz thành công!");
        onClose();
      } else {
        console.error("Save quiz failed:", res?.data ?? res);
        alert("❌ Failed to save quiz. See console/server response.");
      }
    } catch (err) {
      console.error("Save quiz error:", err.response?.data ?? err);
      const serverMsg =
        err.response?.data?.message ?? err.response?.data ?? err.message;
      alert(
        "Failed to save quiz: " +
          (typeof serverMsg === "string"
            ? serverMsg
            : JSON.stringify(serverMsg))
      );
    }
  };

  return (
    <div className="p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Quiz Builder
        </h1>

        {/* --- Quiz Metadata Form --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium">Quiz Title</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Enter quiz title..."
              value={quizInfo.title}
              onChange={(e) =>
                setQuizInfo({ ...quizInfo, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Time Limit (minutes)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.timeLimit}
              onChange={(e) =>
                setQuizInfo({ ...quizInfo, timeLimit: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Passing Score (%)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.passingScore}
              onChange={(e) =>
                setQuizInfo({
                  ...quizInfo,
                  passingScore: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Attempts Allowed</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.attemptsAllowed}
              onChange={(e) =>
                setQuizInfo({
                  ...quizInfo,
                  attemptsAllowed: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded-lg p-2 mt-1"
              rows={2}
              placeholder="Short description about this quiz..."
              value={quizInfo.description}
              onChange={(e) =>
                setQuizInfo({ ...quizInfo, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* --- Questions Section --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <QuestionForm onAddQuestion={handleAddQuestion} />
          </div>
          <div className="lg:col-span-1">
            <QuestionGrid
              questions={questions}
              onDeleteQuestion={handleDeleteQuestion}
              onEditQuestion={handleEditQuestion}
            />
          </div>
          <div className="lg:col-span-1">
            <ImportSection
              onImportQuestions={(imported) =>
                setQuestions([...questions, ...imported])
              }
            />
          </div>
        </div>

        {/* --- Save Button --- */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveQuiz}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizManager;

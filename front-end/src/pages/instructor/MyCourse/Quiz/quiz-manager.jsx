import { useEffect, useState } from "react"
import { QuestionForm } from "./question-form"
import { QuestionGrid } from "./question-grid"
import { ImportSection } from "./import-section"
import { Button } from "@/components/ui/button"
import { notifySuccess } from "@/lib/toastHelper"

const QuizManager = ({ mode = "add", quizData = null, courseId, moduleId, lessonId, onClose }) => {
  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    timeLimit: 0,
    passingScore: 0,
    attemptsAllowed: 1,
    isPublished: false,
  });

  console.log({ quizData, courseId, moduleId, lessonId })
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

      setQuestions(quizData.questions?.map((q, idx) => ({
        id: `Q-${idx + 1}`,
        text: q.questionText,
        type: q.questionType || "multiple_choice",
        options: q.options.map(opt => ({
          id: crypto.randomUUID(),
          text: opt,
          isCorrect: q.correctAnswer.includes(opt),
        })),
        explanation: q.explanation || "",
        points: q.points || 1,
      })) || [])
    }
  }, [mode, quizData])

  const handleAddQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: `Q-${String(
        Math.max(...questions.map((q) => Number.parseInt(q.id.split("-")[1])), 1000) + 1
      )}`,
    }
    setQuestions([...questions, newQuestion])
  }

  const handleDeleteQuestion = (id) => setQuestions(questions.filter(q => q.id !== id))
  const handleEditQuestion = (id, updatedQuestion) => setQuestions(questions.map(q => q.id === id ? updatedQuestion : q))

  // ✅ Gửi toàn bộ quiz lên backend
  const handleSaveQuiz = async () => {
    if (!quizInfo.title) return alert("Please enter quiz title!")

    const payload = {
      ...quizInfo,
      courseId,
      moduleId,
      lessonId,
      questions: questions.map((q, index) => ({
        questionText: q.text,
        questionType: q.type || "multiple_choice",
        options: q.options.map(opt => opt.text),
        correctAnswer: q.options.filter(opt => opt.isCorrect).map(opt => opt.text),
        explanation: q.explanation,
        points: q.points || 1,
        order: index + 1,
      })),
    }
    console.log("payload", payload)
    setTimeout(() => {
      notifySuccess("Thêm quizzz thành công!");
      onClose(); // Gọi prop để đóng modal
    }, 1000);
    // try {
    //   const res = await fetch("http://localhost:5678/api/quizzes", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   })
    //   const data = await res.json()
    //   alert("✅ Quiz saved successfully!")
    //   console.log("Created quiz:", data)
    // } catch (err) {
    //   console.error(err)
    //   alert("❌ Failed to save quiz")
    // }
  }

  return (
    <div className="p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Quiz Builder</h1>


        {/* --- Quiz Metadata Form --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium">Quiz Title</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Enter quiz title..."
              value={quizInfo.title}
              onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Time Limit (minutes)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.timeLimit}
              onChange={(e) => setQuizInfo({ ...quizInfo, timeLimit: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Passing Score (%)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.passingScore}
              onChange={(e) => setQuizInfo({ ...quizInfo, passingScore: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Attempts Allowed</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              value={quizInfo.attemptsAllowed}
              onChange={(e) => setQuizInfo({ ...quizInfo, attemptsAllowed: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded-lg p-2 mt-1"
              rows={2}
              placeholder="Short description about this quiz..."
              value={quizInfo.description}
              onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
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
            <ImportSection onImportQuestions={(imported) => setQuestions([...questions, ...imported])} />
          </div>
        </div>

        {/* --- Save Button --- */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveQuiz} className="bg-indigo-600 text-white hover:bg-indigo-700">
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuizManager

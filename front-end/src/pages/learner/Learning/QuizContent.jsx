import { ToastHelper } from "@/helper/ToastHelper";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const QuizContent = ({ quizId }) => {
    console.log("quizId", quizId)
    const { user } = useAuth()
    const userId = user._id
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});

    // ✅ Lấy quiz theo quizId
    useEffect(() => {
        if (!quizId) return;
        fetch(`http://localhost:9999/api/v1/quiz/${quizId}`)
            .then((res) => res.json())
            .then((data) => {
                setQuiz(data.data);
                const init = {};
                data.data.questions.forEach((q, idx) => {
                    init[idx] = q.questionType === "checkbox" ? [] : "";
                });
                setAnswers(init);
            })
            .catch((err) => console.error("❌ Error fetching quiz:", err));
    }, [quizId]);

    if (!quiz) return <p className="p-8">Loading quiz...</p>;
    console.log("quiz", quiz)
    // ✅ Cập nhật đáp án
    const handleChange = (index, value, isCheckbox) => {
        setAnswers((prev) => {
            if (isCheckbox) {
                const current = prev[index];
                const updated = current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value];
                return { ...prev, [index]: updated };
            } else {
                return { ...prev, [index]: value };
            }
        });
    };

    // ✅ Submit quiz
    const handleSubmit = async () => {
        console.log("quiz.questions", quiz.questions)
        const formattedAnswers = quiz.questions.map((q, index) => ({
            questionId: q.id || null,
            userAnswer: Array.isArray(answers[index])
                ? answers[index]
                : [answers[index]],
        }));

        const body = {
            userId,
            quizId,
            answers: formattedAnswers,
            timeTaken: 45, // ví dụ
        };
        console.log("body", body)

        try {
            const res = await fetch("http://localhost:9999/api/v1/score/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (result.success) {
                ToastHelper.success(result.message)
            } else {
                ToastHelper.warning(result.message)
            }
        } catch (err) {
            console.error("❌ Lỗi khi submit:", err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
            <p className="text-gray-600 mb-8">{quiz.description}</p>

            {quiz.questions.map((q, index) => (
                <div key={index} className="mb-6 p-4 border rounded-md bg-white">
                    <p className="font-medium mb-4">
                        {index + 1}. {q.questionText}
                    </p>

                    {q.options.map((option, i) => (
                        <label key={i} className="block mb-2 cursor-pointer">
                            <input
                                type={q.questionType === "checkbox" ? "checkbox" : "radio"}
                                name={`question-${index}`}
                                value={option}
                                checked={
                                    q.questionType === "checkbox"
                                        ? answers[index]?.includes(option)
                                        : answers[index] === option
                                }
                                onChange={(e) =>
                                    handleChange(index, option, q.questionType === "checkbox")
                                }
                                className="mr-2 accent-indigo-600"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            ))}

            <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md"
            >
                Submit Quiz
            </button>
        </div>
    );
}

export default QuizContent
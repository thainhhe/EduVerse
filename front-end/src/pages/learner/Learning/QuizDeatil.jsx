import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const QuizDetail = () => {
    const { quizId } = useParams();
    const { user } = useAuth();
    const userId = user._id;

    const [quizResult, setQuizResult] = useState({

        "quizId": "12345",
        "userId": "67890",
        "score": 80,
        "attemptsLeft": 1,
        "answers": [
            {
                "questionText": "What is 2 + 2?",
                "options": ["2", "3", "4", "5"],
                "correctAnswers": ["4"],
                "userAnswers": ["3"],
                "isCorrect": false
            },
            {
                "questionText": "Select fruits",
                "options": ["Apple", "Car", "Banana"],
                "correctAnswers": ["Apple", "Banana"],
                "userAnswers": ["Apple", "Banana"],
                "isCorrect": true
            },
            {
                "questionText": "Which planet is known as the Red Planet?",
                "options": ["Earth", "Venus", "Mars", "Jupiter"],
                "correctAnswers": ["Mars"],
                "userAnswers": ["Mars"],
                "isCorrect": true
            }
        ]
    });
    const [loading, setLoading] = useState(true);


    // 🧩 Lấy kết quả quiz
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
        // const fetchQuizResult = async () => {
        //     try {
        //         const res = await fetch(`http://localhost:9999/api/v1/score/detail/${quizId}/${userId}`, {
        //             headers: {
        //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
        //             },
        //         });
        //         const data = await res.json();
        //         if (data.success) setQuizResult(data.data);
        //     } catch (err) {
        //         console.error("❌ Lỗi khi fetch kết quả quiz:", err);
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchQuizResult();
    }, [quizId, userId]);

    if (loading) return <p className="p-8">Đang tải kết quả...</p>;
    if (!quizResult) return <p className="p-8 text-red-600">Không tìm thấy kết quả.</p>;

    const { score, attemptsLeft, answers } = quizResult;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Kết quả bài làm</h1>

            <div className="flex items-center justify-between mb-8">
                <p className="text-lg font-medium text-indigo-600">
                    🧾 Điểm số: <span className="font-bold">{score}%</span>
                </p>
                <p className="text-sm text-gray-600">
                    🔁 Lần làm lại còn lại: <span className="font-semibold">{attemptsLeft}</span>
                </p>
            </div>

            {answers.map((q, index) => (
                <div
                    key={index}
                    className={`mb-6 p-4 border rounded-md ${q.isCorrect ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
                        }`}
                >
                    <p className="font-medium mb-2">
                        {index + 1}. {q.questionText}
                    </p>

                    <ul className="mb-2">
                        {q.options.map((opt, i) => {
                            const isCorrect = q.correctAnswers.includes(opt);
                            const isSelected = q.userAnswers.includes(opt);

                            return (
                                <li
                                    key={i}
                                    className={`p-2 rounded-md ${isSelected && isCorrect
                                        ? "bg-green-200"
                                        : isSelected && !isCorrect
                                            ? "bg-red-200"
                                            : isCorrect
                                                ? "bg-green-100"
                                                : "bg-gray-100"
                                        }`}
                                >
                                    {opt}
                                    {isCorrect && <span className="ml-2 text-green-700 font-semibold">✅</span>}
                                    {isSelected && !isCorrect && (
                                        <span className="ml-2 text-red-700 font-semibold">❌</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <p className="text-sm text-gray-700">
                        {q.isCorrect ? "✅ Câu trả lời đúng!" : "❌ Câu trả lời sai!"}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default QuizDetail;

// src/pages/learner/Learning/QuizResult.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const QuizResult = ({ quiz, latestScore, attempts, onRetake, currentLesson }) => {
    console.log({ quiz, latestScore, attempts, onRetake, currentLesson })
    const navigate = useNavigate();

    const handleViewDetail = () => {
        navigate(`/quiz-detail/${quiz.id}`, {
            state: { fromLearning: true, currentLesson } // ✅ dùng prop này
        });
    };


    return (
        <div className="max-w-2xl mx-auto p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{quiz.title}</h2>
            <p className="text-gray-600 mb-4">
                Your Grades: {latestScore.score}/{latestScore.totalPoints} (
                {latestScore.percentage}%)
            </p>
            <p className="text-gray-600 mb-4">
                To pass you need at least {quiz.passingScore}%. We keep your highest score.
            </p>

            <p
                className={`mb-4 font-semibold ${latestScore.passed ? "text-green-600" : "text-red-600"
                    }`}
            >
                {latestScore.passed ? "✅ Pass" : "❌ Not Pass"}
            </p>

            <p className="text-sm text-gray-500 mb-4">
                Remaining attempts: {attempts.remaining} / {attempts.total + attempts.remaining}
            </p>

            {attempts.canRetake ? (
                <Button onClick={onRetake}>🔁 To do again quiz</Button>
            ) : (
                <p className="text-sm text-gray-500 mb-4 -4">
                    You don't used all your quiz attempts.
                </p>
            )}
            {/* 👇 Nút xem chi tiết kết quả */}
            <Button className="ml-3" onClick={handleViewDetail}>Detail result</Button>


        </div>
    );
};

export default QuizResult;

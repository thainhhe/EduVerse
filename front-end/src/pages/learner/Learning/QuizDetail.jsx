import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { scoreService } from "@/services/scoreService";
import { ToastHelper } from "@/helper/ToastHelper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// const QuizDetail = ({ quizId, userId, onBack }) => {
const QuizDetail = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    console.log("user", user,)
    console.log("quizId", quizId,)
    const userId = user?._id;
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                const res = await scoreService.GetQuizByUseridQuizId(userId, quizId);
                console.log("res", res)
                if (res.success) {
                    setQuizResult(res.data)
                } else {
                    ToastHelper.error(res.message)
                }

            } catch (err) {
                console.error("❌ Lỗi khi fetch kết quả quiz:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizResult();
    }, [quizId, userId]);

    if (loading) return <p className="p-8">Đang tải kết quả...</p>;
    if (!quizResult) return <p className="p-8 text-red-600">Không tìm thấy kết quả.</p>;

    const { score, quiz, scope } = quizResult;
    console.log("score", score)
    console.log("quiz", quiz)
    console.log("scope", scope)
    const location = useLocation();
    const currentLesson = location.state?.currentLesson;
    const handleBack = () => {
        if (location.state?.fromLearning && currentLesson) {
            navigate(`/learning/${scope.course.id}`, {
                state: { restoreLesson: currentLesson },
            });
        } else {
            navigate(`/learning/${scope.course.id}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft className="h-4 w-4" /> Quay lại
            </Button>


            <h1 className="text-3xl font-bold mb-2">{quiz?.title}</h1>
            <p className="text-gray-600 mb-1">
                📘 Khóa học: <span className="font-medium">{scope.course?.title}</span>
            </p>
            <p className="text-gray-600 mb-6">
                📗 Module: <span className="font-medium">{scope.module?.title}</span>
            </p>

            <div className="flex items-center justify-between mb-8">
                <p className="text-lg font-medium text-indigo-600">
                    🧾 Điểm số:{" "}
                    <span className="font-bold">
                        {score.score}/{score.totalPoints} ({score.percentage}%)
                    </span>
                </p>
                <p
                    className={`text-sm font-semibold ${score.status === "passed" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {score.status === "passed" ? "✅ Đạt yêu cầu" : "❌ Chưa đạt"}
                </p>
            </div>

            <p className="italic text-gray-700 font-bold mb-8">💬 {score.remarks}</p>
            {score.answers.map((ans, index) => (
                <div
                    key={index}
                    className={`mb-6 p-5 border rounded-lg shadow-sm
                         
                        `}
                >
                    {/* Câu hỏi */}
                    <p className="font-semibold text-lg mb-4">
                        {index + 1}. {ans.question?.questionText || "Không có nội dung câu hỏi"}
                    </p>

                    {/* Lựa chọn hiển thị kiểu radio/checkbox */}
                    <div className="space-y-2 mb-4">
                        {ans.question?.options?.map((opt, i) => {
                            const isSelected = ans.userAnswer?.includes(opt);
                            const isCorrect = ans.question?.correctAnswer?.includes(opt);
                            return (
                                <label
                                    key={i}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border ${isCorrect
                                        ? "border-green-500 bg-green-50"
                                        : isSelected
                                            ? ans.isCorrect
                                                ? "border-blue-400 bg-blue-50"
                                                : "border-red-400 bg-red-50"
                                            : "border-gray-300 bg-white"
                                        }`}
                                >
                                    <input
                                        type={
                                            ans.question?.questionType === "multiple_choice"
                                                ? "radio"
                                                : "checkbox"
                                        }
                                        disabled
                                        checked={isSelected}
                                        className="accent-blue-600"
                                    />
                                    <span className="text-sm text-gray-800">{opt}</span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Câu trả lời của bạn */}
                    <p className="text-sm text-gray-700 mb-1">
                        <strong>🧠 Câu trả lời của bạn:</strong>{" "}
                        {ans.userAnswer?.length > 0 ? ans.userAnswer.join(", ") : "Không có"}
                    </p>

                    {/* Trạng thái đúng/sai */}
                    <p className="text-sm font-medium">
                        {ans.isCorrect ? "✅ Trả lời đúng" : "❌ Trả lời sai"}
                    </p>

                    {/* Giải thích nếu có */}
                    {ans.question?.explanation && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                            💡 {ans.question.explanation}
                        </p>
                    )}
                </div>
            ))}


        </div>
    );
};

export default QuizDetail;


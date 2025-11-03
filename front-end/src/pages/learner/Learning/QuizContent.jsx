import { ToastHelper } from "@/helper/ToastHelper";
import { useAuth } from "@/hooks/useAuth";
import { scoreService } from "@/services/scoreService";
import { Clock, ListChecks, Percent, Repeat } from "lucide-react";
import { useState, useEffect } from "react";

const QuizContent = ({ quizId, onQuizSubmitted }) => {
    const { user } = useAuth();
    const userId = user._id;
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [hasStarted, setHasStarted] = useState(false);
    const [timeLeft, setTimLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(0);

    // ✅ Lấy quiz theo quizId
    useEffect(() => {
        if (!quizId) return;
        fetch(`http://localhost:9999/api/v1/quiz/${quizId}`)
            .then((res) => res.json())
            .then((data) => {
                setQuiz(data.data);
                console.log(data)
                const init = {};
                data.data.questions.forEach((q, idx) => {
                    init[idx] = q.questionType === "checkbox" ? [] : "";
                });
                setAnswers(init);
            })
            .catch((err) => console.error(" Error fetching quiz:", err));
    }, [quizId]);
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

    // ✅ Gửi kết quả quiz


    const handStarted = () => {
        setHasStarted(true)
        setTimLeft(quiz.timeLimit * 60)
        setTimerActive(true)
    }
    useEffect(() => {
        if (!timerActive) return;
        if (timeLeft === 0) {
            handleSubmit(true);
            setTimerActive(false);
        }


        const timer = setInterval(() => {
            setTimLeft((pre) => pre - 1);
        }, 1000);
        return () => clearInterval(timer)
    }, [timerActive, timeLeft]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }
    console.log("formatTime", formatTime)
    if (!quiz) return <p className="p-8 text-center">Loading quiz...</p>;


    const handleSubmit = async (auto = false) => {
        const formattedAnswers = quiz.questions.map((q, index) => ({
            questionId: q.id || null,
            userAnswer: Array.isArray(answers[index])
                ? answers[index]
                : [answers[index]],
        }));

        const totalTime = quiz.timeLimit * 60 - timeLeft;


        const body = {
            userId,
            quizId,
            answers: formattedAnswers,
            timeTaken: totalTime,
        };

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
                if (result.message) {
                    const message = auto
                        ? ` Time is up! ${result.message}`
                        : result.message;
                    ToastHelper.success(message);
                }
                const status = await scoreService.checkQuizStatus(user._id, quizId);
                if (onQuizSubmitted) onQuizSubmitted(status.data);
            } else {
                ToastHelper.warning(result.message);
            }

        } catch (err) {
            console.error(" Lỗi khi submit:", err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* ✅ Card giới thiệu quiz */}
            {!hasStarted && (
                <div className="border rounded-xl shadow-md bg-white p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Tên Quiz: {quiz.title}</h2>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <div className="space-y-3 text-gray-700">
                        <div className="flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-blue-600" />
                            <p>
                                Số câu hỏi: <span className="font-semibold">{quiz.questions.length}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <p>
                                Thời gian làm: <span className="font-semibold">{quiz.timeLimit}</span> phút
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-yellow-600" />
                            <p>
                                Điểm cần để vượt qua: <span className="font-semibold">{quiz.passingScore}</span>%
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Repeat className="w-5 h-5 text-purple-600" />
                            <p>
                                Số lần được thử lại: <span className="font-semibold">{quiz.attemptsAllowed}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handStarted}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Start Quiz
                    </button>
                </div>
            )}


            {hasStarted && (
                <div className="mt-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
                        <p className="text-gray-600 mb-8">{quiz.description}</p>
                        <div
                            className={`flex items-center justify-center gap-2 text-lg font-bold px-4 py-2 rounded-md transition-all duration-500
    ${timeLeft <= 30
                                    ? "bg-red-100 text-red-700 animate-pulse ring-2 ring-red-300 shadow-lg"
                                    : "bg-green-100 text-green-700"
                                }`}
                        >
                            {timeLeft <= 30 && (
                                <Clock className="animate-bounce text-red-600 w-6 h-6" />
                            )}
                            {formatTime(timeLeft)}
                        </div>


                    </div>


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
                                        onChange={() =>
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
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
                    >
                        Nộp bài
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizContent;

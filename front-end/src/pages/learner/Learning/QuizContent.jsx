import { ToastHelper } from "@/helper/ToastHelper";
import { useAuth } from "@/hooks/useAuth";
import { getQuizById } from "@/services/courseService";
import { scoreService } from "@/services/scoreService";
import {
    Clock,
    ListChecks,
    Percent,
    Repeat,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Timer,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QuizContent = ({ quizId, onQuizSubmitted }) => {
    const { user } = useAuth();
    const userId = user._id;
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [hasStarted, setHasStarted] = useState(false);
    const [timeLeft, setTimLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(0);
    const [loading, setLoading] = useState(true);

    // ✅ Lấy quiz theo quizId
    useEffect(() => {
        if (!quizId) return;

        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const result = await getQuizById(quizId);

                if (result && result.data) {
                    setQuiz(result.data);

                    const init = {};
                    result.data.questions.forEach((q, idx) => {
                        init[idx] = q.questionType === "checkbox" ? [] : "";
                    });
                    setAnswers(init);
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
                ToastHelper.error("Failed to load quiz data.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
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

    const handStarted = () => {
        setHasStarted(true);
        setTimLeft(quiz.timeLimit * 60);
        setTimerActive(true);
    };

    useEffect(() => {
        if (!timerActive) return;
        if (timeLeft === 0) {
            handleSubmit(true);
            setTimerActive(false);
        }

        const timer = setInterval(() => {
            setTimLeft((pre) => pre - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (auto = false) => {
        const formattedAnswers = quiz.questions.map((q, index) => ({
            questionId: q.id || null,
            userAnswer: Array.isArray(answers[index]) ? answers[index] : [answers[index]],
        }));

        const totalTime = quiz.timeLimit * 60 - timeLeft;

        const body = {
            userId,
            quizId,
            answers: formattedAnswers,
            timeTaken: totalTime,
        };

        try {
            const result = await scoreService.submitScore(body);
            if (result.success) {
                if (result.message) {
                    const message = auto ? `Time is up! ${result.message}` : result.message;
                    ToastHelper.success(message);
                }
                const status = await scoreService.checkQuizStatus(user._id, quizId);
                if (onQuizSubmitted) onQuizSubmitted(status.data);
            } else {
                ToastHelper.warning(result.message);
            }
        } catch (err) {
            console.error("Lỗi khi submit:", err);
            ToastHelper.error("Failed to submit quiz.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 font-medium">Loading quiz content...</p>
            </div>
        );
    }

    if (!quiz)
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Quiz not found</h3>
                <p className="text-gray-500">
                    The quiz you are looking for does not exist or has been removed.
                </p>
            </div>
        );

    return (
        <div className="max-w-full w-full mx-auto pb-12">
            {/* Introduction Card */}
            {!hasStarted && (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="w-full shadow-xl border-t-4 border-t-indigo-600">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-indigo-50 p-3 rounded-full w-fit mb-4">
                                <HelpCircle className="w-8 h-8 text-indigo-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{quiz.title}</CardTitle>
                            <CardDescription className="text-base mt-2">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <ListChecks className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="text-sm text-gray-500">Questions</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {quiz.questions.length}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <Clock className="w-6 h-6 text-green-500 mb-2" />
                                    <span className="text-sm text-gray-500">Time Limit</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {quiz.timeLimit} mins
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <Percent className="w-6 h-6 text-amber-500 mb-2" />
                                    <span className="text-sm text-gray-500">Passing Score</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {quiz.passingScore}%
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <Repeat className="w-6 h-6 text-purple-500 mb-2" />
                                    <span className="text-sm text-gray-500">Attempts</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {quiz.attemptsAllowed}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex gap-3 items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">Before you start:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Ensure you have a stable internet connection.</li>
                                        <li>Do not refresh the page once the quiz starts.</li>
                                        <li>
                                            The timer will start immediately after you click the button below.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-8">
                            <Button
                                onClick={handStarted}
                                size="lg"
                                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-lg shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                            >
                                Start Quiz Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Quiz Taking Interface */}
            {hasStarted && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 mb-8 shadow-sm">
                        <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">
                                    {quiz.title}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Question{" "}
                                    {Object.keys(answers).filter((k) => answers[k]?.length > 0).length} of{" "}
                                    {quiz.questions.length} answered
                                </p>
                            </div>

                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg shadow-sm border transition-colors ${
                                    timeLeft <= 60
                                        ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                                        : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                }`}
                            >
                                <Timer className={`w-5 h-5 ${timeLeft <= 60 ? "animate-bounce" : ""}`} />
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-300"
                            style={{
                                width: `${
                                    (Object.keys(answers).filter((k) => answers[k]?.length > 0).length /
                                        quiz.questions.length) *
                                    100
                                }%`,
                            }}
                        />
                    </div>

                    <div className="space-y-6 px-4">
                        {quiz.questions.map((q, index) => (
                            <Card
                                key={index}
                                className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <Badge
                                            variant="outline"
                                            className="bg-white mt-0.5 h-6 w-6 flex items-center justify-center rounded-full p-0 flex-shrink-0 border-gray-300 text-gray-500"
                                        >
                                            {index + 1}
                                        </Badge>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-lg leading-snug">
                                                {q.questionText}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                                                {q.questionType === "checkbox"
                                                    ? "Select all that apply"
                                                    : "Select one answer"}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        {q.options.map((option, i) => {
                                            const isSelected =
                                                q.questionType === "checkbox"
                                                    ? answers[index]?.includes(option)
                                                    : answers[index] === option;

                                            const isCheckboxType = q.questionType === "checkbox";

                                            return (
                                                <label
                                                    key={i}
                                                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 group ${
                                                        isSelected
                                                            ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
                                                            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                    }`}
                                                >
                                                    {/* Custom Radio/Checkbox Indicator */}
                                                    <div
                                                        className={`flex items-center justify-center w-5 h-5 border mr-3 transition-colors flex-shrink-0 ${
                                                            isSelected
                                                                ? "bg-indigo-600 border-indigo-600"
                                                                : "bg-white border-gray-300 group-hover:border-gray-400"
                                                        } ${isCheckboxType ? "rounded" : "rounded-full"}`}
                                                    >
                                                        {isSelected && (
                                                            <>
                                                                {isCheckboxType ? (
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                ) : (
                                                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <input
                                                        type={
                                                            q.questionType === "checkbox"
                                                                ? "checkbox"
                                                                : "radio"
                                                        }
                                                        name={`question-${index}`}
                                                        value={option}
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            handleChange(
                                                                index,
                                                                option,
                                                                q.questionType === "checkbox"
                                                            )
                                                        }
                                                        className="hidden"
                                                    />
                                                    <span
                                                        className={`text-base flex-1 ${
                                                            isSelected
                                                                ? "text-indigo-900 font-medium"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {option}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 p-4 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="max-w-4xl mx-auto flex justify-between items-center">
                            <p className="text-sm text-gray-500 hidden sm:block">
                                Make sure to review your answers before submitting.
                            </p>
                            <Button
                                onClick={() => handleSubmit(false)}
                                size="lg"
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 shadow-lg shadow-indigo-200"
                            >
                                Submit Quiz
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizContent;

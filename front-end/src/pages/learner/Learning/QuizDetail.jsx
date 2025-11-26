import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { scoreService } from "@/services/scoreService";
import { ToastHelper } from "@/helper/ToastHelper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, Layers, HelpCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QuizDetail = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?._id;
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                const res = await scoreService.GetQuizByUseridQuizId(userId, quizId);
                if (res.success) {
                    setQuizResult(res.data);
                } else {
                    ToastHelper.error(res.message);
                }
            } catch (err) {
                console.error("❌ Lỗi khi fetch kết quả quiz:", err);
                ToastHelper.error("Failed to load quiz results.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizResult();
    }, [quizId, userId]);

    const location = useLocation();
    const currentLesson = location.state?.currentLesson;

    const handleBack = () => {
        if (location.state?.fromLearning && currentLesson) {
            navigate(`/learning/${quizResult?.scope?.course?.id}`, {
                state: { restoreLesson: currentLesson },
            });
        } else {
            navigate(`/learning/${quizResult?.scope?.course?.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 font-medium">Loading results...</p>
            </div>
        );
    }

    if (!quizResult) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Result not found</h3>
                <p className="text-gray-500">Could not retrieve the results for this quiz.</p>
                <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
                    Go Back
                </Button>
            </div>
        );
    }

    const { score, quiz, scope } = quizResult;
    const isPassed = score.status === "passed";

    return (
        <div className="max-w-4xl mx-auto p-6 pb-12">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 text-gray-500 hover:text-indigo-600 mb-6 pl-0 hover:bg-transparent"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Course
            </Button>

            {/* Header Card */}
            <Card className="mb-8 border-t-4 border-t-indigo-600 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                {quiz?.title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />
                                    <span>Course: {scope.course?.title}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    <span>Module: {scope.module?.title}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`flex flex-col items-end px-4 py-2 rounded-lg border ${
                                isPassed ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
                            }`}
                        >
                            <span className="text-sm font-medium text-gray-500 mb-1">Total Score</span>
                            <div className="flex items-baseline gap-1">
                                <span
                                    className={`text-3xl font-bold ${
                                        isPassed ? "text-green-600" : "text-red-600"
                                    }`}
                                >
                                    {score.score}
                                </span>
                                <span className="text-gray-400 font-medium">/{score.totalPoints}</span>
                            </div>
                            <Badge
                                variant={isPassed ? "success" : "destructive"}
                                className={`mt-1 ${
                                    isPassed
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                            >
                                {isPassed ? "Passed" : "Failed"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 flex gap-3 items-start">
                        <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-indigo-900 text-sm mb-1">Instructor's Remarks</p>
                            <p className="text-indigo-800 text-sm">
                                {score.remarks || "No remarks provided."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Detailed Review
                <Badge variant="secondary" className="ml-2">
                    {score.answers.length} Questions
                </Badge>
            </h2>

            <div className="space-y-6">
                {score.answers.map((ans, index) => (
                    <Card
                        key={index}
                        className={`overflow-hidden border transition-all ${
                            ans.isCorrect ? "border-green-200 shadow-sm" : "border-red-200 shadow-sm"
                        }`}
                    >
                        <div className={`h-1.5 w-full ${ans.isCorrect ? "bg-green-500" : "bg-red-500"}`} />
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        ans.isCorrect
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-lg mb-4">
                                        {ans.question?.questionText || "Question text not available"}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        {ans.question?.options?.map((opt, i) => {
                                            const isSelected = ans.userAnswer?.includes(opt);
                                            const isCorrectAnswer =
                                                ans.question?.correctAnswer?.includes(opt);

                                            let optionStyle = "border-gray-200 bg-white text-gray-700";
                                            let icon = null;

                                            if (isCorrectAnswer) {
                                                optionStyle =
                                                    "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500";
                                                icon = <CheckCircle2 className="w-4 h-4 text-green-600" />;
                                            } else if (isSelected && !ans.isCorrect) {
                                                optionStyle =
                                                    "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500";
                                                icon = <XCircle className="w-4 h-4 text-red-600" />;
                                            } else if (isSelected) {
                                                // Selected and correct (covered by first case usually, but for partials/logic)
                                                optionStyle = "border-blue-500 bg-blue-50 text-blue-900";
                                            }

                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${optionStyle}`}
                                                >
                                                    <span className="font-medium">{opt}</span>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 text-sm border-t border-gray-100 pt-4">
                                        <div className="flex-1">
                                            <span className="text-gray-500 block mb-1">Your Answer:</span>
                                            <span
                                                className={`font-medium ${
                                                    ans.isCorrect ? "text-green-700" : "text-red-700"
                                                }`}
                                            >
                                                {ans.userAnswer?.length > 0
                                                    ? ans.userAnswer.join(", ")
                                                    : "No answer"}
                                            </span>
                                        </div>

                                        {ans.question?.explanation && (
                                            <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-100">
                                                <span className="text-gray-500 block mb-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Explanation:
                                                </span>
                                                <p className="text-gray-700 italic">
                                                    {ans.question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuizDetail;

// src/pages/learner/Learning/QuizResult.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, RefreshCw, Eye, Trophy, Target, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const QuizResult = ({ quiz, latestScore, attempts, onRetake, currentLesson }) => {
    const navigate = useNavigate();

    const handleViewDetail = () => {
        navigate(`/quiz-detail/${quiz.id}`, {
            state: { fromLearning: true, currentLesson },
        });
    };

    const isPassed = latestScore.passed;
    const scorePercentage = latestScore.percentage;
    const passingScore = quiz.passingScore;

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="w-full shadow-xl border-t-4 border-t-indigo-600">
                <CardHeader className="text-center pb-2">
                    <div
                        className={`mx-auto p-4 rounded-full w-fit mb-4 ${
                            isPassed ? "bg-green-100" : "bg-red-100"
                        }`}
                    >
                        {isPassed ? (
                            <Trophy className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        {isPassed ? "Congratulations! You Passed!" : "Keep Trying!"}
                    </CardTitle>
                    <p className="text-gray-500 mt-2 text-lg">
                        {isPassed
                            ? "Great job! You have mastered this topic."
                            : "Don't give up. Review the material and try again."}
                    </p>
                </CardHeader>

                <CardContent className="space-y-8 py-6">
                    {/* Score Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-600">Your Score</span>
                            <span className={isPassed ? "text-green-600" : "text-red-600"}>
                                {scorePercentage}%
                            </span>
                        </div>
                        <Progress
                            value={scorePercentage}
                            className={`h-3 ${isPassed ? "bg-green-100" : "bg-red-100"}`}
                            indicatorClassName={isPassed ? "bg-green-600" : "bg-red-600"}
                        />
                        <p className="text-xs text-gray-500 text-right">
                            Passing score required: {passingScore}%
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <Target className="w-6 h-6 text-indigo-500 mb-2" />
                            <span className="text-sm text-gray-500">Score</span>
                            <span className="text-xl font-bold text-gray-900">
                                {latestScore.score}/{latestScore.totalPoints}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <CheckCircle2
                                className={`w-6 h-6 mb-2 ${isPassed ? "text-green-500" : "text-gray-400"}`}
                            />
                            <span className="text-sm text-gray-500">Status</span>
                            <span
                                className={`text-xl font-bold ${
                                    isPassed ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {isPassed ? "Passed" : "Failed"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <History className="w-6 h-6 text-orange-500 mb-2" />
                            <span className="text-sm text-gray-500">Attempts Left</span>
                            <span className="text-xl font-bold text-gray-900">{attempts.remaining}</span>
                        </div>
                    </div>

                    {/* Message for no attempts */}
                    {!attempts.canRetake && !isPassed && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-800 font-medium">
                                You have used all your attempts for this quiz.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pb-8 pt-2">
                    {attempts.canRetake && (
                        <Button
                            onClick={onRetake}
                            size="lg"
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Retake Quiz
                        </Button>
                    )}
                    <Button
                        onClick={handleViewDetail}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Eye className="mr-2 h-4 w-4" /> View Detailed Results
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default QuizResult;

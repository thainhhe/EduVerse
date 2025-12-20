import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, HelpCircle, Trophy, ArrowLeft } from "lucide-react";
import { completeLesson, uncompleteLesson } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const LearningSidebar = ({ course, onSelectItem, selectedItem, userId, passedQuizzes }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [loadingLessonId, setLoadingLessonId] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (course?.modules?.[0]?._id) {
            setExpandedSections((prev) => ({
                ...prev,
                [course.modules[0]._id]: true,
            }));
        }
    }, [course?._id]);
    const toggleSection = (id) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

    const completedLessons = course.modules.reduce(
        (acc, m) => acc + (m.lessons?.filter((l) => l.user_completed?.includes(userId)).length || 0),
        0
    );
    const totalCourseQuizzes = course.courseQuizzes?.length || 0;
    const completedCourseQuizzes =
        course.courseQuizzes?.filter((q) => passedQuizzes.includes(q._id)).length || 0;
    const totalModuleQuizzes = course.modules.reduce((acc, m) => acc + (m.moduleQuizzes?.length || 0), 0);
    const completedModuleQuizzes = course.modules.reduce(
        (acc, m) => acc + (m.moduleQuizzes?.filter((q) => passedQuizzes.includes(q._id)).length || 0),
        0
    );
    const totalItems = totalLessons + totalModuleQuizzes + totalCourseQuizzes;
    const completedItems = completedLessons + completedModuleQuizzes + completedCourseQuizzes;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const handleLessonToggle = async (e, lesson) => {
        e.stopPropagation();
        if (loadingLessonId) return;

        const isCompleted = lesson.user_completed?.includes(userId);
        setLoadingLessonId(lesson._id);
        setError("");

        try {
            if (!isCompleted) {
                const result = await completeLesson(lesson._id, userId);
                if (result.success) lesson.user_completed = [userId];
                else ToastHelper.error(result.message);
            } else {
                await uncompleteLesson(lesson._id, userId);
                lesson.user_completed = [];
            }
            if (selectedItem?.data?._id === lesson._id) {
                onSelectItem({ type: "lesson", data: lesson });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingLessonId(null);
        }
    };

    const handleBackToCourse = () => {
        navigate(-1);
    };

    return (
        <div className="w-80 flex flex-col border-r border-gray-200 bg-white h-screen shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 cursor-pointer py-2 px-1" onClick={handleBackToCourse}>
                <ArrowLeft className="text-indigo-600" size={17} />
                <span className="text-indigo-600">Back to Course</span>
            </div>
            <div className="px-6 pt-2 border-b border-gray-100 bg-white z-10">
                <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600">{progressPercentage}% Completed</span>
                        <span className="text-indigo-600">
                            {completedItems}/{totalItems} items
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                <div className="py-2">
                    {course.courseQuizzes?.length > 0 && course.courseQuizzes.some((q) => q.isPublished) && (
                        <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Course Assessments
                            </div>
                            {course.courseQuizzes
                                .filter((q) => q.isPublished)
                                .map((quiz) => {
                                    const isSelected = selectedItem?.data?._id === quiz._id;
                                    const isPassed = passedQuizzes.includes(quiz._id);
                                    return (
                                        <button
                                            key={quiz._id}
                                            onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                                                isSelected
                                                    ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {isPassed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <HelpCircle
                                                    className={`w-5 h-5 flex-shrink-0 ${
                                                        isSelected ? "text-indigo-500" : "text-gray-400"
                                                    }`}
                                                />
                                            )}
                                            <span className="text-sm font-medium truncate">{quiz.title}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                    {course.modules.map((module, index) => {
                        const isExpanded = !!expandedSections[module._id];
                        const completedCount =
                            module.lessons?.filter((l) => l.user_completed?.length > 0).length || 0;
                        const totalCount = module.lessons?.length || 0;
                        const isModuleCompleted =
                            completedCount === totalCount &&
                            module.moduleQuizzes?.every((q) => passedQuizzes.includes(q._id));

                        return (
                            <div key={module._id} className="border-b border-gray-100 last:border-0">
                                <button
                                    onClick={() => toggleSection(module._id)}
                                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex-1 pr-4 text-left">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                            {module.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {completedCount}/{totalCount} lessons
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isModuleCompleted && <Trophy className="w-4 h-4 text-amber-500" />}
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="bg-gray-50/50 pb-2">
                                        {module.lessons?.map((lesson) => {
                                            const isSelected = selectedItem?.data?._id === lesson._id;
                                            const isCompleted = lesson.user_completed?.includes(userId);
                                            return (
                                                <div key={lesson._id} className="relative">
                                                    <div
                                                        className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${
                                                            isSelected
                                                                ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600"
                                                                : "text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                        onClick={() =>
                                                            onSelectItem({ type: "lesson", data: lesson })
                                                        }
                                                    >
                                                        <button
                                                            onClick={(e) => handleLessonToggle(e, lesson)}
                                                            className="flex-shrink-0 focus:outline-none"
                                                            disabled={loadingLessonId === lesson._id}
                                                        >
                                                            {loadingLessonId === lesson._id ? (
                                                                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500 hover:text-green-600 transition-colors" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500 transition-colors" />
                                                            )}
                                                        </button>

                                                        <div className="flex-1 min-w-0">
                                                            <p
                                                                className={`text-sm font-medium truncate ${
                                                                    isCompleted ? "text-gray-500" : ""
                                                                }`}
                                                            >
                                                                {lesson.title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {lesson.quizzes?.length > 0 &&
                                                        lesson.quizzes.some((quiz) => quiz.isPublished) && (
                                                            <div className="ml-10 mt-1 space-y-1 mb-2 border-l-2 border-gray-200 pl-2">
                                                                {lesson.quizzes
                                                                    .filter((quiz) => quiz.isPublished)
                                                                    .map((quiz) => {
                                                                        const isQuizSelected =
                                                                            selectedItem?.data?._id ===
                                                                            quiz._id;
                                                                        const isQuizPassed =
                                                                            passedQuizzes.includes(quiz._id);
                                                                        return (
                                                                            <button
                                                                                key={quiz._id}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onSelectItem({
                                                                                        type: "quiz",
                                                                                        data: quiz,
                                                                                    });
                                                                                }}
                                                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                                                                    isQuizSelected
                                                                                        ? "bg-indigo-100 text-indigo-800"
                                                                                        : "text-gray-600 hover:bg-gray-200"
                                                                                }`}
                                                                            >
                                                                                {isQuizPassed ? (
                                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                                ) : (
                                                                                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                                                                                )}
                                                                                <span className="truncate">
                                                                                    {quiz.title}
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                            </div>
                                                        )}
                                                </div>
                                            );
                                        })}
                                        {module.moduleQuizzes?.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <div className="px-6 py-1 text-xs font-semibold text-gray-400 uppercase">
                                                    Module Quiz
                                                </div>
                                                {module.moduleQuizzes.map((quiz) => {
                                                    const isSelected = selectedItem?.data?._id === quiz._id;
                                                    const isPassed = passedQuizzes.includes(quiz._id);
                                                    return (
                                                        <button
                                                            key={quiz._id}
                                                            onClick={() =>
                                                                onSelectItem({ type: "quiz", data: quiz })
                                                            }
                                                            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                                                                isSelected
                                                                    ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {isPassed ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                            ) : (
                                                                <HelpCircle
                                                                    className={`w-5 h-5 flex-shrink-0 ${
                                                                        isSelected
                                                                            ? "text-indigo-500"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                />
                                                            )}
                                                            <span className="text-sm font-medium truncate">
                                                                {quiz.title}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LearningSidebar;

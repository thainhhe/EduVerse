import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { completeLesson, uncompleteLesson } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";

const LearningSidebar = ({ course, onSelectItem, selectedItem, userId, passedQuizzes }) => {
    const [expandedSections, setExpandedSections] = useState({ "0": true });
    const [loadingLessonId, setLoadingLessonId] = useState(null);
    const [error, setError] = useState("");

    const toggleSection = (id) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };


    const totalLessons = course.modules.reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
    );


    const completedLessons = course.modules.reduce(
        (acc, m) =>
            acc + (m.lessons?.filter((l) => l.user_completed?.length > 0).length || 0),
        0
    );

    const totalQuizzes =
        (course.courseQuizzes?.length || 0) +
        course.modules.reduce(
            (acc, m) =>
                acc +
                (m.moduleQuizzes?.length || 0) +
                (m.lessons?.reduce((sum, l) => sum + (l.quizzes?.length || 0), 0)),
            0
        );

    /** Quizzes Completed */
    const completedQuizzes =
        (course.courseQuizzes?.filter((q) => passedQuizzes.includes(q._id)).length || 0) +
        course.modules.reduce(
            (acc, m) =>
                acc +
                (m.moduleQuizzes?.filter((q) => passedQuizzes.includes(q._id)).length || 0) +
                (m.lessons?.reduce(
                    (sum, l) =>
                        sum + (l.quizzes?.filter((q) => passedQuizzes.includes(q._id)).length || 0),
                    0
                )),
            0
        );

    /** Tổng items cho progress */
    const totalItems = totalLessons + totalQuizzes;
    const completedItems = completedLessons + completedQuizzes;

    const progressPercentage =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    /** Toggle Lesson Completion */
    const handleLessonToggle = async (lesson, checked) => {
        if (loadingLessonId) return;

        setLoadingLessonId(lesson._id);
        setError("");

        try {
            if (checked) {
                const result = await completeLesson(lesson._id, userId);
                if (result.success) lesson.user_completed = [userId];
                else ToastHelper.error(result.message);
            } else {
                await uncompleteLesson(lesson._id, userId);
                lesson.user_completed = [];
            }

            onSelectItem({ type: "lesson", data: lesson });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingLessonId(null);
        }
    };

    return (
        <div className="w-80 border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
                <p className="text-sm text-gray-600">{progressPercentage}% Completed</p>
            </div>

            <div className="divide-y divide-gray-200">
                {/* Course Quizzes */}
                {course.courseQuizzes?.length > 0 && (
                    <div className="bg-white border-y border-gray-200">
                        <h3 className="px-4 py-2 font-semibold text-gray-800 border-b">Course Quizzes</h3>

                        {course.courseQuizzes.map((quiz) => (
                            <button
                                key={quiz._id}
                                onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                className={`w-full flex items-center gap-3 px-6 py-2 hover:bg-gray-100 ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={passedQuizzes.includes(quiz._id)}
                                    disabled
                                // className="w-4 h-4 accent-green-500"
                                />
                                <span className="text-sm text-gray-700">{quiz.title}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Modules */}
                {course.modules.map((module) => {
                    const moduleCompleted =
                        module.lessons.every((l) => l.user_completed?.length > 0) &&
                        module.moduleQuizzes?.every((q) => passedQuizzes.includes(q._id));

                    return (
                        <div key={module._id} className="bg-white">
                            <button
                                onClick={() => toggleSection(module._id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100"
                            >
                                <span>
                                    <p className="text-sm font-medium text-gray-900">{module.title}</p>
                                    <p className="text-xs text-gray-500">
                                        {module.lessons?.filter((l) => l.user_completed?.length > 0).length}/{module.lessons?.length}
                                    </p>
                                </span>

                                {moduleCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <ChevronDown
                                        className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </button>

                            {expandedSections[module._id] && (
                                <div className="bg-gray-50 border-t">
                                    {module.lessons?.map((lesson) => (
                                        <div key={lesson._id} className="border-b last:border-0">
                                            <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={lesson.user_completed?.length > 0}
                                                    disabled={loadingLessonId === lesson._id}
                                                    onChange={(e) => handleLessonToggle(lesson, e.target.checked)}
                                                />

                                                <button
                                                    onClick={() => onSelectItem({ type: "lesson", data: lesson })}
                                                    className={`flex-1 text-left ${selectedItem?.data?._id === lesson._id ? "bg-gray-200" : ""
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                                                    <p className="text-xs text-gray-500">{lesson.type}</p>
                                                </button>
                                            </div>

                                            {/* Lesson Quizzes */}
                                            {lesson.quizzes?.length > 0 && (
                                                <div className="pl-8 pr-4 py-2 bg-gray-50">
                                                    {lesson.quizzes.map((quiz) => (
                                                        <button
                                                            key={quiz._id}
                                                            onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                                            className={`w-full flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm ${selectedItem?.data?._id === quiz._id
                                                                ? "bg-indigo-50 text-indigo-600"
                                                                : ""
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={passedQuizzes.includes(quiz._id)}
                                                                readOnly
                                                            />
                                                            <span>{quiz.title}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Module Quizzes */}
                                    {module.moduleQuizzes?.length > 0 && (
                                        <div className="pl-8 pr-4 py-2 bg-gray-50">
                                            {module.moduleQuizzes.map((quiz) => (
                                                <button
                                                    key={quiz._id}
                                                    onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                                    className={`w-full flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm ${selectedItem?.data?._id === quiz._id
                                                        ? "bg-indigo-50 text-indigo-600"
                                                        : ""
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={passedQuizzes.includes(quiz._id)}
                                                        disabled
                                                    />
                                                    <span>{quiz.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LearningSidebar;

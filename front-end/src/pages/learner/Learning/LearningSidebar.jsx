import { useState } from "react";
import { ChevronDown, Circle, CheckCircle2 } from "lucide-react";

const LearningSidebar = ({ course, onSelectItem, selectedItem }) => {
    const [expandedSections, setExpandedSections] = useState({ "0": true });

    const toggleSection = (id) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalLessons = course.modules.reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
    );
    const completedLessons = course.modules.reduce(
        (acc, m) => acc + (m.lessons?.filter((l) => l.user_completed?.length > 0).length || 0),
        0
    );
    const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="w-80 border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
                <p className="text-sm text-gray-600">{progressPercentage}% Completed</p>
            </div>

            <div className="divide-y divide-gray-200">
                {/* Course-level quizzes */}
                {course.courseQuizzes?.length > 0 && (
                    <div className="bg-white border-y border-gray-200">
                        <h3 className="px-4 py-2 font-semibold text-gray-800 border-b">
                            Course Quizzes
                        </h3>
                        {course.courseQuizzes.map((quiz) => (
                            <button
                                key={quiz._id}
                                onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                className={`w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center justify-between ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                                    }`}
                            >
                                <span className="text-sm text-gray-700">{quiz.title}</span>
                                <Circle className="w-4 h-4 text-gray-400" />
                            </button>
                        ))}
                    </div>
                )}

                {course.modules.map((module) => (
                    <div key={module._id} className="bg-white">
                        {/* Module Header */}
                        <button
                            onClick={() => toggleSection(module._id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-left">
                                <p className="text-sm font-medium text-gray-900">
                                    {module.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {module.lessons?.filter((l) => l.user_completed?.length > 0).length || 0}/
                                    {module.lessons?.length || 0}
                                </p>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {/* Lessons + Quizzes */}
                        {expandedSections[module._id] && (
                            <div className="bg-gray-50 border-t border-gray-200">
                                {module.lessons?.map((lesson) => (
                                    <button
                                        key={lesson._id}
                                        onClick={() => onSelectItem({ type: "lesson", data: lesson })}
                                        className={`w-full flex items-start gap-3 px-4 py-2 hover:bg-gray-100 ${selectedItem?.data?._id === lesson._id ? "bg-gray-100" : ""
                                            }`}
                                    >
                                        {lesson.user_completed?.length > 0 ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-gray-400 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm text-gray-800">{lesson.title}</p>
                                            <p className="text-xs text-gray-500">{lesson.type}</p>
                                        </div>
                                    </button>
                                ))}

                                {/* Module-level Quizzes */}
                                {module.moduleQuizzes?.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-600 font-medium mb-1">
                                            Module Quizzes
                                        </p>
                                        {module.moduleQuizzes.map((quiz) => (
                                            <button
                                                key={quiz._id}
                                                onClick={() => onSelectItem({ type: "quiz", data: quiz })}
                                                className={`w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-2 ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                                                    }`}
                                            >
                                                <Circle className="w-3 h-3 text-gray-400" />
                                                {quiz.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearningSidebar;

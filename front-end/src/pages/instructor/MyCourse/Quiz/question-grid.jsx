import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";

export function QuestionGrid({ questions, onDeleteQuestion }) {
    return (
        <div className="space-y-2">
            <div className="w-full">
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-sm border border-dashed border-gray-300">
                        <p className="text-sm">No questions yet. Create one to get started!</p>
                    </div>
                ) : (
                    questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="bg-white border border-gray-200 rounded-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                        >
                            <div className="p-4 space-y-4">
                                {/* Question Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                                {index + 1}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs rounded-sm border-gray-300"
                                            >
                                                {question.type === "multiple-choice"
                                                    ? "Multiple Choice"
                                                    : question.type === "checkbox"
                                                    ? "Multiple Answers"
                                                    : "True/False"}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-800 font-medium leading-relaxed">
                                            {question.text}
                                        </p>
                                    </div>
                                </div>

                                {/* Answer Options */}
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Answer Options
                                    </p>
                                    {question.options?.map((option, optIndex) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-3 text-sm rounded-sm py-2.5 px-3 border transition-colors ${
                                                option.isCorrect
                                                    ? "bg-green-50 border-green-300 text-green-800"
                                                    : "bg-gray-50 border-gray-200 text-gray-700"
                                            }`}
                                        >
                                            {option.isCorrect ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span className="flex-1">{option.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation (if any) */}
                                {question.explanation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-3">
                                        <p className="text-xs font-medium text-blue-700 mb-1">Explanation</p>
                                        <p className="text-sm text-blue-900">{question.explanation}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2 border-t border-gray-200">
                                    <ConfirmationHelper
                                        trigger={
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-sm transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                                            </Button>
                                        }
                                        onConfirm={() => onDeleteQuestion(question.id)}
                                        title="Delete Question"
                                        message="Are you sure you want to delete this question? This action cannot be undone."
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

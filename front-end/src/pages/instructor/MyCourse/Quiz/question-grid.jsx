"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case "Easy":
            return "bg-emerald-100 text-emerald-800";
        case "Medium":
            return "bg-amber-100 text-amber-800";
        case "Hard":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export function QuestionGrid({ questions, onDeleteQuestion, onEditQuestion }) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Existing Questions</h2>
                <p className="text-sm text-muted-foreground">
                    View and edit questions with their answer options
                </p>
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        No questions yet. Create one to get started!
                    </div>
                ) : (
                    questions.map((question) => (
                        <div
                            key={question.id}
                            className="hover:shadow-md transition-shadow cursor-pointer border border-gray-400 rounded-md"
                        >
                            <div className="p-4 space-y-4">
                                {/* Question ID and Badge */}
                                <div className="flex items-center gap-2">
                                    {question.id} ({question.type}) : {question.text}
                                </div>

                                {/* Answer Options */}
                                <div className="space-y-1">
                                    {question.options?.map((option) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-2 text-sm rounded-md py-1 ${
                                                option.isCorrect
                                                    ? "bg-emerald-50 text-emerald-800"
                                                    : "bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            {option.isCorrect ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span>{option.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation (if any) */}
                                {question.explanation && (
                                    <p className="text-xs text-muted-foreground italic">
                                        Explanation: {question.explanation}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-destructive hover:text-destructive/80"
                                    onClick={() => onDeleteQuestion(question.id)}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

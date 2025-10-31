"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, CheckCircle2, Circle } from "lucide-react"

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case "Easy":
            return "bg-emerald-100 text-emerald-800"
        case "Medium":
            return "bg-amber-100 text-amber-800"
        case "Hard":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export function QuestionGrid({ questions, onDeleteQuestion, onEditQuestion }) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Existing Questions</h2>
                <p className="text-sm text-muted-foreground">
                    View and edit questions with their answer options
                </p>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {questions.length === 0 ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                            No questions yet. Create one to get started!
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question) => (
                        <Card
                            key={question.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <CardContent className="p-4 space-y-4">
                                {/* Question ID and Badge */}
                                <div className="flex items-start justify-between gap-2">
                                    <span className="inline-block rounded-full bg-purple-200 px-3 py-1 text-xs font-semibold text-purple-800">
                                        {question.id}
                                    </span>
                                    <Badge className={getDifficultyColor(question.difficulty)}>
                                        {question.difficulty}
                                    </Badge>
                                </div>

                                {/* Question Text */}
                                <p className="text-sm font-medium text-foreground">{question.text}</p>

                                {/* Answer Options */}
                                <div className="space-y-1 pl-2">
                                    {question.options?.map((option) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${option.isCorrect
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
                                        💡 {question.explanation}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="flex-1 text-muted-foreground hover:text-foreground"
                                        onClick={() => onEditQuestion(question.id, question)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="flex-1 text-destructive hover:text-destructive/80"
                                        onClick={() => onDeleteQuestion(question.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

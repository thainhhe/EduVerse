"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { ToastHelper } from "@/helper/ToastHelper";

export function QuestionForm({ onAddQuestion }) {
    const [text, setText] = useState("");
    const [type, setType] = useState("multiple-choice");
    const [difficulty, setDifficulty] = useState("Easy");
    const [options, setOptions] = useState([
        { id: "1", text: "Option 1", isCorrect: false },
        { id: "2", text: "Option 2", isCorrect: false },
        { id: "3", text: "Option 3", isCorrect: false },
        { id: "4", text: "Option 4", isCorrect: false },
    ]);
    const [explanation, setExplanation] = useState("");

    // Validation state
    const [errors, setErrors] = useState({
        text: "",
        options: [],
    });
    const [correctError, setCorrectError] = useState("");


    // ======================
    // Auto-reset options
    // ======================
    useEffect(() => {
        if (type === "true-false") {
            setOptions([
                { id: "1", text: "True", isCorrect: false },
                { id: "2", text: "False", isCorrect: false },
            ]);
        } else {
            setOptions([
                { id: "1", text: "Option 1", isCorrect: false },
                { id: "2", text: "Option 2", isCorrect: false },
                { id: "3", text: "Option 3", isCorrect: false },
                { id: "4", text: "Option 4", isCorrect: false },
            ]);
        }
    }, [type]);

    // ======================
    // Handlers
    // ======================

    const handleAddOption = () => {
        const newId = String(Math.max(...options.map((o) => parseInt(o.id)), 0) + 1);
        setOptions([...options, { id: newId, text: `Option ${options.length + 1}`, isCorrect: false }]);
    };

    const handleRemoveOption = (id) => {
        if (options.length > 2 && type !== "true-false") {
            setOptions(options.filter((o) => o.id !== id));
        }
    };

    const handleOptionChange = (id, field, value) => {
        if ((type === "multiple-choice" || type === "true-false") && field === "isCorrect" && value === true) {
            setOptions(options.map((o) => ({ ...o, isCorrect: o.id === id })));
        } else {
            setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate question text
        let textError = "";
        if (!text.trim()) textError = "Question text is required.";
        else if (text.trim().length > 200) textError = "Maximum 200 characters allowed.";

        // Validate options
        const optionsError = options.map((o) => (!o.text.trim() ? "Option text is required" : ""));

        // Validate at least one correct option
        const hasCorrect = options.some((o) => o.isCorrect);
        if (!hasCorrect) {
            setCorrectError("You must select at least 1 correct answer.");
        } else {
            setCorrectError("");
        }
        setErrors({ text: textError, options: optionsError });

        if (textError || optionsError.some((err) => err) || !hasCorrect) return;

        const newQuestion = { id: "", text, type, difficulty, options, explanation };
        onAddQuestion(newQuestion);

        // Reset form
        setText("");
        setType("multiple-choice");
        setDifficulty("Easy");
        setOptions([
            { id: "1", text: "Option 1", isCorrect: false },
            { id: "2", text: "Option 2", isCorrect: false },
            { id: "3", text: "Option 3", isCorrect: false },
            { id: "4", text: "Option 4", isCorrect: false },
        ]);
        setExplanation("");
        setErrors({ text: "", options: [] });
    };

    // ======================
    // UI
    // ======================
    return (
        <Card className="sticky top-6 h-fit">
            <CardHeader>
                <CardTitle>
                    Add New Question <span className="text-red-500">*</span>
                </CardTitle>
                <CardDescription>Fill in the details to create a new quiz question.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Question Text */}
                    <div className="space-y-2">
                        <Label>
                            Question Text <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="Enter your question here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className={`min-h-20 resize-none ${errors.text ? " border-red-500" : ""}`}
                        />
                        {errors.text && <p className="text-red-500 text-xs">{errors.text}</p>}
                    </div>

                    {/* Question Type */}
                    <div className="space-y-2">
                        <Label>
                            Question Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                <SelectItem value="checkbox">Checkbox (Multiple Answers)</SelectItem>
                                <SelectItem value="true-false">True / False</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                        <Label>
                            Answer Options <span className="text-red-500">*</span>
                        </Label>
                        {options.length === 0 && errors.options[0] && (
                            <p className="text-red-500 text-sm">{errors.options[0]}</p>
                        )}

                        {options.map((option, idx) => (
                            <div key={option.id} className="space-y-1">
                                <div className="flex items-center gap-2">

                                    {/* Checkbox hoặc radio */}
                                    {type === "checkbox" ? (
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) =>
                                                handleOptionChange(option.id, "isCorrect", e.target.checked)
                                            }
                                            className="h-4 w-4 accent-indigo-600 cursor-pointer"
                                        />
                                    ) : (
                                        <input
                                            type="radio"
                                            name="correct-option"
                                            checked={option.isCorrect}
                                            onChange={(e) =>
                                                handleOptionChange(option.id, "isCorrect", e.target.checked)
                                            }
                                            className="h-4 w-4 accent-indigo-600"
                                        />
                                    )}

                                    {/* Input Option */}
                                    <Input
                                        placeholder="Option text"
                                        value={option.text}
                                        onChange={(e) =>
                                            handleOptionChange(option.id, "text", e.target.value)
                                        }
                                        className={`flex-1 ${errors.options[idx] ? "bg-red-100 border border-red-500" : ""
                                            }`}
                                        disabled={type === "true-false"}
                                    />

                                    {/* Nút xóa */}
                                    {type !== "true-false" && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(option.id)}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {/* Hiển thị lỗi option */}
                                {errors.options[idx] && (
                                    <p className="text-orange-600 text-xs ml-7">{errors.options[idx]}</p>
                                )}
                            </div>
                        ))}



                        {type !== "true-false" && (
                            <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="w-full bg-transparent">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        )}
                    </div>
                    {correctError && (
                        <p className="text-red-500 text-xs">{correctError}</p>
                    )}

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                        <Label>Explanation / Feedback</Label>
                        <Textarea
                            placeholder="Provide a detailed explanation or feedback for the question"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="min-h-16 resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-800">
                            Add Question
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setText("");
                                setType("multiple-choice");
                                setDifficulty("Easy");
                                setOptions([
                                    { id: "1", text: "Option 1", isCorrect: false },
                                    { id: "2", text: "Option 2", isCorrect: false },
                                    { id: "3", text: "Option 3", isCorrect: false },
                                    { id: "4", text: "Option 4", isCorrect: false },
                                ]);
                                setExplanation("");
                                setErrors({ text: "", options: [] });
                            }}
                        >
                            Clear Form
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

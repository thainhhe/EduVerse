import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

    // ======================
    // TỰ ĐỘNG RESET OPTIONS
    // ======================
    useEffect(() => {
        if (type === "true-false") {
            setOptions([
                { id: "1", text: "True", isCorrect: false },
                { id: "2", text: "False", isCorrect: false },
            ]);
        } else if (type === "multiple-choice") {
            setOptions([
                { id: "1", text: "Option 1", isCorrect: false },
                { id: "2", text: "Option 2", isCorrect: false },
                { id: "3", text: "Option 3", isCorrect: false },
                { id: "4", text: "Option 4", isCorrect: false },
            ]);
        } else if (type === "checkbox") {
            setOptions([
                { id: "1", text: "Option 1", isCorrect: false },
                { id: "2", text: "Option 2", isCorrect: false },
                { id: "3", text: "Option 3", isCorrect: false },
                { id: "4", text: "Option 4", isCorrect: false },
            ]);
        }
    }, [type]);

    // ======================
    // HANDLERS
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
        // Nếu là multiple-choice hoặc true/false → chỉ chọn được 1 đúng
        if (
            (type === "multiple-choice" || type === "true-false") &&
            field === "isCorrect" &&
            value === true
        ) {
            setOptions(options.map((o) => ({ ...o, isCorrect: o.id === id })));
        }
        // Nếu là checkbox → có thể chọn nhiều đúng
        else {
            setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !options.some((o) => o.isCorrect)) {
            ToastHelper.error("Please fill in all required fields and select at least one correct answer.");
            return;
        }

        const newQuestion = {
            id: "",
            text,
            type,
            difficulty,
            options,
            explanation,
        };

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
    };

    // ======================
    // UI
    // ======================
    return (
        <Card className="sticky top-6 h-fit">
            <CardHeader>
                <CardTitle>Add New Question</CardTitle>
                <CardDescription>Fill in the details to create a new quiz question.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Question Text */}
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                            placeholder="Enter your question here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-14 resize-y bg-gray-200 whitespace-pre-wrap break-all"
                        />
                    </div>

                    {/* Question Type */}
                    <div className="space-y-2">
                        <Label>Question Type</Label>
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
                        <Label>Answer Options</Label>

                        {options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2">
                                {/* Checkbox hoặc Radio tùy theo type */}
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

                                {/* Ô nhập text */}
                                <Input
                                    placeholder="Option text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, "text", e.target.value)}
                                    className={`flex-1 border border-gray-300 ${option.isCorrect ? "bg-green-200" : "bg-gray-200"
                                        }`}
                                    disabled={type === "true-false"} // true/false thì không chỉnh sửa text
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
                        ))}

                        {/* Nút thêm option */}
                        {type !== "true-false" && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddOption}
                                className="w-full bg-transparent"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        )}
                    </div>

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
                        <Button type="submit" className="flex-1">
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

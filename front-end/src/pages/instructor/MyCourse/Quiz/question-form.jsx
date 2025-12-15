import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { ToastHelper } from "@/helper/ToastHelper";

export function QuestionForm({ onAddQuestion }) {
    const [text, setText] = useState("");
    const [type, setType] = useState("multiple-choice");
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
            setOptions(options.map((o) => ({ ...o, isCorrect: o.id.toString() === id.toString() })));
        }
        // Nếu là checkbox → có thể chọn nhiều đúng
        else {
            setOptions(
                options.map((o) => (o.id.toString() === id.toString() ? { ...o, [field]: value } : o))
            );
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
            options,
            explanation,
        };

        onAddQuestion(newQuestion);

        // Reset form
        setText("");
        setType("multiple-choice");
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
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-gray-800">New Question</h2>
                        <select
                            className="border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="checkbox">Checkbox (Multiple Answers)</option>
                            <option value="true-false">True / False</option>
                        </select>
                    </div>
                    <Textarea
                        placeholder="Enter your question here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-20 resize-y bg-white border-gray-300 rounded-sm whitespace-pre-wrap break-all focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Answer Options</Label>
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-sm border border-gray-200"
                            >
                                {type === "checkbox" ? (
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) =>
                                            handleOptionChange(option.id, "isCorrect", e.target.checked)
                                        }
                                        className="h-4 w-4 accent-indigo-600 cursor-pointer rounded-sm"
                                    />
                                ) : (
                                    <input
                                        type="radio"
                                        name="correct-option"
                                        checked={option.isCorrect}
                                        onChange={(e) =>
                                            handleOptionChange(option.id, "isCorrect", e.target.checked)
                                        }
                                        className="h-4 w-4 accent-indigo-600 cursor-pointer"
                                    />
                                )}

                                <Input
                                    placeholder="Option text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, "text", e.target.value)}
                                    className={`flex-1 border-gray-300 rounded-sm transition-all ${
                                        option.isCorrect
                                            ? "bg-green-50 border-green-400 focus:ring-green-500"
                                            : "bg-white focus:ring-indigo-500"
                                    }`}
                                    disabled={type === "true-false"}
                                />

                                {type !== "true-false" && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(option.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {type !== "true-false" && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddOption}
                            className="w-full bg-white hover:bg-gray-50 rounded-sm border-dashed border-gray-300 hover:border-indigo-400 transition-all"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                        </Button>
                    )}
                </div>
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Explanation / Feedback</Label>
                    <Textarea
                        placeholder="Provide a detailed explanation or feedback for the question"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        className="min-h-20 resize-none bg-white border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm"
                    >
                        Add Question
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-sm"
                        onClick={() => {
                            setText("");
                            setType("multiple-choice");
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
        </div>
    );
}

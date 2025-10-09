"use client"

import { useState } from "react"

export default function PracticeTest() {
    const questions = [
        {
            id: "q1",
            title: "What is the primary purpose of a database index?",
            type: "radio",
            options: [
                "To encrypt sensitive data",
                "To speed up data retrieval operations",
                "To manage user authentication",
                "To compress database backups",
            ],
            borderColor: "border-gray-200",
        },
        {
            id: "q2",
            title: "Which of the following are benefits of using version control systems like Git?",
            type: "checkbox",
            options: [
                "Tracking changes to code over time",
                "Facilitating collaboration among developers",
                "Automating deployment to production servers",
                "Enabling easy rollback to previous states",
            ],
            borderColor: "border-gray-200",
        },
        {
            id: "q3",
            title: "Select the languages commonly used for front-end web development:",
            type: "checkbox",
            options: ["Python", "HTML", "CSS", "JavaScript"],
            borderColor: "border-indigo-300",
        },
        {
            id: "q4",
            title: "Which data structure follows a Last-In, First-Out (LIFO) principle?",
            type: "radio",
            options: ["Queue", "Tree", "Stack", "Linked List"],
            borderColor: "border-gray-200",
        },
    ]

    const initialAnswers = questions.reduce((acc, q) => {
        acc[q.id] = q.type === "checkbox" ? [] : ""
        return acc
    })

    const [answers, setAnswers] = useState(initialAnswers)

    const handleRadioChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }

    const handleCheckboxChange = (questionId, value) => {
        setAnswers((prev) => {
            const current = prev[questionId]
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value]
            return { ...prev, [questionId]: updated }
        })
    }

    const handleSubmit = () => {
        const formattedAnswers = questions.map((q) => ({
            questionId: q.id,
            questionTitle: q.title,
            type: q.type,
            answer: answers[q.id], // string hoặc array
        }));

        console.log("🧾 Data gửi BE:", formattedAnswers);

        // Gửi sang backend
        fetch("http://localhost:5000/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: formattedAnswers }),
        })
            .then((res) => res.json())
            .then((result) => {
                console.log("✅ Server trả về:", result);
                alert("Nộp bài thành công!");
            })
            .catch((err) => console.error("❌ Lỗi khi gửi:", err));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-8">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    Welcome to the Practice Test!
                                </h1>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Sharpen your knowledge with our comprehensive practice test.
                                    Choose the best answer(s) for each question below and click
                                    submit to view your results.
                                </p>
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
                                    View Instructions
                                </button>
                            </div>
                            <div className="hidden md:block">
                                <img
                                    src="./Selection.png"
                                    alt="Study materials"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Render Questions */}
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        className={`bg-white rounded-lg border ${q.borderColor} p-8 mb-6`}
                    >
                        <div className="text-sm text-gray-500 mb-2">
                            Question {index + 1}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            {q.title}
                        </h2>
                        <div className="space-y-4">
                            {q.options.map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <input
                                        type={q.type}
                                        name={q.id}
                                        value={option}
                                        checked={
                                            q.type === "radio"
                                                ? answers[q.id] === option
                                                : (answers[q.id]).includes(option)
                                        }
                                        onChange={(e) =>
                                            q.type === "radio"
                                                ? handleRadioChange(q.id, e.target.value)
                                                : handleCheckboxChange(q.id, option)
                                        }
                                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span className="text-gray-700 group-hover:text-gray-900">
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-base font-medium transition-colors"
                    >
                        Submit Answers
                    </button>
                </div>
            </main>
        </div>
    )
}

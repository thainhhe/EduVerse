import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    CalendarDays, ChevronDown, ChevronRight, Eye, Grip, Pencil, Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuizManager from "../Quiz/quiz-manager";

const AssignmentsPage = () => {

    const data = [
        {
            id: "course1",
            name: "Frontend Development",
            modules: [
                {
                    id: "module1",
                    name: "React Basics",
                    lessons: [
                        {
                            id: "lesson1",
                            name: "Components & Props",
                            quizzes: [
                                { id: 1, title: "Quiz 1", course: "React", details: "5 questions | 10 pts", dueDate: "Oct 30, 2025" },
                                { id: 2, title: "Quiz 2", course: "React", details: "10 questions | 15 pts", dueDate: "Nov 10, 2025" },
                            ],
                        },
                        {
                            id: "lesson2",
                            name: "State & Lifecycle",
                            quizzes: [
                                { id: 3, title: "Quiz 3", course: "React", details: "8 questions | 12 pts", dueDate: "Nov 25, 2025" },
                            ],
                        },
                    ],
                },
                {
                    id: "module2",
                    name: "Advanced Topics",
                    lessons: [
                        {
                            id: "lesson3",
                            name: "Hooks Overview",
                            quizzes: [
                                { id: 4, title: "Quiz 4", course: "React", details: "6 questions | 10 pts", dueDate: "Dec 5, 2025" },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: "course2",
            name: "Backend Development",
            modules: [
                {
                    id: "module3",
                    name: "Node.js Fundamentals",
                    lessons: [
                        {
                            id: "lesson4",
                            name: "Express Basics",
                            quizzes: [
                                { id: 5, title: "Quiz 1", course: "Node.js", details: "5 questions | 10 pts", dueDate: "Oct 20, 2025" },
                            ],
                        },
                    ],
                },
            ],
        },
    ];


    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedLesson, setSelectedLesson] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("add");
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Derived data
    const courses = data;
    const modules = selectedCourse
        ? data.find(c => c.id === selectedCourse)?.modules || []
        : [];
    const lessons = selectedModule
        ? modules.find(m => m.id === selectedModule)?.lessons || []
        : [];
    const quizzes = selectedLesson
        ? lessons.find(l => l.id === selectedLesson)?.quizzes || []
        : [];

    const handleAdd = () => {
        setDialogMode("add");
        setSelectedAssignment(null);
        setOpenDialog(true);
    };

    const handleEdit = (assignment) => {
        setDialogMode("edit");
        setSelectedAssignment(assignment);
        setOpenDialog(true);
    };

    const handleSubmit = (data) => {
        if (dialogMode === "add") console.log("Adding new assignment:", data);
        else console.log("Updating assignment:", data);
    };


    return (
        <div className="mx-auto max-w-5xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded bg-indigo-500" />
                            Assignments
                        </div>
                    </div>
                </CardHeader>

                {/* FILTER SECTION */}
                <div className="px-6 py-2 flex flex-wrap items-center gap-4 bg-gray-50 border-t">
                    <select
                        className="border rounded-md px-3 py-2 text-sm w-52"
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedModule("");
                            setSelectedLesson("");
                        }}
                    >
                        <option value="">-- Select Course --</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded-md px-3 py-2 text-sm w-52"
                        value={selectedModule}
                        onChange={(e) => {
                            setSelectedModule(e.target.value);
                            setSelectedLesson("");
                        }}
                        disabled={!selectedCourse}
                    >
                        <option value="">-- Select Module --</option>
                        {modules.map(module => (
                            <option key={module.id} value={module.id}>{module.name}</option>
                        ))}
                    </select>

                    <select
                        className="border rounded-md px-3 py-2 text-sm w-52"
                        value={selectedLesson}
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        disabled={!selectedModule}
                    >
                        <option value="">-- Select Lesson --</option>
                        {lessons.map(lesson => (
                            <option key={lesson.id} value={lesson.id}>{lesson.name}</option>
                        ))}
                    </select>
                </div>

                <CardContent>
                    {selectedLesson ? (
                        <div className="mt-5 border rounded-xl p-4 shadow-sm bg-white">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 mb-4 font-bold">
                                    <ChevronDown className="h-6 w-6 text-muted-foreground" />
                                    Quizzes ({quizzes.length})
                                </div>

                                <div>
                                    <Button
                                        variant="outline"
                                        className={`border-2 ${selectedLesson ? "border-indigo-600 text-indigo-600" : "border-gray-300 text-gray-400 cursor-not-allowed"}`}
                                        onClick={() => {
                                            if (!selectedLesson) return alert("Please select a lesson before adding a quiz.");
                                            handleAdd();
                                        }}
                                        disabled={!selectedLesson}
                                    >
                                        + Quiz
                                    </Button>


                                    {/* <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                        <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Quiz Builder</DialogTitle>
                                            </DialogHeader>
                                      
                                            <QuizManager
                                                courseId={selectedCourse}
                                                moduleId={selectedModule}
                                                lessonId={selectedLesson}
                                            />

                                        </DialogContent>
                                    </Dialog> */}
                                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                        <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {dialogMode === "add" ? "Create New Quiz" : "Edit Quiz"}
                                                </DialogTitle>
                                            </DialogHeader>

                                            <QuizManager
                                                mode={dialogMode}
                                                quizData={selectedAssignment}
                                                courseId={selectedCourse}
                                                moduleId={selectedModule}
                                                lessonId={selectedLesson}
                                                onClose={() => setOpenDialog(false)}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-center">Due Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizzes.map((quiz) => (
                                        <TableRow key={quiz.id}>
                                            <TableCell>
                                                <Grip className="h-5 w-5 text-gray-400" />
                                            </TableCell>
                                            <TableCell className="text-indigo-600 hover:underline cursor-pointer">
                                                {quiz.title}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{quiz.course}</span>
                                                    <span className="text-sm text-gray-500">{quiz.details}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center text-green-600 bg-gray-100 font-bold rounded-2xl py-1 px-3 w-fit mx-auto">
                                                    <CalendarDays className="h-4 w-4 mr-1" />
                                                    {quiz.dueDate}
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(quiz)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-5 text-center">
                            Select a course, module, and lesson to view quizzes.
                        </p>
                    )}
                </CardContent>

                <div className="mt-8 flex items-center justify-between mx-5 my-2">
                    <Button variant="ghost" className="gap-2 bg-gray-100">
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back
                    </Button>
                    <Button variant="ghost" className="gap-2 text-indigo-600 bg-gray-100">
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AssignmentsPage;

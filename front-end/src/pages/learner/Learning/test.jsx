"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Play, Star, Users, Clock, CheckCircle2, Circle } from "lucide-react"

interface Lesson {
    _id: string
    title: string
    type: string
    order: number
    content: string
    user_completed: string[]
}

interface Module {
    _id: string
    title: string
    description: string
    order: number
    lessons: Lesson[]
}

interface CourseData {
    courseId: {
        _id: string
        title: string
        description: string
        rating: number
        price: number
        thumbnail: string
        totalEnrollments: number
        modules: Module[]
    }
    userId: {
        username: string
        email: string
    }
    progress: number
    completedQuizzes: number
    totalQuizzes: number
}

interface ExpandedSections {
    [key: string]: boolean
}

export default function CoursePage() {
    const [courseData, setCourseData] = useState < CourseData | null > (null)
    const [expandedSections, setExpandedSections] = useState < ExpandedSections > ({ "0": true })
    const [selectedLesson, setSelectedLesson] = useState < Lesson | null > (null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState < string | null > (null)

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await fetch(
                    "http://localhost:9999/api/v1/enrollment/user/68ff2ba33995c7cfae819bb2/course/68ff2cc83995c7cfae819bbb/detail",
                )
                const result = await response.json()
                if (result.data) {
                    setCourseData(result.data)
                    // Set first lesson as selected by default
                    if (result.data.courseId.modules.length > 0 && result.data.courseId.modules[0].lessons.length > 0) {
                        setSelectedLesson(result.data.courseId.modules[0].lessons[0])
                    }
                }
            } catch (err) {
                setError("Failed to load course data")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourseData()
    }, [])

    const toggleSection = (moduleId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-lg">Loading course...</div>
            </div>
        )
    }

    if (error || !courseData) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-red-400 text-lg">{error || "Course not found"}</div>
            </div>
        )
    }

    const course = courseData.courseId
    const modules = course.modules || []
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    const completedLessons = modules.reduce(
        (acc, m) => acc + (m.lessons?.filter((l) => l.user_completed?.length > 0).length || 0),
        0,
    )
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <h1 className="text-lg font-semibold text-white truncate">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">Your progress</span>
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-amber-400">
                            {progressPercentage}%
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Video Player Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 flex items-center justify-center relative overflow-hidden">
                        {/* Video placeholder with pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="grid grid-cols-8 h-full">
                                {Array(64)
                                    .fill(null)
                                    .map((_, i) => (
                                        <div key={i} className="border border-slate-400/20" />
                                    ))}
                            </div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-slate-900/90 flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer">
                                <Play className="w-10 h-10 text-white fill-white" />
                            </div>
                            <p className="text-slate-900 font-medium mt-4">Click to play video</p>
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className="bg-slate-900 border-t border-slate-800 px-6 py-4">
                        <h2 className="text-xl font-bold text-white mb-2">{selectedLesson?.title || "Select a lesson"}</h2>
                        <p className="text-slate-400 text-sm">{selectedLesson?.content || course.description}</p>
                    </div>
                </div>

                {/* Course Sidebar */}
                <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4">
                            <h3 className="font-semibold text-white text-sm">Course content</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                {completedLessons} of {totalLessons} completed
                            </p>
                        </div>

                        <div className="divide-y divide-slate-800">
                            {modules.map((module, moduleIndex) => (
                                <div key={module._id} className="bg-slate-900">
                                    <button
                                        onClick={() => toggleSection(module._id)}
                                        className="w-full px-4 py-3 flex items-start justify-between hover:bg-slate-800/50 transition-colors group"
                                    >
                                        <span className="flex-1 text-left">
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white">{module.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {module.lessons?.filter((l) => l.user_completed?.length > 0).length || 0}/
                                                {module.lessons?.length || 0}
                                            </p>
                                        </span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-slate-500 mt-1 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {expandedSections[module._id] && (
                                        <div className="bg-slate-800/30 border-t border-slate-800">
                                            {module.lessons?.map((lesson) => (
                                                <button
                                                    key={lesson._id}
                                                    onClick={() => setSelectedLesson(lesson)}
                                                    className="w-full px-6 py-2.5 hover:bg-slate-800/50 transition-colors flex items-start gap-3 group"
                                                >
                                                    {lesson.user_completed?.length > 0 ? (
                                                        <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-slate-500" />
                                                    )}
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p
                                                            className={`text-sm ${lesson.user_completed?.length > 0
                                                                ? "text-slate-500"
                                                                : "text-slate-300 group-hover:text-white"
                                                                }`}
                                                        >
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-xs text-slate-600">{lesson.type}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Overview Section */}
            <div className="bg-slate-900 border-t border-slate-800 px-12 py-12">
                <h2 className="text-2xl font-bold text-white mb-6">Course Overview</h2>

                <p className="text-slate-300 text-lg leading-relaxed mb-12 max-w-3xl text-pretty">{course.description}</p>

                <div className="grid grid-cols-3 gap-8 max-w-2xl">
                    <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold text-white">{course.rating}</p>
                            <p className="text-sm text-slate-400">Rating</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold text-white">{course.totalEnrollments}</p>
                            <p className="text-sm text-slate-400">Enrolled</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold text-white">${(course.price / 1000).toFixed(0)}K</p>
                            <p className="text-sm text-slate-400">Price</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

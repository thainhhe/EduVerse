
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus } from "lucide-react"
import CourseCardPublish from "./CourseCardPublish"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import CourseCardUnPublish from "./CourseCardUnPublish"

// Mock data for courses
const courses = Array.from({ length: 12 }, (_, i) => ({
    _id: `ABC${i + 1}`,
    title: `ABC${i + 1}`,
    rating: 4.5,
    reviewCount: 123,
    studentsEnrolled: 350,
    lastUpdated: "September 28, 2024",
    image: `/placeholder.svg?height=200&width=300&query=course+thumbnail`,
}))

const MyCourse = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const totalPages = Math.ceil(courses.length / itemsPerPage)

    const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
                    <div className="flex gap-3">
                        <Button variant="outline" size="default" className="gap-2 bg-transparent">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="default" className="gap-2">
                            <Plus className="h-4 w-4" />
                            <Link to='/create-course'> Create Course</Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="published" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="published">Published Courses</TabsTrigger>
                        <TabsTrigger value="unpublished">Unpublished Courses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="published" className="space-y-8">
                        {/* Course Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {paginatedCourses.map((course) => (
                                <CourseCardPublish key={course.id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <p className="text-sm text-muted-foreground">
                                Show 1 to {Math.min(itemsPerPage, courses.length)} of {courses.length} results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="unpublished">
                        {/* Course Grid */}
                        <div className="grid gap-6 grid-cols-1">
                            {paginatedCourses.map((course) => (
                                <CourseCardUnPublish key={course.id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <p className="text-sm text-muted-foreground">
                                Show 1 to {Math.min(itemsPerPage, courses.length)} of {courses.length} results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
export default MyCourse
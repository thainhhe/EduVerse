import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus } from "lucide-react";
import CourseCardPublish from "./CourseCardPublish";
import CourseCardUnPublish from "./CourseCardUnPublish";
import { Link } from "react-router-dom";
import { getMyCourses } from "@/services/courseService";

const MyCourse = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyCourses(); // api interceptor may return data or {data}
        const list = (res?.data ?? res) || [];
        const mapped = list.map((c) => ({
          _id: c._id,
          id: c._id,
          title: c.title || "Untitled course",
          rating: c.rating ?? 0,
          reviewCount: (c.reviews && c.reviews.length) || 0,
          studentsEnrolled: c.totalEnrollments ?? 0,
          lastUpdated: c.updatedAt
            ? new Date(c.updatedAt).toLocaleDateString()
            : c.updatedAt || "—",
          image:
            c.thumbnail ||
            `/placeholder.svg?height=200&width=300&query=course+thumbnail`,
          status: c.status || "pending",
          isPublished: !!c.isPublished,
          category: c.category?.name || null,
        }));
        setCourses(mapped);
      } catch (err) {
        console.error("Failed to load my courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalPages = Math.max(1, Math.ceil(courses.length / itemsPerPage));
  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Courses
          </h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              className="gap-2 bg-transparent"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              <Link to="/create-course"> Create Course</Link>
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
              {loading ? (
                <div>Loading...</div>
              ) : (
                paginatedCourses.map((course) => (
                  <CourseCardPublish key={course.id} course={course} />
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Show 1 to {Math.min(itemsPerPage, courses.length)} of{" "}
                {courses.length} results
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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
              {loading ? (
                <div>Loading...</div>
              ) : (
                paginatedCourses.map((course) => (
                  <CourseCardUnPublish key={course.id} course={course} />
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Show 1 to {Math.min(itemsPerPage, courses.length)} of{" "}
                {courses.length} results
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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
  );
};
export default MyCourse;

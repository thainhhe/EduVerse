import React, { useEffect, useState } from "react";
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

    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("published");

    useEffect(() => {
        const getCurrentUserId = () => {
            try {
                const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    return u._id || u.id || u.userId || null;
                }
                const token =
                    localStorage.getItem("accessToken") ||
                    localStorage.getItem("token") ||
                    sessionStorage.getItem("accessToken");
                if (token) {
                    const parts = token.split(".");
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1]));
                        return payload._id || payload.id || payload.sub || null;
                    }
                }
            } catch (e) {
                // ignore
            }
            return null;
        };

        const fetchCourses = async () => {
            setLoading(true);
            try {
                const userId = getCurrentUserId();
                if (!userId) {
                    console.warn("No user id found for getMyCourses");
                    setAllCourses([]);
                    return;
                }

                const res = await getMyCourses(userId);
                console.debug("getMyCourses raw response:", res);
                const body = res?.data ?? res; // axios response -> res.data is API body

                const normalizeCourses = (payload) => {
                    if (!payload) return [];
                    if (Array.isArray(payload)) {
                        if (payload.length > 0 && Array.isArray(payload[0]?.courses)) return payload[0].courses;
                        if (payload.length > 0 && payload[0]?._id && payload[0]?.title) return payload;
                        return [];
                    }
                    const d = payload.data ?? payload;
                    if (Array.isArray(d)) {
                        if (d.length > 0 && Array.isArray(d[0]?.courses)) return d[0].courses;
                        if (d.length > 0 && d[0]?._id && d[0]?.title) return d;
                    }
                    // deeper nesting like payload.data.data or payload.data.items
                    if (Array.isArray(payload?.data?.data)) return payload.data.data;
                    if (Array.isArray(payload?.data?.items)) return payload.data.items;
                    return [];
                };

                const list = normalizeCourses(body);

                console.debug("extracted courses list:", list);

                const mapped = list.map((c, idx) => ({
                    _id: c._id ?? c.id ?? `missing-${idx}`,
                    id: c._id ?? c.id ?? `missing-${idx}`,
                    title: c.title || c.name || "Untitled course",
                    image: c.thumbnail || c.image || "/placeholder.svg",
                    rating: c.rating ?? 0,
                    reviewCount: Array.isArray(c.reviews) ? c.reviews.length : c.reviewCount ?? 0,
                    studentsEnrolled: c.totalEnrollments ?? c.students ?? 0,
                    lastUpdated: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : c.updatedAt || "—",
                    status: c.status || "draft",
                    isPublished: !!c.isPublished || c.status === "approve",
                    progress: c.progress ?? 0,
                    raw: c,
                }));

                setAllCourses(mapped);
            } catch (err) {
                console.error("Failed to load my courses", err);
                setAllCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // derived lists
    const publishedList = allCourses.filter((c) => c.isPublished);
    const unpublishedList = allCourses.filter((c) => !c.isPublished);

    // reset page when switching tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const total = activeTab === "published" ? publishedList.length : unpublishedList.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const currentList = activeTab === "published" ? publishedList : unpublishedList;
    const paginated = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                            <Link to="/create-course" state={{ isNew: true }}>
                                Create Course
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                paginated.map((course) => <CourseCardPublish key={course._id} course={course} />)
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <p className="text-sm text-muted-foreground">
                                Show {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                {Math.min(currentPage * itemsPerPage, total)} of {total} results
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
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                paginated.map((course) => <CourseCardUnPublish key={course._id} course={course} />)
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <p className="text-sm text-muted-foreground">
                                Show {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                {Math.min(currentPage * itemsPerPage, total)} of {total} results
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
    );
};
export default MyCourse;

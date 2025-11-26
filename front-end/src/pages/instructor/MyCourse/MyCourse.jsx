import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus } from "lucide-react";
import CourseCardPublish from "./CourseCardPublish";
import CourseCardUnPublish from "./CourseCardUnPublish";
import { Link } from "react-router-dom";
import {
  getCollaborativeCourse,
  getMyCourses,
  getUerInCourse,
} from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth";
import { CoCourse } from "./CollaborativeCourse";

const MyCourse = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [allCourses, setAllCourses] = useState([]);
  const [collaborativeCourses, setAllCollaborativeCourse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("published");
  const { user } = useAuth();

  const getCurrentUserId = () => {
    try {
      const userStr =
        localStorage.getItem("user") || sessionStorage.getItem("user");
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
      const body = res?.data ?? res;

      const normalizeCourses = (payload) => {
        if (!payload) return [];
        if (Array.isArray(payload)) {
          if (payload.length > 0 && Array.isArray(payload[0]?.courses))
            return payload[0].courses;
          if (payload.length > 0 && payload[0]?._id && payload[0]?.title)
            return payload;
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
        price: c.price ?? 0,
        rating: c.rating ?? 0,
        main_instructor: c.main_instructor ?? "_",
        reviewCount: Array.isArray(c.reviews)
          ? c.reviews.length
          : c.reviewCount ?? 0,
        studentsEnrolled: c.totalEnrollments ?? c.students ?? 0,
        lastUpdated: c.updatedAt
          ? new Date(c.updatedAt).toLocaleDateString()
          : c.updatedAt || "—",
        status: c.status || "draft",
        isPublished: !!c.isPublished || c.status === "approve",
        isDeleted: c.isDeleted ?? false,
        progress: c.progress ?? 0,
        raw: c,
      }));

      // fetch enroll counts for each course in parallel using existing API
      const withEnrollCounts = await Promise.all(
        mapped.map(async (c) => {
          try {
            const res = await getUerInCourse(c._id);
            // normalize response -> backend likely returns { success, data: [ ... ] }
            const payload = res?.data ?? res;
            const arr = Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data?.data)
              ? payload.data.data
              : [];
            return { ...c, studentsEnrolled: arr.length };
          } catch (err) {
            // on error keep existing count and continue
            // eslint-disable-next-line no-console
            console.warn("Failed to fetch enrollments for", c._id, err);
            return c;
          }
        })
      );

      setAllCourses(withEnrollCounts);
    } catch (err) {
      console.error("Failed to load my courses", err);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborativeCourse = async () => {
    try {
      const res = await getCollaborativeCourse(user._id);
      console.log("dfdhsff:", res.data);
      if (res.success) setAllCollaborativeCourse(res?.data || []);
    } catch (error) {
      console.log("err_:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCollaborativeCourse();
  }, []);

  // derived lists
  const publishedList = allCourses.filter((c) => c.isPublished);
  const unpublishedList = allCourses.filter((c) => !c.isPublished);

  // reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const total =
    activeTab === "published" ? publishedList.length : unpublishedList.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const currentList =
    activeTab === "published"
      ? publishedList
      : activeTab === "unpublished"
      ? unpublishedList
      : collaborativeCourses;
  const paginated = currentList.slice(
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
          <div className="flex gap-3 items-center">
            <Button
              variant="outline"
              size="default"
              className="gap-2 bg-transparent"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Link
              to="/create-course-basic"
              state={{ isNew: true }}
              className="flex items-center px-2 py-1 rounded-sm border-1  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white transition"
            >
              <Plus /> Create Course
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-white">
            <TabsTrigger
              className="data-[state=active]:text-indigo-600 border-white  data-[state=active]:border-b-2 !rounded-none data-[state=active]:border-b-indigo-600"
              value="published"
            >
              Published
            </TabsTrigger>
            <TabsTrigger
              value="unpublished"
              className="data-[state=active]:text-indigo-600 border-white  data-[state=active]:border-b-2 !rounded-none data-[state=active]:border-b-indigo-600"
            >
              Unpublished
            </TabsTrigger>
            <TabsTrigger
              value="collaborative"
              className="data-[state=active]:text-indigo-600 border-white  data-[state=active]:border-b-2 !rounded-none data-[state=active]:border-b-indigo-600"
            >
              Collaborative
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-8">
            {/* Course Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                <div>Loading...</div>
              ) : (
                paginated.map((course) => (
                  <CourseCardPublish key={course._id} course={course} />
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Displaying {(currentPage - 1) * itemsPerPage + 1} to{" "}
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
            <div className="grid gap-6 grid-cols-1 mb-6">
              {loading ? (
                <div>Loading...</div>
              ) : (
                paginated.map((course) => (
                  <CourseCardUnPublish
                    key={course._id}
                    course={course}
                    refetch={fetchCourses}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Displaying {(currentPage - 1) * itemsPerPage + 1} to{" "}
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
          <TabsContent value="collaborative">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
              {collaborativeCourses.map((course) => (
                <CoCourse key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Displaying {(currentPage - 1) * itemsPerPage + 1} to{" "}
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

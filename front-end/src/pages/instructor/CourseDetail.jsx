import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/services/courseService";
import { getForumByCourseId } from "@/services/forumService";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [forum, setForum] = useState(null); // new
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // fetch course (separate)
        const resCourse = await getCourseById(id);
        const body = resCourse?.data ?? resCourse;
        let coursePayload = body?.data ?? body;

        if (
          Array.isArray(coursePayload) &&
          coursePayload.length &&
          coursePayload[0]?.courses
        ) {
          coursePayload =
            coursePayload[0].courses?.find((c) => c._id === id) ??
            coursePayload[0].courses?.[0];
        }
        if (
          Array.isArray(coursePayload) &&
          coursePayload.length &&
          coursePayload[0]?._id &&
          coursePayload[0]?.title
        ) {
          coursePayload =
            coursePayload.find((c) => c._id === id) ?? coursePayload[0];
        }
        setCourse(coursePayload);
      } catch (err) {
        // only course errors here
        console.error("❌ Lỗi khi fetch course:", err);
        setCourse(null);
        setLoading(false);
        return;
      }

      // fetch forum separately and handle 404 gracefully
      try {
        const resForum = await getForumByCourseId(id);
        const forumBody = resForum?.data ?? resForum;
        // adapt according to API shape
        const forumData = forumBody?.data ?? forumBody;
        setForum(forumData);
      } catch (forumErr) {
        const status = forumErr?.response?.status;
        if (status === 404) {
          // expected when forum not created yet — don't treat as error
          console.info(
            `No forum for course ${id} (404) — continuing without forum.`
          );
          setForum(null);
        } else {
          console.warn("Error fetching forum for course:", forumErr);
          setForum(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>No course found.</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/create-course`, { state: { id } })}>
            Edit Course
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/instructor/courses`)}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <nav className="flex gap-2">
          {["overview", "modules", "lessons", "quizzes", "settings"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded ${
                  tab === t ? "bg-slate-800 text-white" : "bg-slate-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          )}
        </nav>
      </div>

      <section>
        {tab === "overview" && (
          <div>
            <p>{course.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {course.status}
            </p>
            {/* show summary stats */}
          </div>
        )}

        {tab === "modules" && (
          <div>
            <Button
              onClick={() =>
                navigate("/create-module", { state: { courseId: id } })
              }
            >
              Add Module
            </Button>
            <ul className="mt-4 space-y-2">
              {(course.modules || []).map((m) => (
                <li key={m._id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{m.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {m.description}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate("/create-module", {
                            state: { id: m._id, courseId: id },
                          })
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "lessons" && (
          <div>
            {/* Lessons management UI (link to lesson create/edit) */}
            <p>Manage lessons here.</p>
          </div>
        )}

        {tab === "quizzes" && (
          <div>
            {/* Quiz management UI */}
            <p>Manage quizzes here.</p>
          </div>
        )}

        {tab === "settings" && (
          <div>
            {/* Publish / pricing / metadata */}
            <p>Course settings (publish, price, category...)</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseDetail;

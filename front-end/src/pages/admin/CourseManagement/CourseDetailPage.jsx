import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Circle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { approveCourse, getAllCourseById, rejectCourse } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";
import api from "@/services/api";

const CourseDetailPage = () => {
  const [course, setCourse] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [answers, setAnswers] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [lessonMaterials, setLessonMaterials] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const res = await getAllCourseById(id);
      if (res?.success) {
        const data = res.data || [];
        setCourse(data);
        setSelectedItem(data);
        setLoading(false);
      }
    };
    fetchCourses();
  }, [id]);
  const fetchMaterials = async (lessonId) => {
    try {
      const res = await api.get(`/material/${lessonId}`);
      if (res.success) setLessonMaterials(res.data);
      else setLessonMaterials([]);
    } catch (error) {
      console.error("Lỗi lấy materials:", error);
      setLessonMaterials([]);
    }
  };

  console.log('lessonMaterials', lessonMaterials);
  const toggleSection = (moduleId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectItem = (item, type) => {
    let quizzes = [];

    if (type === "lesson") {
      quizzes = item.quiz ? [item.quiz] : [];
      fetchMaterials(item._id);
    } else if (type === "module") {
      quizzes = item.moduleQuizzes || [];
    } else if (type === "course") {
      quizzes = item.courseQuizzes || [];
    } else if (type === "quiz") {
      quizzes = [item]; // khi click trực tiếp quiz
    }

    setSelectedItem({ ...item, type, quizzes });
  };
  console.log("selectedItem", selectedItem)

  const handleChange = (questionIndex, option, isCheckbox) => {
    setAnswers((prevAnswers) => {
      const updated = [...prevAnswers];
      if (isCheckbox) {
        const current = updated[questionIndex] || [];
        updated[questionIndex] = current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option];
      } else {
        updated[questionIndex] = option;
      }
      return updated;
    });
  };
  const handleApprove = async () => {
    const res = await approveCourse(id);
    if (res?.success) {
      ToastHelper.success("✅ Khóa học đã được duyệt!");
      setCourse((prev) => ({ ...prev, status: "approve" }));
    } else {
      ToastHelper.error("❌ Duyệt thất bại!");
    }
  };

  const handleReject = async () => {
    const res = await rejectCourse(id, rejectReason);
    if (res?.success) {
      ToastHelper.success("⚠ Khóa học đã bị từ chối!");
      setCourse((prev) => ({ ...prev, status: "reject" }));
      setShowRejectModal(false);
    } else {
      ToastHelper.error("❌ Từ chối thất bại!");
    }
  };
  return (
    <div className="py-10 px-5 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Course Details:{" "}
          <span className="text-indigo-600">{course?.title || "Loading..."}</span>
        </h1>


      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/courses">← Back</Link>
        </Button>
        {course.status === "pending" && (
          <>
            <ConfirmationHelper
              trigger={
                <Button
                  variant="success"
                  size="sm"
                  className="border border-gray-300 px-3"
                >
                  ✓ Approve
                </Button>
              }
              title="Duyệt khóa học"
              description="Bạn có chắc chắn muốn duyệt khóa học này không?"
              confirmText="Duyệt"
              onConfirm={() => handleApprove(course._id)}
            />
            <ConfirmationHelper
              trigger={
                <Button variant="destructive" size="sm" className="px-3">
                  ✗ Reject
                </Button>
              }
              title="Từ chối khóa học"
              description="Bạn có chắc chắn muốn từ chối khóa học này không?"
              confirmText="Từ chối"
              onConfirm={() => {
                handleReject(course._id);
                setShowRejectModal(true);
              }}
            />
          </>
        )}
        {course.status === "approve" && (
          <>
            <ConfirmationHelper
              trigger={
                <Button variant="destructive" size="sm" className="px-3">
                  ✗ Reject
                </Button>
              }
              title="Từ chối khóa học"
              description="Bạn có chắc chắn muốn từ chối khóa học này không?"
              confirmText="Từ chối"
              onConfirm={() => {
                handleReject(course._id);
                setShowRejectModal(true);
              }}
            />
          </>
        )}
        {course.status === "reject" && (
          <>
            {/* Chỉ hiện nút Approve */}
            <ConfirmationHelper
              trigger={
                <Button
                  variant="success"
                  size="sm"
                  className="border border-gray-300 px-3"
                >
                  ✓ Approve
                </Button>
              }
              title="Duyệt khóa học"
              description="Bạn có chắc chắn muốn duyệt khóa học này không?"
              confirmText="Duyệt"
              onConfirm={() => handleApprove(course._id)}
            />
          </>
        )}


      </div>




      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT - Course Preview */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
              Course Preview
            </div>

            {selectedItem ? (
              <div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">
                  Title: {selectedItem.title}
                </h2>

                {/* Hiển thị mô tả nếu có */}
                {selectedItem.description && (
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    <span className="font-semibold text-gray-800">Description: </span>
                    {selectedItem.description}
                  </p>
                )}

                {/* Nếu là bài học */}
                {selectedItem.type === "lesson" && (
                  <div className="text-gray-800 bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">

                    {/* Lesson content */}
                    {selectedItem.content && (
                      <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                        {selectedItem.content}
                      </p>
                    )}

                    {/* Video material */}
                    {lessonMaterials.filter(m => m.type === "video").length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Video Materials:</h4>
                        {lessonMaterials.filter(m => m.type === "video").map((m, i) => (
                          <div key={i} className="border rounded-md overflow-hidden shadow-sm">
                            <p className="px-3 py-2 font-medium text-gray-700">{m.title}</p>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                              <iframe
                                src={m.url}
                                width="100%"
                                height="100%"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title="Video bài học"
                                style={{ border: "0" }}
                              />
                            </div>
                          </div>

                        ))}
                      </div>
                    )}

                    {/* Document material */}
                    {lessonMaterials.filter(m => m.type === "document").length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">Documents:</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {lessonMaterials.filter(m => m.type === "document").map((m, i) => (
                            <li key={i}>
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                {m.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lessonMaterials.length === 0 && (
                      <p className="italic text-gray-400 mt-2">No materials available.</p>
                    )}
                  </div>
                )}



                {selectedItem.type === "quiz" ? (
                  selectedItem.questions?.length > 0 ? (
                    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scroll">
                      {selectedItem.questions.map((q, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
                        >
                          {/* Question */}
                          <p className="text-lg font-semibold text-gray-900 mb-4">
                            {index + 1}. {q.questionText}
                          </p>

                          {/* Options */}
                          <div className="space-y-2">
                            {q.options?.map((option, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-100 shadow-sm"
                              >
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="text-gray-800">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-center py-6">No questions available.</p>
                  )
                ) : null}


              </div>
            ) : (
              <div className="text-gray-400 text-center py-16">
                Click a lesson or quiz to preview
              </div>
            )}


          </div>

          {/* Course Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <div className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
              Course Information
            </div>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Lecturer:</span>{" "}
                {course?.main_instructor?.username || "N/A"}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <Button
                  size="sm"
                  className={
                    course.status === "approve"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : course.status === "pending"
                        ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                  }
                >
                  {course.status}
                </Button>
              </div>
              <div>
                <span className="font-medium">Description:</span>{" "}
                {course?.description || "No description available."}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          {course?.quizzes?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="px-4 py-3 font-semibold text-gray-800 border-b bg-gray-50">
                Course Quizzes
              </h3>
              {course.quizzes.map((quiz) => (
                <button
                  key={quiz._id}
                  onClick={() => handleSelectItem(quiz, "quiz")}
                  className="w-full text-left px-5 py-2 hover:bg-indigo-50 flex items-center justify-between transition"
                >
                  <span className="text-sm text-gray-700">{quiz.title}</span>
                </button>
              ))}
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {/* Course-level quizzes */}
            {course.courseQuizzes?.length > 0 && (
              <div className="bg-white border-y border-gray-200">
                <h3 className="px-4 py-2 font-semibold text-gray-800 border-b">
                  Course Quizzes
                </h3>
                {course.courseQuizzes.map((quiz) => (
                  <button
                    key={quiz._id}
                    onClick={() => handleSelectItem(quiz, "quiz")}
                    className={`w-full text-left px-6 py-2 hover:bg-gray-100 flex items-center justify-between ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                      }`}
                  >
                    <span className="text-sm text-gray-700">{quiz.title}</span>
                    <Circle className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {course?.modules?.map((module) => (
              <div key={module._id} className="bg-white">
                {/* Module Header */}
                <button
                  onClick={() => toggleSection(module._id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {module.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {module.lessons?.filter((l) => l.user_completed?.length > 0).length || 0}/
                      {module.lessons?.length || 0}
                    </p>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {expandedSections[module._id] && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {module.lessons?.map((lesson) => (
                      <div key={lesson._id} className="border-b border-gray-100 last:border-0">
                        {/* 🎓 Lesson */}
                        <button
                          onClick={() => handleSelectItem(lesson, "lesson")}
                          className={`w-full flex items-start gap-3 px-4 py-2 hover:bg-gray-100 transition ${selectedItem?.data?._id === lesson._id ? "bg-gray-100" : ""
                            }`}
                        >
                          {lesson.user_completed?.length > 0 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{lesson.type}</p>
                          </div>
                        </button>

                        {/* 🧩 Lesson-level Quizzes */}
                        {lesson.quizzes?.length > 0 && (
                          <div className="pl-8 pr-4 py-2 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-600 font-semibold mb-1">
                              Lesson Quizzes
                            </p>
                            <div className="space-y-1">
                              {lesson.quizzes.map((quiz) => (
                                <button
                                  key={quiz._id}
                                  onClick={() => handleSelectItem(quiz, "quiz")}
                                  className={`w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2 transition ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                                    }`}
                                >
                                  <Circle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{quiz.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {module.moduleQuizzes?.length > 0 && (
                      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-600 font-semibold mb-1">
                          Module Quizzes
                        </p>
                        <div className="space-y-1">
                          {module.moduleQuizzes.map((quiz) => (
                            <button
                              key={quiz._id}
                              onClick={() => handleSelectItem(quiz, "quiz")}
                              className={`w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-2 transition ${selectedItem?.data?._id === quiz._id ? "bg-gray-100" : ""
                                }`}
                            >
                              <Circle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{quiz.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
        {/* Modal Reject */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Nhập lý do từ chối</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-red-400"
                placeholder="Nhập lý do..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  Hủy
                </Button>
                <Button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;

import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Circle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { approveCourse, getAllCourseById, rejectCourse } from "@/services/courseService";
import { ToastHelper } from "@/helper/ToastHelper";
import { ConfirmationHelper } from "@/helper/ConfirmationHelper";

const CourseDetailPage = () => {
  const [course, setCourse] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [answers, setAnswers] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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

  const toggleSection = (moduleId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectItem = (item, type) => {
    setSelectedItem({ ...item, type });
  };

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
  console.log("selectedItem", selectedItem)
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
                  <div className="text-gray-800 bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="mb-5 space-y-3">
                      {selectedItem.content ? (
                        <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                          Content: {selectedItem.content}
                        </p>
                      ) : (
                        <p className="italic text-gray-400">No content available for this lesson.</p>
                      )}
                    </div>

                    {/* Video */}
                    {selectedItem.videoUrl ? (
                      <div className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
                        <video
                          src={selectedItem.videoUrl}
                          controls
                          className="w-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="italic text-gray-500">🎥 No video available for this lesson.</p>
                      </div>
                    )}
                  </div>
                )}


                {/* Nếu là quiz */}
                {selectedItem.type === "quiz" && selectedItem.questions?.length > 0 ? (
                  <div className="max-h-[1000px] overflow-y-auto pr-2 custom-scroll">
                    {selectedItem.questions.map((q, index) => (
                      <div
                        key={index}
                        className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition"
                      >
                        <p className="font-semibold text-gray-800 mb-4">
                          {index + 1}. {q.questionText}
                        </p>

                        <div className="space-y-2">
                          {q.options?.map((option, i) => {
                            const isChecked =
                              q.questionType === "checkbox"
                                ? answers[index]?.includes(option)
                                : answers[index] === option;

                            return (
                              <label
                                key={i}
                                className={`flex items-center p-2 border rounded-md cursor-pointer transition ${isChecked
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-200 hover:bg-gray-100"
                                  }`}
                              >
                                <input
                                  type={
                                    q.questionType === "checkbox" ? "checkbox" : "radio"
                                  }
                                  name={`question-${index}`}
                                  value={option}
                                  checked={isChecked}
                                  onChange={() =>
                                    handleChange(
                                      index,
                                      option,
                                      q.questionType === "checkbox"
                                    )
                                  }
                                  className="mr-3 accent-indigo-600 w-4 h-4"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedItem.type === "quiz" ? (
                  <p className="text-gray-500 italic">No questions available.</p>
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

          {course?.modules?.map((module) => (
            <div key={module._id} className="bg-white border rounded-xl shadow-sm">
              <button
                onClick={() => toggleSection(module._id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">{module.title}</p>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
                    }`}
                />
              </button>

              {expandedSections[module._id] && (
                <div className="bg-gray-50 border-t border-gray-200">
                  {module.lessons?.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <button
                        onClick={() => handleSelectItem(lesson, "lesson")}
                        className="w-full flex items-start gap-3 px-4 py-2 hover:bg-indigo-50 transition"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {lesson.type}
                          </p>
                        </div>
                      </button>

                      {lesson.quiz && (
                        <div className="pl-8 pr-4 py-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-600 font-semibold mb-1">
                            Lesson Quiz
                          </p>
                          <button
                            onClick={() => handleSelectItem(lesson.quiz, "quiz")}
                            className="w-full text-left text-sm text-gray-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md flex items-center gap-2 transition"
                          >
                            <Circle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{lesson.quiz.title}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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

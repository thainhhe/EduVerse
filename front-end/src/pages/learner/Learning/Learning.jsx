

import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { enrollmentService } from "@/services/enrollmentService";
import LearningSidebar from "./LearningSidebar";
import LessonContent from "./LessonContent";
import QuizContent from "./QuizContent";
import { scoreService } from "@/services/scoreService";
import QuizResult from "./QuizResult";

const Learning = () => {
  const location = useLocation();

  const { courseId } = useParams();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Có thể là lesson hoặc quiz
  const [loading, setLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(false);
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const data = await enrollmentService.getDetailCourseEnrollmentsByUser(
          user._id,
          courseId
        );

        if (data) {
          setCourseData(data);

          // ✅ Nếu có restoreLesson (từ navigate state)
          if (location.state?.restoreLesson) {
            const restored = location.state.restoreLesson;
            console.log("Khôi phục từ location:", restored);
            setSelectedItem(restored);

            // ✅ Nếu là quiz thì gọi checkQuizStatus luôn
            if (restored.type === "quiz") {
              setCheckingQuiz(true);
              try {
                const result = await scoreService.checkQuizStatus(
                  user._id,
                  restored.data._id
                );
                if (result.success) setQuizStatus(result.data);
                else console.warn("Không thể lấy quizStatus:", result);
              } catch (err) {
                console.error("Lỗi khi checkQuizStatus:", err);
              } finally {
                setCheckingQuiz(false);
              }
            }
            return; // 👈 Dừng lại, không set bài học mặc định nữa
          }

          // 🧩 Nếu không có restoreLesson, chọn lesson đầu tiên
          if (!selectedItem && data.courseId.modules?.[0]?.lessons?.[0]) {
            const firstLesson = data.courseId.modules[0].lessons[0];
            setSelectedItem({ type: "lesson", data: firstLesson });
          }
        }
      } catch (err) {
        console.error("Fetch course error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, user._id]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!courseData) return <p className="text-center py-10">Không tìm thấy khóa học</p>;

  const { courseId: course } = courseData;
  // ✅ Khi chọn quiz
  const handleSelectQuiz = async (quiz) => {
    setSelectedItem({ type: "quiz", data: quiz });
    setCheckingQuiz(true);
    const result = await scoreService.checkQuizStatus(user._id, quiz._id);
    console.log("✅ Kết quả quiz check:", result);

    if (result.success) setQuizStatus(result.data);
    setCheckingQuiz(false);
  };
  console.log("quizStatus", quizStatus)
  console.log("checkingQuiz", checkingQuiz)
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <LearningSidebar
        course={course}
        onSelectItem={(item) => {
          if (item.type === "quiz") handleSelectQuiz(item.data);
          else {
            setSelectedItem(item);
            setQuizStatus(null);
          }
        }}
        selectedItem={selectedItem}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 border-l border-gray-200 overflow-y-auto">
        {selectedItem?.type === "lesson" && (
          <LessonContent lesson={selectedItem.data} course={course} />
        )}
        {/* 🧩 Quiz */}
        {selectedItem?.type === "quiz" && !checkingQuiz && quizStatus && (
          <>
            {quizStatus.hasCompleted ? (
              <QuizResult
                quiz={quizStatus.quiz}
                latestScore={quizStatus.latestScore}
                attempts={quizStatus.attempts}
                onRetake={() => setQuizStatus({ ...quizStatus, hasCompleted: false })}
                currentLesson={selectedItem}
              />
            ) : (
              <QuizContent
                quizId={selectedItem.data._id}
                onQuizSubmitted={(newStatus) => setQuizStatus(newStatus)}
              />
            )}
          </>
        )}

        {checkingQuiz && <p>Đang kiểm tra trạng thái quiz...</p>}

      </div>
    </div>
  );
};

export default Learning;

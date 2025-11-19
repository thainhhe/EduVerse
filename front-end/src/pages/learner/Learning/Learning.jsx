import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { enrollmentService } from "@/services/enrollmentService";
import LearningSidebar from "./LearningSidebar";
import LessonContent from "./LessonContent";
import QuizContent from "./QuizContent";
import QuizResult from "./QuizResult";
import { scoreService } from "@/services/scoreService";

const Learning = () => {
  const location = useLocation();
  const { courseId } = useParams();
  const { user } = useAuth();

  // ======= Tất cả hook phải ở đây =======
  const [courseData, setCourseData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quizStatus, setQuizStatus] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(false);
  const [passedQuizzes, setPassedQuizzes] = useState([]);
  const handleSelectQuiz = async (quiz) => {
    setSelectedItem({ type: "quiz", data: quiz });
    setCheckingQuiz(true);

    try {
      const result = await scoreService.checkQuizStatus(user._id, quiz._id);
      if (result.success) setQuizStatus(result.data);
    } catch (err) {
      console.error("Quiz check error:", err);
    } finally {
      setCheckingQuiz(false);
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const data = await enrollmentService.getDetailCourseEnrollmentsByUser(
          user._id,
          courseId
        );
        if (data) {
          setCourseData(data);
          // Restore bài học khi navigate về
          if (location.state?.restoreLesson) {
            const restored = location.state.restoreLesson;
            setSelectedItem(restored);

            if (restored.type === "quiz") {
              setCheckingQuiz(true);
              try {
                const result = await scoreService.checkQuizStatus(
                  user._id,
                  restored.data._id
                );
                if (result.success) setQuizStatus(result.data);
              } finally {
                setCheckingQuiz(false);
              }
            }
            return;
          }

          // Chọn bài học đầu tiên
          const firstLesson = data.courseId.modules?.[0]?.lessons?.[0];
          if (firstLesson) setSelectedItem({ type: "lesson", data: firstLesson });
        }
      } catch (error) {
        console.error("Fetch course error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, user._id]);

  useEffect(() => {
    const fetchPassed = async () => {
      if (!courseData) return;

      const passedIds = [];
      const course = courseData.courseId;
      const allQuizzes = [
        ...(course.courseQuizzes || []),
        ...course.modules.flatMap(module => [
          ...(module.moduleQuizzes || []),
          ...(module.lessons?.flatMap(lesson => lesson.quizzes || []) || []),
        ]),
      ];

      for (let quiz of allQuizzes) {
        console.log("quiz", quiz)
        const res = await scoreService.checkQuizStatus(user._id, quiz._id);
        console.log("res quiz", res)
        console.log("res.data.latestScore.id", res.data.latestScore?.id)
        console.log("res.data.latestScore", res.data?.latestScore)
        if (res.success && res.data.hasCompleted && res.data.latestScore.status == "passed") passedIds.push(quiz._id);
      }

      setPassedQuizzes(passedIds);
    };

    fetchPassed();
  }, [courseData]);

  // ======= Return UI =======
  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!courseData) return <p className="text-center py-10">Không tìm thấy khóa học</p>;

  const course = courseData.courseId;

  return (
    <div className="flex min-h-screen bg-white">
      <LearningSidebar
        course={course}
        userId={user._id}
        selectedItem={selectedItem}
        passedQuizzes={passedQuizzes}
        onSelectItem={(item) => {
          if (item.type === "quiz") handleSelectQuiz(item.data);
          else {
            setQuizStatus(null);
            setSelectedItem(item);
          }
        }}
      />

      <div className="flex-1 p-6 border-l border-gray-200 overflow-y-auto">
        {selectedItem?.type === "lesson" && (
          <LessonContent lesson={selectedItem.data} course={course} />
        )}

        {selectedItem?.type === "quiz" && !checkingQuiz && quizStatus && (
          <>
            {quizStatus.hasCompleted ? (
              <QuizResult
                quiz={quizStatus.quiz}
                latestScore={quizStatus.latestScore}
                attempts={quizStatus.attempts}
                currentLesson={selectedItem}
                onRetake={() => setQuizStatus({ ...quizStatus, hasCompleted: false })}
              />
            ) : (
              <QuizContent
                quizId={selectedItem.data._id}
                onQuizSubmitted={(statusData) => {
                  setQuizStatus(statusData);

                  // Nếu quiz pass thì thêm vào passedQuizzes
                  if (statusData.hasCompleted && statusData.latestScore.status === "passed") {
                    setPassedQuizzes((prev) => {
                      // tránh duplicate
                      if (!prev.includes(statusData.quiz.id)) {
                        return [...prev, statusData.quiz.id];
                      }
                      return prev;
                    });
                  }
                }}
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

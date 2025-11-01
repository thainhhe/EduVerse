// // src/pages/learner/Learning/Learning.jsx
// import { useEffect, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import ReactPlayer from "react-player";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Check,
//   PlayCircle,
//   ThumbsUp,
//   MessageSquare,
//   Image as ImageIcon,
//   Send,
//   ChevronDown,
//   CheckCircle2,
//   Circle,
// } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
// import { enrollmentService } from "@/services/enrollmentService";

// const Learning = () => {
//   const { courseId } = useParams(); // Lấy courseId từ URL
//   const { user } = useAuth()
//   const userId = user._id
//   console.log("userId", userId)
//   const navigate = useNavigate();
//   const [courseData, setCourseData] = useState(null);
//   const [expandedSections, setExpandedSections] = useState({ "0": true })
//   const [selectedLesson, setSelectedLesson] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   // --- Fetch API ---
//   useEffect(() => {
//     const fetchCourseDetail = async () => {
//       try {
//         const data = await enrollmentService.getDetailCourseEnrollmentsByUser(userId, courseId);
//         console.log("data", data)
//         if (data) {
//           setCourseData(data)
//           if (data.courseId.modules.length > 0 && data.courseId.modules[0].lessons.length > 0) {
//             setSelectedLesson(data.courseId.modules[0].lessons[0])
//           }
//         }
//       } catch (err) {
//         console.error("Fetch course error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCourseDetail();
//   }, [courseId]);

//   const toggleSection = (moduleId) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [moduleId]: !prev[moduleId],
//     }))
//   }
//   if (loading) return <p className="text-center py-10">Loading...</p>;
//   if (!courseData) return <p className="text-center py-10">Không tìm thấy khóa học</p>;

//   console.log("courseData", courseData)
//   const course = courseData.courseId
//   const modules = courseData.courseId.modules || [];
//   console.log("modules", modules)
//   const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
//   const completedLessons = modules.reduce((acc, m) => acc + (m.lessons?.filter((l) => l.user_completed > 0).length || 0), 0)
//   console.log("modules", modules)
//   console.log("totalLessona", totalLessons)
//   console.log("completedLesson", completedLessons)
//   const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0


//   return (
//     // <div>Hehe</div>
//     <div className="bg-white py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
//         <div className="grid lg:grid-cols-12 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-9">
//             <div className="mb-4">
//               <p className="text-sm text-gray-500">
//                 <Link to="/dashboard" className="hover:underline">
//                   My Courses
//                 </Link>{" "}
//                 / In Progress
//               </p>
//             </div>

//             <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
//             <p className="text-gray-600 mb-4">
//               {course.main_instructor?.email} | ⭐ {course.rating || 0}
//             </p>

//             <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
//               <ReactPlayer url="https://www.youtube.com/watch?v=gKDkDa3CfZY&t=201s" width="100%" height="100%" controls />
//             </div>

//             <Tabs defaultValue="discussion" className="w-full">
//               <TabsList className="mb-4">
//                 <TabsTrigger value="summary">Summary</TabsTrigger>
//                 <TabsTrigger value="discussion">Discussion</TabsTrigger>
//                 <TabsTrigger value="resources">Resources</TabsTrigger>
//                 <TabsTrigger value="transcript">Transcript</TabsTrigger>
//               </TabsList>

//               <TabsContent value="summary">
//                 <p>{course.description || "Chưa có mô tả khóa học."}</p>
//               </TabsContent>

//               <TabsContent value="discussion">
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-4">
//                     <Avatar>
//                       <AvatarImage src="/placeholder-user.jpg" />
//                       <AvatarFallback>U</AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1 relative">
//                       <Input placeholder="Add a public comment..." className="pr-24" />
//                       <div className="absolute top-0 right-0 h-full flex items-center pr-2 gap-2">
//                         <Button variant="ghost" size="icon">
//                           <ImageIcon className="w-5 h-5 text-gray-500" />
//                         </Button>
//                         <Button variant="ghost" size="icon">
//                           <Send className="w-5 h-5 text-gray-500" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                   <p className="text-center text-gray-500">Chưa có bình luận nào.</p>
//                 </div>
//               </TabsContent>

//               <TabsContent value="resources">
//                 <p>Tài liệu sẽ hiển thị ở đây.</p>
//               </TabsContent>
//               <TabsContent value="transcript">
//                 <p>Bản ghi lời thoại của video.</p>
//               </TabsContent>
//             </Tabs>
//           </div>


//           <div className="lg:col-span-3">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
//               <p className="text-sm text-gray-600">{progressPercentage}% Completed</p>
//             </div>

//             <div className="divide-y divide-gray-200">
//               {/* 🧩 Quiz toàn khóa học */}
//               {course.courseQuizzes?.length > 0 && (
//                 <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg">
//                   <h3 className="px-4 py-2 font-semibold text-gray-800 border-b">Course Quizzes</h3>
//                   {course.courseQuizzes.map((quiz) => (
//                     <button
//                       key={quiz._id}
//                       onClick={() => setSelectedLesson(null)}
//                       className="w-full px-6 py-2 hover:bg-gray-100 flex items-center justify-between"

//                     >
//                       <span className="text-sm text-gray-700">{quiz.title}</span>
//                       <Circle className="w-4 h-4 text-gray-400" />
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {modules.map((module) => (
//                 <div key={module._id} className="bg-white">
//                   {/* Header Module */}
//                   <button
//                     onClick={() => toggleSection(module._id)}
//                     className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-100 transition-colors group"
//                   >
//                     <span className="flex-1 text-left">
//                       <p className="text-sm font-medium text-gray-900 group-hover:text-black">{module.title}</p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {module.lessons?.filter((l) => l.user_completed?.length > 0).length || 0}/
//                         {module.lessons?.length || 0}
//                       </p>
//                     </span>
//                     <ChevronDown
//                       className={`w-4 h-4 text-gray-500 mt-1 transition-transform ${expandedSections[module._id] ? "rotate-180" : ""
//                         }`}
//                     />
//                   </button>

//                   {/* Nội dung Module */}
//                   {expandedSections[module._id] && (
//                     <div className="bg-gray-50 border-t border-gray-200">


//                       {/* 📘 Lessons */}
//                       {module.lessons?.map((lesson) => (
//                         <div key={lesson._id} className="px-4 py-2.5 border-b border-gray-100">
//                           <button
//                             onClick={() => setSelectedLesson(lesson)}
//                             className="w-full flex items-start gap-3 group hover:bg-gray-100 px-2 py-1 rounded"
//                           >
//                             {lesson.user_completed?.length > 0 ? (
//                               <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
//                             ) : (
//                               <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
//                             )}
//                             <div className="flex-1 min-w-0 text-left">
//                               <p
//                                 className={`text-sm ${lesson.user_completed?.length > 0
//                                   ? "text-gray-500"
//                                   : "text-gray-800 group-hover:text-black"
//                                   }`}
//                               >
//                                 {lesson.title}
//                               </p>
//                               <p className="text-xs text-gray-500">{lesson.type}</p>
//                             </div>
//                           </button>

//                           {lesson.quizzes?.length > 0 && (
//                             <div className="ml-8 mt-1 space-y-1">
//                               {lesson.quizzes.map((quiz) => (
//                                 <button
//                                   key={quiz._id}
//                                   className="w-full text-left text-xs text-gray-700 hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-2"
//                                 >
//                                   <Circle className="w-3 h-3 text-gray-400" />
//                                   {quiz.title}
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                       {module.moduleQuizzes?.length > 0 && (
//                         <div className="px-4 py-2 border-b border-gray-200">
//                           <p className="text-xs text-gray-600 font-medium mb-1">Module Quizzes:</p>
//                           {module.moduleQuizzes.map((quiz) => (
//                             <button
//                               key={quiz._id}
//                               className="w-full px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
//                               onClick={() => navigate(`/quiz/${quiz._id}`)}
//                             >
//                               <Circle className="w-3 h-3 text-gray-400" />
//                               {quiz.title}

//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Learning;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { enrollmentService } from "@/services/enrollmentService";
import LearningSidebar from "./LearningSidebar";
import LessonContent from "./LessonContent";
import QuizContent from "./QuizContent";

const Learning = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Có thể là lesson hoặc quiz
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const data = await enrollmentService.getDetailCourseEnrollmentsByUser(
          user._id,
          courseId
        );
        if (data) {
          setCourseData(data);
          // Chọn bài học đầu tiên làm mặc định
          const firstLesson = data.courseId.modules?.[0]?.lessons?.[0];
          if (firstLesson) setSelectedItem({ type: "lesson", data: firstLesson });
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

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <LearningSidebar
        course={course}
        onSelectItem={setSelectedItem}
        selectedItem={selectedItem}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 border-l border-gray-200 overflow-y-auto">
        {selectedItem?.type === "lesson" && (
          <LessonContent lesson={selectedItem.data} course={course} />
        )}
        {selectedItem.type === "quiz" && (
          <QuizContent quizId={selectedItem.data._id} />
        )}

      </div>
    </div>
  );
};

export default Learning;

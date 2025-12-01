import { Routes, Route } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import MainLayout from "@components/layout/MainLayout";
import PrivateRoute from "@routes/PrivateRoute";
import PermissionBasedRoute from "@routes/PermissionBasedRoute";
import React from "react";

// Pages
import Home from "@/pages/common/Home/Home";
import Login from "@/pages/auth/Login/Login";
import Register from "@/pages/auth/RegisterInstructor/RegisterInstructor";
import Dashboard from "@/pages/learner/LearnerDashboard/LearnerDashboard";
import PaymentHistory from "@/pages/learner/PaymentHistory/PaymentHistory";
import Courses from "@/pages/common/Courses/Courses";
import CourseDetail from "@/pages/common/CourseDetail/CourseDetail";
import Learning from "@/pages/learner/Learning/Learning";
import Classroom from "@pages/Classroom/Classroom";
import Forum from "@/pages/common/Forum/Forum";
import NotFound from "@/pages/common/NotFound/NotFound";
import Instructors from "@/pages/common/Instructors/Instructors";
import RegisterLearner from "@/pages/auth/RegisterLearner/RegisterLearner";
import InstructorProfile from "@/pages/common/InstructorProfile/InstructorProfile";
import Settings from "@/pages/common/Settings/Settings";
import ContactPage from "@/pages/common/Contact/ContactPage";
import Quiz from "./pages/learner/Quiz/Quiz";
import MyCourse from "@/pages/instructor/MyCourse/MyCourse";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PaymentPage from "@/pages/common/checkout/PaymentPage";
import PaymentConfirmationPage from "@/pages/common/checkout/PaymentConfirmationPage";
import AdminLayout from "./components/layout/AdminLayout/AdminLayout";
import CreateCourse from "./pages/instructor/MyCourse/CreateCourse";
import CourseBuilderLayout from "./pages/instructor/MyCourse/CourseBuilderLayout";
import ModulesPage from "./pages/instructor/MyCourse/Modules/ModulesPage";
import AnnouncementsPage from "./pages/instructor/MyCourse/Announcements/AnnouncementsPage";
import GradesPage from "./pages/instructor/MyCourse/Grades/GradesPage";
import RoomMeeting from "./pages/instructor/RoomMeeting/RoomMeeting";
import PermissionsPage from "./pages/instructor/Permissions/PermissionsPage";
import CommentThread from "./pages/CommentThread/CommentThread";
import AdminDashboardPage from "./pages/admin/AdminDashboard/AdminDashboardPage";
import UserManagementPage from "./pages/admin/UserManagement/UserManagementPage";
import InstructorProfileDetail from "./pages/admin/UserManagement/InstructorProfileDetail";
import LearnerProfileDetail from "./pages/admin/UserManagement/LearnerProfileDetail";
import CourseManagementPage from "./pages/admin/CourseManagement/CourseManagementPage";
import CourseDetailPage from "./pages/admin/CourseManagement/CourseDetailPage";
import QuizDetail from "./pages/learner/Learning/QuizDetail";
import GoogleCallback from "./pages/auth/GoogleCallback";
import DashboardInstructor from "./pages/instructor/DashboardInstructor/DashBoardInstructor";
import InstructorCourseDetail from "@/pages/instructor/CourseDetail";

import ChatbotManagementPage from "./pages/admin/ChatbotManagement/ChatbotManagementPage";
import CommentManagementPage from "./pages/admin/CommentManagement/CommentManagementPage";
import PaymentFailPage from "./pages/common/checkout/PaymentFailPage";
import RoomList from "./pages/learner/RoomList/RoomList";
import ForumManagement from "./pages/instructor/forum/ForumInstructor";
import MyReportsPage from "./pages/common/ReportIssue/MyReportsPage";
import ReportManagementPage from "./pages/admin/ReportManagementPage/ReportManagementPage";

import LearnerList from "./pages/instructor/MyCourse/Learner/LearnerList";
import { ChatbotWidget } from "./components/chatbot/ChatbotWidget";
import NotificationManagementPage from "./pages/admin/NotificationManagement/NotificationManagementPage";
import ReviewPage from "./pages/instructor/MyCourse/Reviews/ReviewPage";
import QuizPage from "./pages/instructor/MyCourse/Quiz/QuizPage";
import PaymentManagementPage from "./pages/admin/PaymentManagement/PaymentManagementPage";
import PaymentDetailPage from "./pages/admin/PaymentManagement/PaymentDetailPage";
import CategoryManagement from "./pages/admin/CategoryManagement/CategoryManagement";
import EnrollmentPage from "./pages/admin/Enrollment/EnrollmentPage";
import RevenuePage from "./pages/admin/Revenue/RevenuePage";
import InstructorRevenuePage from "./pages/admin/Revenue/InstructorRevenuePage";
import InstructorRevenueDetailPage from "./pages/admin/Revenue/InstructorRevenueDetailPage";
import SystemManagementPage from "./pages/admin/System/SystemManagementPage";
import SessionTimeout from "@/components/security/SessionTimeout";
import ReportFromLearner from "./pages/instructor/ReportFromLearner/ReportFromLearner";

function App() {
    const { loading } = useAuth();

    if (loading) {
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div
                className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
                style={{ animationDelay: "2s" }}
            ></div>
            <div
                className="absolute -bottom-32 left-[20%] w-[40rem] h-[40rem] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
                style={{ animationDelay: "4s" }}
            ></div>

            <div className="relative z-10 flex flex-col items-center gap-4 p-12">
                <h1
                    className="text-3xl md:text-4xl font-bold uppercase tracking-[0.5em] select-none animate-pulse pl-[0.5em]"
                    style={{
                        color: "#4f46e5",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                >
                    Eduverse
                </h1>
                <p className="text-sm font-medium text-slate-400 font-mono tracking-widest">LOADING...</p>
            </div>
        </div>;
    }

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path="login" element={<Login />} />
                <Route path="register-instructor" element={<Register />} />
                <Route path="register-learner" element={<RegisterLearner />} />
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="/course/rooms" element={<RoomList />} />
                    <Route path="/reports/my-reports" element={<MyReportsPage />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    {/* Instructor public detail (management view for instructor) */}
                    <Route path="instructor/courses/:id" element={<InstructorCourseDetail />} />
                    <Route path="mycourses" element={<MyCourse />} />
                    <Route path="instructors" element={<Instructors />} />
                    <Route path="instructors/:id" element={<InstructorProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="/quiz-detail/:quizId" element={<QuizDetail />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password/:token" element={<ResetPassword />} />

                    <Route path="quiz" element={<Quiz />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    {/* Accept both /reset-password?email=...&otp=... and /reset-password/:token */}
                    <Route path="reset-password/:token?" element={<ResetPassword />} />
                    <Route path="learning/:courseId" element={<Learning />} />
                    <Route path="dashboard-test" element={<Dashboard />} />
                    <Route path="/google-auth/success" element={<GoogleCallback />} />
                    <Route path="dashboard-instructor" element={<DashboardInstructor />} />
                    <Route path="create-course-basic" element={<CreateCourse />} />
                    {/* 2️⃣ Các bước sau khi tạo khóa học (có sidebar) */}
                    <Route path="create-course" element={<CourseBuilderLayout />}>
                        <Route path="modules" element={<ModulesPage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="reports" element={<ReportFromLearner />} />
                        <Route path="grades" element={<GradesPage />} />
                        <Route path="room-meeting" element={<RoomMeeting />} />
                        <Route path="forums" element={<ForumManagement />} />
                        <Route path="learners" element={<LearnerList />} />
                        <Route path="permissions" element={<PermissionsPage />} />
                        <Route path="reviews" element={<ReviewPage />} />
                        <Route path="quiz" element={<QuizPage />} />
                    </Route>
                    {/* <Route path="permission" element={<PermissionsPage />} /> */}
                    <Route path="comment-thread" element={<CommentThread />} />

                    <Route path="checkout" element={<PaymentPage />} />
                    <Route path="checkout/fail" element={<PaymentFailPage />} />
                    <Route path="checkout/success" element={<PaymentConfirmationPage />} />
                    {/* Private routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="payment-history" element={<PaymentHistory />} />
                        <Route path="learning/:courseId" element={<Learning />} />
                        <Route path="classroom/:roomId" element={<Classroom />} />
                        <Route path="forum" element={<Forum />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="checkout" element={<PaymentPage />} />
                        <Route path="checkout/success" element={<PaymentConfirmationPage />} />
                    </Route>

                    {/* Permission-based routes */}
                    <Route
                        element={
                            <PermissionBasedRoute allowedPermissions={["create:courses", "edit:courses"]} />
                        }
                    >
                        <Route path="instructor/*" element={<div>Instructor Dashboard</div>} />
                    </Route>
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="users/instructor/:userId" element={<InstructorProfileDetail />} />
                    <Route path="users/learner/:userId" element={<LearnerProfileDetail />} />
                    <Route path="courses" element={<CourseManagementPage />} />
                    <Route path="courses/:id" element={<CourseDetailPage />} />
                    <Route path="categories" element={<CategoryManagement />} />

                    {/* Admin management pages */}
                    <Route path="chatbot" element={<ChatbotManagementPage />} />
                    <Route path="comments" element={<CommentManagementPage />} />
                    <Route path="notifications" element={<NotificationManagementPage />} />
                    <Route path="reports" element={<ReportManagementPage />} />
                    <Route path="enrollment" element={<EnrollmentPage />} />
                    <Route path="revenue" element={<RevenuePage />} />
                    <Route path="revenue/instructors" element={<InstructorRevenuePage />} />
                    <Route
                        path="revenue/instructors/:instructorId"
                        element={<InstructorRevenueDetailPage />}
                    />
                    <Route path="system" element={<SystemManagementPage />} />
                    <Route path="payment" element={<PaymentManagementPage />} />
                    <Route path="payment/:id" element={<PaymentDetailPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatbotWidget />
            <SessionTimeout />
        </>
    );
}

// return (
//   <>
//     <Routes>
//       {/* Public routes */}
//       <Route path="/" element={<MainLayout />}>
//         <Route index element={<Home />} />
//         <Route path="login" element={<Login />} />
//         <Route path="register-instructor" element={<Register />} />
//         <Route path="courses" element={<Courses />} />
//         <Route path="/course/rooms" element={<RoomList />} />

//         <Route path="courses/:id" element={<CourseDetail />} />
//         {/* Instructor public detail (management view for instructor) */}
//         <Route path="instructor/courses/:id" element={<InstructorCourseDetail />} />
//         <Route path="mycourses" element={<MyCourse />} />
//         <Route path="register-learner" element={<RegisterLearner />} />
//         <Route path="instructors" element={<Instructors />} />
//         <Route path="instructors/:id" element={<InstructorProfile />} />
//         <Route path="settings" element={<Settings />} />
//         <Route path="/quiz-detail/:quizId" element={<QuizDetail />} />
//         <Route path="forgot-password" element={<ForgotPassword />} />
//         <Route path="reset-password/:token" element={<ResetPassword />} />

//         <Route path="quiz" element={<Quiz />} />
//         <Route path="forgot-password" element={<ForgotPassword />} />
//         {/* Accept both /reset-password?email=...&otp=... and /reset-password/:token */}
//         <Route path="reset-password/:token?" element={<ResetPassword />} />
//         <Route path="learning/:courseId" element={<Learning />} />
//         <Route path="dashboard-test" element={<Dashboard />} />
//         <Route path="/google-auth/success" element={<GoogleCallback />} />
//         <Route path="dashboard-instructor" element={<DashboardInstructor />} />
//         <Route path="create-course-basic" element={<CreateCourse />} />
//         {/* 2️⃣ Các bước sau khi tạo khóa học (có sidebar) */}
//         <Route path="create-course" element={<CourseBuilderLayout />}>
//           <Route path="modules" element={<ModulesPage />} />
//           <Route path="announcements" element={<AnnouncementsPage />} />
//           <Route path="grades" element={<GradesPage />} />
//           <Route path="room-meeting" element={<RoomMeeting />} />
//           <Route path="forums" element={<ForumManagement />} />
//           <Route path="learners" element={<LearnerList />} />
//           <Route path="permissions" element={<PermissionsPage />} />
//         </Route>
//         {/* <Route path="permission" element={<PermissionsPage />} /> */}
//         <Route path="comment-thread" element={<CommentThread />} />

//         <Route path="checkout" element={<PaymentPage />} />
//         <Route path="checkout/fail" element={<PaymentFailPage />} />
//         <Route path="checkout/success" element={<PaymentConfirmationPage />} />
//         {/* Private routes */}
//         <Route element={<PrivateRoute />}>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="learning/:courseId" element={<Learning />} />
//           <Route path="classroom/:roomId" element={<Classroom />} />
//           <Route path="forum" element={<Forum />} />
//           <Route path="settings" element={<Settings />} />
//           <Route path="checkout" element={<PaymentPage />} />
//           <Route path="checkout/success" element={<PaymentConfirmationPage />} />
//         </Route>

//         {/* Permission-based routes */}
//         <Route element={<PermissionBasedRoute allowedPermissions={["create:courses", "edit:courses"]} />}>
//           <Route path="instructor/*" element={<div>Instructor Dashboard</div>} />
//         </Route>
//       </Route>
//       <Route path="/admin" element={<AdminLayout />}>
//         <Route path="dashboard" element={<AdminDashboardPage />} />
//         <Route path="users" element={<UserManagementPage />} />
//         <Route path="users/instructor/:userId" element={<InstructorProfileDetail />} />
//         <Route path="users/learner/:userId" element={<LearnerProfileDetail />} />
//         <Route path="courses" element={<CourseManagementPage />} />
//         <Route path="courses/:id" element={<CourseDetailPage />} />

//         {/* Admin management pages */}
//         <Route path="chatbot" element={<ChatbotManagementPage />} />
//         <Route path="comments" element={<CommentManagementPage />} />
//       </Route>

//       <Route path="*" element={<NotFound />} />
//     </Routes>
//     <ChatbotWidget />
//   </>
// );

export default App;

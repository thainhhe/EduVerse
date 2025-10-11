import { Routes, Route } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import MainLayout from "@components/layout/MainLayout";
import PrivateRoute from "@routes/PrivateRoute";
import RoleBasedRoute from "@routes/RoleBasedRoute";

// Pages
import Home from "@/pages/common/Home/Home";
import Login from "@/pages/auth/Login/Login";
import Register from "@/pages/auth/RegisterInstructor/RegisterInstructor";
import Dashboard from "@/pages/learner/LearnerDashboard/LearnerDashboard";
import Courses from "@/pages/common/Courses/Courses";
import CourseDetail from "@/pages/common/CourseDetail/CourseDetail";
import Learning from "@/pages/learner/Learning/Learning";
import Classroom from "@pages/Classroom/Classroom";
import Profile from "@pages/Profile/Profile";
import Forum from "@pages/Forum/Forum";
import NotFound from "@/pages/common/NotFound/NotFound";
import Instructors from "@/pages/common/Instructors/Instructors";
import RegisterLearner from "@/pages/auth/RegisterLearner/RegisterLearner";
import InstructorProfile from "@/pages/common/InstructorProfile/InstructorProfile";
import Settings from "@/pages/common/Settings/Settings";
import Quiz from "./pages/learner/Quiz/Quiz";
import MyCourse from "@/pages/instructor/MyCourse/MyCourse";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="mycourses" element={<MyCourse />} />
        <Route path="register-learner" element={<RegisterLearner />} />
        <Route path="instructors" element={<Instructors />} />
        <Route path="instructors/:id" element={<InstructorProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="learning-test" element={<Learning />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learning/:courseId" element={<Learning />} />
          <Route path="classroom/:roomId" element={<Classroom />} />
          <Route path="profile" element={<Profile />} />
          <Route path="forum" element={<Forum />} />
        </Route>

        {/* Role-based routes */}
        <Route
          element={<RoleBasedRoute allowedRoles={["instructor", "admin"]} />}
        >
          <Route
            path="instructor/*"
            element={<div>Instructor Dashboard</div>}
          />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route path="admin/*" element={<div>Admin Dashboard</div>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

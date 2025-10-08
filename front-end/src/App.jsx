import { Routes, Route } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import MainLayout from "@components/layout/MainLayout";
import PrivateRoute from "@routes/PrivateRoute";
import RoleBasedRoute from "@routes/RoleBasedRoute";

// Pages
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import Register from "@pages/Register/Register";
import Dashboard from "@pages/Dashboard/Dashboard";
import Courses from "@pages/Courses/Courses";
import CourseDetail from "@pages/CourseDetail/CourseDetail";
import Learning from "@pages/Learning/Learning";
import Classroom from "@pages/Classroom/Classroom";
import Profile from "@pages/Profile/Profile";
import Forum from "@pages/Forum/Forum";
import NotFound from "@pages/NotFound/NotFound";
import Instructors from "@pages/Instructors/Instructors";
import RegisterLearner from "@pages/RegisterLearner/RegisterLearner";
import InstructorProfile from "@pages/InstructorProfile/InstructorProfile";
import Settings from "@pages/Settings/Settings";
import Quiz from "./pages/Quiz/Quiz";
import MyCourse from "./pages/MyCourse/MyCourse";

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

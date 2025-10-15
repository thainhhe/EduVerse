// src/routes/index.jsx

import RegisterLearner from "../pages/auth/RegisterLearner/RegisterLearner";
import Instructors from "../pages/common/Instructors/Instructors";
import InstructorProfile from "../pages/common/InstructorProfile/InstructorProfile";
import Settings from "../pages/common/Settings/Settings";
import PrivateRoute from "./PrivateRoute";
import PermissionBasedRoute from "./PermissionBasedRoute";

const routes = [
  {
    path: "/register-learner",
    element: <RegisterLearner />,
  },
  {
    path: "/instructors",
    element: <Instructors />,
  },
  {
    path: "/instructors/:id",
    element: <InstructorProfile />,
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    ),
  },
  // Ví dụ về route yêu cầu quyền
  {
    path: "/admin/users",
    element: (
      <PermissionBasedRoute allowedPermissions={["manage:users"]}>
        <UserManagementPage />
      </PermissionBasedRoute>
    ),
  },
];

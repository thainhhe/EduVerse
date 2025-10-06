import RegisterLearner from "../pages/RegisterLearner/RegisterLearner";
import Instructors from "../pages/Instructors/Instructors";
import InstructorProfile from "../pages/InstructorProfile/InstructorProfile";
import Settings from "../pages/Settings/Settings";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute"; // Declared PrivateRoute

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
];

import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// import NotFound from "../pages/errors/NotFound";
// import Unauthorized from "../pages/errors/Unauthorized";

const AdminDashboard = () => <h1>Admin Dashboard</h1>;

const CompanyDashboard = () => <h1>Company Dashboard</h1>;

const StudentDashboard = () => <h1>Student Dashboard</h1>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // =========================
  // PUBLIC
  // =========================

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },

  // =========================
  // PROTECTED
  // =========================

  {
    element: <ProtectedRoute />,

    children: [
      // ADMIN
      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,

        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },
        ],
      },

      // COMPANY
      {
        element: <RoleRoute allowedRoles={["COMPANY"]} />,

        children: [
          {
            path: "/company/dashboard",
            element: <CompanyDashboard />,
          },
        ],
      },

      // STUDENT
      {
        element: <RoleRoute allowedRoles={["STUDENT"]} />,

        children: [
          {
            path: "/student/dashboard",
            element: <StudentDashboard />,
          },
        ],
      },
    ],
  },

  // {
  //   path: "/unauthorized",
  //   element: <Unauthorized />,
  // },

  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
]);

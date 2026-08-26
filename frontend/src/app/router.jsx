import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";
import RootRedirect from "../components/guards/RootRedirect";

import AIChat from "../pages/AI/AiChat";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminLayout from "../layouts/AdminLayout/AdminLayout";

import NotFound from "../pages/errors/NotFound";
import Unauthorized from "../pages/errors/Unauthorized";

import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import StudentList from "../pages/admin/students/StudentList";
import StudentDetails from "../pages/admin/students/StudentDetails";
import StudentLeaderboard from "../pages/admin/students/StudentLeaderboard";
import CapstoneReview from "../pages/admin/capstones/CapstoneReview";
import AdminCertificates from "../pages/admin/certificates/Certificates";
import CourseList from "../pages/admin/courses/CourseList";
import CourseDetails from "../pages/admin/courses/CourseDetails";
import CreateCourse from "../pages/admin/courses/CreateCourse";
import EditCourse from "../pages/admin/courses/EditCourse";

// Student layout + pages
import StudentLayout from "../layouts/StudentLayout/StudentLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyCourses from "../pages/student/MyCourses";
import CourseCatalog from "../pages/student/CourseCatalog";
import CourseLearn from "../pages/student/CourseLearn";
import LessonLearn from "../pages/student/LessonLearn";
import MyProfile from "../pages/student/MyProfile";
import StudentCertificates from "../pages/student/Certificates";
import FinalAssessment from "../pages/student/FinalAssessment";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
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
      /*
    ================================================
    AI
    ================================================
    */

      {
        path: "/ai",
        element: <AIChat />,
      },
      // =========================
      // ADMIN
      // =========================

      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,

        children: [
          {
            path: "/admin",
            element: <AdminLayout />,

            children: [
              {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
              },

              {
                path: "dashboard",
                element: <AdminDashboard />,
              },

              // STUDENTS
              {
                path: "students",
                element: <StudentList />,
              },

              {
                path: "students/leaderboard",
                element: <StudentLeaderboard />,
              },

              {
                path: "students/:studentId",
                element: <StudentDetails />,
              },

              // COURSES
              {
                path: "courses",
                element: <CourseList />,
              },

              {
                path: "courses/new",
                element: <CreateCourse />,
              },

              {
                path: "courses/:courseId/edit",
                element: <EditCourse />,
              },

              {
                path: "courses/:courseId",
                element: <CourseDetails />,
              },

              // CAPSTONES
              {
                path: "capstones",
                element: <CapstoneReview />,
              },

              // CERTIFICATES
              {
                path: "certificates",
                element: <AdminCertificates />,
              },
            ],
          },
        ],
      },

      // =========================
      // STUDENT
      // =========================

      {
        element: <RoleRoute allowedRoles={["STUDENT"]} />,

        children: [
          {
            path: "/student",
            element: <StudentLayout />,

            children: [
              {
                index: true,
                element: <Navigate to="/student/dashboard" replace />,
              },

              {
                path: "dashboard",
                element: <StudentDashboard />,
              },

              {
                path: "courses",
                element: <MyCourses />,
              },

              {
                path: "catalog",
                element: <CourseCatalog />,
              },

              {
                path: "courses/:courseId/learn",
                element: <CourseLearn />,
              },

              {
                path: "courses/:courseId/learn/:lessonId",
                element: <LessonLearn />,
              },
              {
                path: "courses/:courseId/final",
                element: <FinalAssessment />,
              },

              {
                path: "certificates",
                element: <StudentCertificates />,
              },

              {
                path: "profile",
                element: <MyProfile />,
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================
  // ERRORS
  // =========================

  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

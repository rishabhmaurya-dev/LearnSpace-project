/* eslint-disable react-refresh/only-export-components -- route table exports a
   router object plus lazy() page references, which the fast-refresh rule cannot
   classify; this file is not a component module. */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleRoute from "../components/guards/RoleRoute";
import RootRedirect from "../components/guards/RootRedirect";
import Loader from "../components/ui/Loader";

const AIChat = lazy(() => import("../pages/AI/AiChat"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout/AdminLayout"));

const NotFound = lazy(() => import("../pages/errors/NotFound"));
const Unauthorized = lazy(() => import("../pages/errors/Unauthorized"));

const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/AdminDashboard"),
);
const StudentList = lazy(() => import("../pages/admin/students/StudentList"));
const StudentDetails = lazy(
  () => import("../pages/admin/students/StudentDetails"),
);
const StudentLeaderboard = lazy(
  () => import("../pages/admin/students/StudentLeaderboard"),
);
const CapstoneReview = lazy(
  () => import("../pages/admin/capstones/CapstoneReview"),
);
const AdminCertificates = lazy(
  () => import("../pages/admin/certificates/Certificates"),
);
const CourseList = lazy(() => import("../pages/admin/courses/CourseList"));
const CourseDetails = lazy(
  () => import("../pages/admin/courses/CourseDetails"),
);
const CreateCourse = lazy(() => import("../pages/admin/courses/CreateCourse"));
const EditCourse = lazy(() => import("../pages/admin/courses/EditCourse"));

// Student layout + pages
const StudentLayout = lazy(
  () => import("../layouts/StudentLayout/StudentLayout"),
);
const StudentDashboard = lazy(
  () => import("../pages/student/StudentDashboard"),
);
const MyCourses = lazy(() => import("../pages/student/MyCourses"));
const CourseCatalog = lazy(() => import("../pages/student/CourseCatalog"));
const CourseLearn = lazy(() => import("../pages/student/CourseLearn"));
const LessonLearn = lazy(() => import("../pages/student/LessonLearn"));
const MyProfile = lazy(() => import("../pages/student/MyProfile"));
const StudentCertificates = lazy(
  () => import("../pages/student/Certificates"),
);
const FinalAssessment = lazy(
  () => import("../pages/student/FinalAssessment"),
);

const withSuspense = (element) => (
  <Suspense fallback={<Loader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<RootRedirect />),
  },

  // public

  {
    path: "/login",
    element: withSuspense(<Login />),
  },

  {
    path: "/register",
    element: withSuspense(<Register />),
  },

  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPassword />),
  },

  {
    path: "/reset-password/:token",
    element: withSuspense(<ResetPassword />),
  },

  // protected

  {
    element: <ProtectedRoute />,

    children: [
      // admin

      {
        element: <RoleRoute allowedRoles={["ADMIN"]} />,

        children: [
          {
            path: "/admin",
            element: withSuspense(<AdminLayout />),

            children: [
              {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
              },

              {
                path: "dashboard",
                element: withSuspense(<AdminDashboard />),
              },

              // students
              {
                path: "students",
                element: withSuspense(<StudentList />),
              },

              {
                path: "students/leaderboard",
                element: withSuspense(<StudentLeaderboard />),
              },

              {
                path: "students/:studentId",
                element: withSuspense(<StudentDetails />),
              },

              // courses
              {
                path: "courses",
                element: withSuspense(<CourseList />),
              },

              {
                path: "courses/new",
                element: withSuspense(<CreateCourse />),
              },

              {
                path: "courses/:courseId/edit",
                element: withSuspense(<EditCourse />),
              },

              {
                path: "courses/:courseId",
                element: withSuspense(<CourseDetails />),
              },

              // capstones
              {
                path: "capstones",
                element: withSuspense(<CapstoneReview />),
              },

              // certificates
              {
                path: "certificates",
                element: withSuspense(<AdminCertificates />),
              },
            ],
          },
        ],
      },

      // student

      {
        element: <RoleRoute allowedRoles={["STUDENT"]} />,

        children: [
          // AI Chat — student-only
          {
            path: "/ai",
            element: withSuspense(<AIChat />),
          },

          {
            path: "/student",
            element: withSuspense(<StudentLayout />),

            children: [
              {
                index: true,
                element: <Navigate to="/student/dashboard" replace />,
              },

              {
                path: "dashboard",
                element: withSuspense(<StudentDashboard />),
              },

              {
                path: "courses",
                element: withSuspense(<MyCourses />),
              },

              {
                path: "catalog",
                element: withSuspense(<CourseCatalog />),
              },

              {
                path: "courses/:courseId/learn",
                element: withSuspense(<CourseLearn />),
              },

              {
                path: "courses/:courseId/learn/:lessonId",
                element: withSuspense(<LessonLearn />),
              },
              {
                path: "courses/:courseId/final",
                element: withSuspense(<FinalAssessment />),
              },

              {
                path: "certificates",
                element: withSuspense(<StudentCertificates />),
              },

              {
                path: "profile",
                element: withSuspense(<MyProfile />),
              },
            ],
          },
        ],
      },
    ],
  },

  // errors

  {
    path: "/unauthorized",
    element: withSuspense(<Unauthorized />),
  },

  {
    path: "*",
    element: withSuspense(<NotFound />),
  },
]);

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* 🔓 PUBLIC ROUTES (Direct Redirect if Already Logged In) */}
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* 🔒 PROTECTED USER ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Baaki Student Routes (e.g. /course/:id, /quiz) yahan aayenge */}
      </Route>

      {/* 🔐 ADMIN ONLY ROUTES */}
      <Route element={<AdminRoute />}>
        {/* <Route path="/admin/create-course" element={<CreateCoursePage />} /> */}
      </Route>

      {/* 🔴 DEFAULT CATCH-ALL ROUTE */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/register"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;

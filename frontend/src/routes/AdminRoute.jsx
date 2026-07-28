import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
 
  return user?.role === "ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AdminRoute;

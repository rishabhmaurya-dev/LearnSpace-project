import React from "react";
import { useSelector } from "react-redux";
import StudentDashboard from "./dashboards/StudentDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import CompanyDashboard from "./dashboards/CompanyDashboard";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "ADMIN") {
    return <AdminDashboard />;
  }

  if (user?.role === "COMPANY") {
    return <CompanyDashboard />;
  }

  return <StudentDashboard />;
};

export default DashboardPage;

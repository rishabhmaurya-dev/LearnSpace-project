import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Users,
  BookMarked,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { logoutUser } from "../../redux/slices/authSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Admin Control Center</h1>
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold rounded-md">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage courses, users, and platform content.
          </p>
        </div>
        <button
          onClick={() => dispatch(logoutUser(accessToken))}
          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Admin Action Bar */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/create-course")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Create New Course
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Courses</p>
            <h3 className="text-xl font-bold">12 Published</h3>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Registered Students</p>
            <h3 className="text-xl font-bold">1,240 Active</h3>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">System Logs</p>
            <h3 className="text-xl font-bold">0 System Errors</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

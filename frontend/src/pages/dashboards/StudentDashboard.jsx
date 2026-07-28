import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BookOpen, Award, CheckCircle2, Clock, LogOut } from "lucide-react";
import { logoutUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "Student"} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Track your learning progress and skill badges.
          </p>
        </div>
        <button
          onClick={() => dispatch(logoutUser(accessToken), navigate("/login"))}
          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Enrolled Courses</p>
            <h3 className="text-xl font-bold">3 Courses</h3>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Skill Badges</p>
            <h3 className="text-xl font-bold">2 Earned</h3>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Capstone Status</p>
            <h3 className="text-xl font-bold">In Review</h3>
          </div>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-lg font-bold mb-4">My Enrolled Courses</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="font-semibold text-sm">
                React.js Frontend Mastery
              </h4>
              <p className="text-xs text-slate-400">
                Lesson 4 of 12 • 40% Completed
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white transition">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

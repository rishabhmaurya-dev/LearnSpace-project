import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Building2, Search, UserCheck, Award, LogOut } from "lucide-react";
import { logoutUser } from "../../redux/slices/authSlice";

const CompanyDashboard = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {user?.name || "Company Portal"}
            </h1>
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold rounded-md">
              COMPANY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hire verified skill badge holders and review Capstones.
          </p>
        </div>
        <button
          onClick={() => dispatch(logoutUser(accessToken))}
          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Search Candidates Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl mb-8">
        <h3 className="text-sm font-bold mb-3">Search Skilled Talent</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by skill badge (e.g. React Specialist, Node.js Expert)..."
              className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white transition">
            Filter Talent
          </button>
        </div>
      </div>

      {/* Talent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Verified Candidates</p>
            <h3 className="text-xl font-bold">450+ Available</h3>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Shortlisted Profiles</p>
            <h3 className="text-xl font-bold">5 Candidates</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

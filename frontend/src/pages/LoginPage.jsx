import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginUser, clearAuthStates } from "../redux/slices/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthStates());

    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop')`,
        }}
      />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Left Side Info */}
        <div className="md:col-span-5 p-8 bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-purple-950/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
          <div>
            <span className="text-2xl font-black text-white tracking-wider">
              SkillForge
            </span>
            <h2 className="text-xl font-bold text-white mt-6 mb-3">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Log in to continue your lessons, complete Capstone projects, and
              view your Skill Badges.
            </p>
          </div>
          <p className="text-[10px] text-slate-500 mt-8">
            © 2026 SkillForge LMS Platform. All rights reserved.
          </p>
        </div>

        {/* Right Side: Raw HTML Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access your portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full py-2.5 pl-10 pr-3.5 bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full py-2.5 pl-10 pr-3.5 bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

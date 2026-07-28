import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { forgotPassword, clearAuthStates } from "../redux/slices/authSlice";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error, successMessage } = useSelector(
    (state) => state.auth,
  );
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearAuthStates());
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950">
      <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl z-10">
        <h1 className="text-2xl font-extrabold text-white mb-1">
          Reset Password
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Enter your registered email address to receive a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
              {successMessage}
            </div>
          )}

          <div className="w-full space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Registered Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 pl-10 pr-3.5 bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Reset Link
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

// import React from "react";
import { Code2, Rocket, Award, Sparkles } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1920&auto=format&fit=crop')`,
        }}
      />

      {/* Ambient Radial Gradient Glowing Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphic Main Card */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Left Side: SkillForge Info & Value Proposition */}
        <div className="md:col-span-5 p-8 bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-purple-950/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-500/30">
                <Code2 className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-2xl font-black text-white tracking-wider">
                SkillForge
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-3">
              Master Industrial Skills
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Learn through structured Markdown theory, execute code directly in
              the Monaco Editor, and build industry-ready Capstone projects.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                  <Rocket className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Interactive Lessons & Coding</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <span>Evaluation Quizzes & Badges</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Capstone Project Portfolio</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-8">
            © 2026 SkillForge LMS Platform. All rights reserved.
          </p>
        </div>

        {/* Right Side: Dynamic Form Box */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">{title}</h1>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

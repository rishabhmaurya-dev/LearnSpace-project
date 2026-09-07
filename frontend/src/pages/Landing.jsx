import { useState } from "react";
import "./Landing.css";
import ScrollReveal from "../animation/Scroll";

import { useNavigate } from "react-router-dom";

// platform modules
const MODULES = [
  {
    icon: "📚",
    title: "Course Catalog",
    desc: "Browse published courses, filter by category, search by keyword, and enroll in the skills you want to master.",
  },
  {
    icon: "🎬",
    title: "Structured Lessons",
    desc: "Learn through rich markdown lessons with syntax-highlighted code, complete with your own course progress.",
  },
  {
    icon: "🧠",
    title: "Quizzes & Final Assessment",
    desc: "Lock in each module with quizzes and finish with a capstone-based final assessment before you graduate.",
  },
  {
    icon: "🚀",
    title: "Capstone Projects",
    desc: "Submit a real-world capstone project that is reviewed by admins as the final proof of your skills.",
  },
  {
    icon: "🏆",
    title: "Student Leaderboard",
    desc: "See how you rank against peers in real time on the student leaderboard, powered by your activity.",
  },
  {
    icon: "📊",
    title: "Progress Dashboard",
    desc: "Track completion, activity streaks, and learning velocity at a glance on your personal dashboard.",
  },
  {
    icon: "🤖",
    title: "LearnSpace AI Mentor",
    desc: "Ask an AI companion to explain concepts, debug your code, or help you prep for assessments — in real time.",
  },
  {
    icon: "🛡️",
    title: "QR Verified Certificates",
    desc: "Complete a course and earn a QR-verified PDF certificate you can share and verify anywhere.",
  },
];

// learner journey
const FLOW = [
  {
    step: "01",
    title: "Create Your Account",
    desc: "Register as a Student or Admin and land directly in your own workspace.",
  },
  {
    step: "02",
    title: "Browse & Enroll",
    desc: "Explore the course catalog by category, search topics, and enroll in a course.",
  },
  {
    step: "03",
    title: "Learn & Practice",
    desc: "Work through markdown lessons, code examples, and quizzes at your own pace.",
  },
  {
    step: "04",
    title: "Final + Capstone",
    desc: "Take the final assessment and submit your capstone project for admin review.",
  },
  {
    step: "05",
    title: "Get Certified",
    desc: "Earn a QR-verified certificate and showcase it on your profile and resume.",
  },
];

// roles
const STUDENT_ITEMS = [
  "Personal dashboard & progress tracking",
  "Course catalog, enrollment & my courses",
  "Lesson learning with quizzes & final assessment",
  "Capstone project submission",
  "QR-verified certificates",
  "Student leaderboard standings",
  "LearnSpace AI mentor access",
];

const ADMIN_ITEMS = [
  "Admin analytics dashboard",
  "Students overview, details & leaderboard",
  "Course builder — lessons, quizzes & capstone",
  "Capstone submission review",
  "Certificate management & issuance",
  "Course publish / draft lifecycle",
];

// faq
const FAQS = [
  {
    q: "How do I start learning?",
    a: "Create a student account, log in, open the course catalog, pick a course by category, and enroll. Your dashboard will then guide you through lessons, quizzes, and the final assessment.",
  },
  {
    q: "What is a capstone project?",
    a: "Each course ends with a real-world capstone project. You submit your work directly in the platform and an admin reviews the submission before it is finalised.",
  },
  {
    q: "How do course certificates work?",
    a: "Once you complete the lessons, quizzes, and capstone of a course, you earn a certificate in your Certificates page as a downloadable PDF with a QR code that anyone can scan to verify it.",
  },
  {
    q: "What is LearnSpace AI?",
    a: "It's a built-in AI learning companion. You can ask it to explain course concepts, debug your code, or help you prepare for assessments — responses stream live in your chat.",
  },
  {
    q: "Is there a leaderboard?",
    a: "Yes. Students are ranked on a live leaderboard based on their learning activity and progress, so you can see how you compare with your peers.",
  },
  {
    q: "What can an admin do on the platform?",
    a: "Admins get a full studio: an analytics dashboard, student management and leaderboard, a course builder with lessons/quizzes/capstone steps, capstone review and certificate management.",
  },
];

// tour mock uis

const MockLearner = () => (
  <div className="lm-shell">
    <aside className="lm-side">
      <div className="lm-side-logo">
        <img src="/logo.jpg" alt="LearnSpace" />
        LearnSpace
      </div>
      {[
        ["▦", "Dashboard", true],
        ["📚", "My Courses", false],
        ["🛍️", "Catalog", false],
        ["🪪", "Certificates", false],
        ["🤖", "AI Mentor", false],
        ["👤", "Profile", false],
      ].map(([icon, label, active]) => (
        <div
          key={label}
          className={`lm-nav ${active ? "lm-nav-active" : ""}`}
        >
          <span className="lm-nav-icon">{icon}</span>
          <span>{label}</span>
        </div>
      ))}
    </aside>

    <div className="lm-main">
      <div className="lm-topbar">
        <div>
          <span className="lm-eyebrow">Course · Introduction to React</span>
          <div className="lm-title">useEffect — Handling Side Effects</div>
        </div>
        <div className="lm-progress">
          <span>Progress</span>
          <div className="lm-progress-bg">
            <div className="lm-progress-fill" />
          </div>
          <strong>65%</strong>
        </div>
      </div>

      <div className="lm-body">
        <div className="lm-lessons">
          <span className="lm-panel-title">Lessons</span>
          {[
            ["Introduction", true],
            ["Components & Props", true],
            ["useState in depth", false],
            ["useEffect & Side Effects", false],
            ["Handling Events", false],
          ].map(([t, done], i) => (
            <div
              key={t}
              className={`lm-lesson ${i === 3 ? "lm-lesson-active" : ""}`}
            >
              <span className={`lm-dot ${done ? "lm-done" : ""}`}>
                {done ? "✓" : "•"}
              </span>
              {t}
            </div>
          ))}
        </div>

        <div className="lm-content">
          <p className="lm-mk">
            The <span className="mk-k">useEffect</span> hook lets you run side
            effects after React renders your component — data fetching, timers,
            and DOM updates.
          </p>

          <pre className="lm-code">
            <span className="mk-k">const</span>{" "}
            <span className="mk-f">CountButton</span> = () =&gt;
            {"{"}
            {"\n"}
            {"  "}
            <span className="mk-k">const</span> [count,{" "}
            <span className="mk-f">setCount</span>] ={" "}
            <span className="mk-f">useState</span>(<span className="mk-n">0</span>
            );{"\n"}
            {"\n"}
            {"  "}
            <span className="mk-f">useEffect</span>(() =&gt; {"{"}
            {"\n"}
            {"    "}
            <span className="mk-f">document</span>.title = `Count: $`
            {"{"}count{"}"}`;{"\n"}
            {"  "}
            {"}"}, [count]);{"\n"}
            {"  "}
            <span className="mk-k">return</span> (
            {"\n"}
            {"    "}
            <span className="mk-p">&lt;</span>
            <span className="mk-tag">button</span>
            <span className="mk-p">&gt;</span>
            {"{"}count{"}"}
            <span className="mk-p">&lt;/</span>
            <span className="mk-tag">button</span>
            <span className="mk-p">&gt;</span>
            {"\n"}
            {"  "}
            );{"\n"}
            {"};"}
          </pre>

          <div className="lm-actions">
            <span className="lm-quiz-chip">📝 Module Quiz — 5 questions</span>
            <span className="lm-btn-demo">Next Lesson →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MockStudio = () => (
  <div className="lm-shell lm-studio">
    <div className="lm-studio-top">
      <div>
        <span className="lm-eyebrow">Admin Studio · Course Builder</span>
        <div className="lm-title">Node.js Full-Stack Program</div>
      </div>
      <span className="lm-badge-live">✓ Published</span>
    </div>

    <div className="lm-stepper">
      {["Basic Info", "Lessons", "Quizzes", "Capstone", "Review"].map(
        (label, i) => (
          <div
            key={label}
            className={`lm-step ${i < 4 ? "lm-step-done" : ""} ${
              i === 0 ? "lm-step-current" : ""
            }`}
          >
            <span className="lm-step-icon">{i < 4 ? "✓" : i + 1}</span>
            {label}
          </div>
        ),
      )}
    </div>

    <div className="lm-studio-body">
      <div className="lm-form-col">
        <label className="lm-field">
          <span>Course Title</span>
          <div className="lm-input-fill">Introduction to React</div>
        </label>
        <label className="lm-field">
          <span>Category</span>
          <div className="lm-input-fill">Frontend Development</div>
        </label>
        <label className="lm-field">
          <span>Description</span>
          <div className="lm-input-area" />
        </label>
      </div>

      <div className="lm-preview-col">
        <span className="lm-panel-title">Course Stats</span>
        <div className="lm-stat-row">
          {[
            ["📚", "14", "Lessons"],
            ["🧠", "8", "Quizzes"],
            ["🚀", "1", "Capstone"],
            ["🎓", "320", "Students"],
          ].map(([icon, num, label]) => (
            <div key={label} className="lm-stat-cell">
              <span>{icon}</span>
              <strong>{num}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <div className="lm-preview-actions">
          <span className="lm-btn-demo">Add Lesson</span>
          <span className="lm-btn-ghost">Preview Course</span>
        </div>
      </div>
    </div>
  </div>
);

const MockAi = () => (
  <div className="lm-shell lm-ai">
    <div className="lm-ai-header">
      <span className="lm-ai-avatar">✦</span>
      <div>
        <div className="lm-title">LearnSpace AI</div>
        <span className="lm-ai-sub">Your interactive AI learning companion</span>
      </div>
      <span className="lm-btn-ghost">Clear Chat</span>
    </div>

    <div className="lm-chat">
      <div className="lm-bubble lm-bubble-bot">
        <span className="lm-bubble-name">LearnSpace AI</span>
        <p>
          Hello! I can explain concepts, debug your code, or help you prep for
          your next assessment. Try asking me something like...
        </p>
      </div>

      <div className="lm-bubble lm-bubble-user">
        How does JWT authentication work step-by-step?
      </div>

      <div className="lm-bubble lm-bubble-bot">
        <span className="lm-bubble-name">LearnSpace AI</span>
        <p>Great question! Here's the flow:</p>
        <pre className="lm-code lm-ai-code">
          <span className="mk-n">1.</span> Login sends credentials to the API
          {"\n"}
          <span className="mk-n">2.</span> Server verifies and signs a JWT
          {"\n"}
          <span className="mk-n">3.</span> Client stores the token securely
          {"\n"}
          <span className="mk-n">4.</span> Every request sends:{"\n"}
          {"  "}
          <span className="mk-s">"Authorization: Bearer &lt;token&gt;"</span>
        </pre>
        <p>Every subsequent request is now authenticated with that token.</p>
      </div>

      <div className="lm-typing">
        <span />
        <span />
        <span />
      </div>
    </div>

    <div className="lm-input-row">
      <div className="lm-input-pill">Ask LearnSpace AI anything...</div>
      <span className="lm-send">➤</span>
    </div>
  </div>
);

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [tourTab, setTourTab] = useState("learner");

  const navigate = useNavigate();

  return (
    <div className="ls-landing">
      {/* navbar */}
      <nav className="ls-navbar">
        <div className="ls-container ls-nav-wrapper">
          <a href="#home" className="ls-logo">
            <img
              src="/logo.jpg"
              alt="LearnSpace"
              className="ls-logo-img"
            />
            <span>
              Learn<span className="ls-logo-accent">Space</span>
            </span>
          </a>

          <ul className="ls-nav-links">
            <li>
              <a href="#modules">Modules</a>
            </li>
            <li>
              <a href="#flow">How It Works</a>
            </li>
            <li>
              <a href="#roles">Workspaces</a>
            </li>
            <li>
              <a href="#tour">Tour</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>

          <div className="ls-nav-actions">
            <button
              className="ls-btn ls-btn-outline"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>

            <button
              className="ls-btn ls-btn-primary"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="ls-main">
        {/* hero */}
        <ScrollReveal>
          <section className="ls-hero ls-container" id="home">
            <div className="ls-tagline-badge">
              <span className="ls-badge-dot" />
              Your all-in-one learning platform
            </div>

            <h1 className="ls-hero-title">
              Learn. Practice.
              <br />
              <span className="ls-gradient">Prove It with Capstones.</span>
            </h1>

            <p className="ls-hero-subtitle">
              Enroll in structured courses, work through lessons and quizzes,
              submit a real capstone project, and walk away with a QR-verified
              certificate — supported by your own AI mentor.
            </p>

            <div className="ls-hero-cta">
              <button
                className="ls-btn ls-btn-primary ls-btn-hero"
                onClick={() => navigate("/register")}
              >
                Start Learning Free →
              </button>

              <button
                className="ls-btn ls-btn-outline ls-btn-hero"
                onClick={() => navigate("/login")}
              >
                Continue as Student
              </button>
            </div>

            <div className="ls-hero-chips">
              <span className="ls-chip">📚 Structured lessons</span>
              <span className="ls-chip">🧠 Quizzes & final assessment</span>
              <span className="ls-chip">🚀 Capstone submission</span>
              <span className="ls-chip">🛡️ QR verified certificates</span>
              <span className="ls-chip">🤖 AI mentor</span>
            </div>
          </section>
        </ScrollReveal>

        {/* technology marquee */}
        <ScrollReveal>
          <div className="ls-marquee-wrapper">
            <div className="ls-marquee-content">
              {[
                "React.js",
                "Node.js",
                "Express",
                "MongoDB",
                "Redux",
                "BCrypt & JWT",
                "Markdown Lessons",
                "Structured Quizzes",
                "Capstone Review",
                "QR Certificates",
                "AI Mentor",
              ].map((item, i) => (
                <span className="ls-marquee-item" key={`${item}-${i}`}>
                  {item}
                  <i>✦</i>
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* modules */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="modules">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">Platform Modules</span>
              <h2 className="ls-section-title">
                Everything Is Built Around Real Learning
              </h2>
              <p className="ls-section-subtitle">
                Every module below is a live part of the platform — from the
                student catalog to the admin review desk.
              </p>
            </div>

            <div className="ls-modules-grid">
              {MODULES.map((m) => (
                <div className="ls-module-card" key={m.title}>
                  <div className="ls-module-icon">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* how it works */}
        <ScrollReveal>
          <section className="ls-section ls-section-alt" id="flow">
            <div className="ls-container">
              <div className="ls-section-head">
                <span className="ls-section-eyebrow">How It Works</span>
                <h2 className="ls-section-title">
                  From Sign-Up to Certified in 5 Steps
                </h2>
                <p className="ls-section-subtitle">
                  A repeatable journey that takes you from your first lesson to
                  a verified certificate.
                </p>
              </div>

              <div className="ls-flow-grid">
                {FLOW.map((step) => (
                  <div className="ls-flow-card" key={step.title}>
                    <div className="ls-step-num">{step.step}</div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* roles / workspaces */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="roles">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">Roles & Workspaces</span>
              <h2 className="ls-section-title">
                Two Homes, One Platform
              </h2>
              <p className="ls-section-subtitle">
                Students get a learning workspace; admins get a full studio to
                build courses, review capstones, and manage learners.
              </p>
            </div>

            <div className="ls-roles">
              <div className="ls-role-card">
                <div className="ls-role-tag">STUDENT</div>
                <h3>Learner Workspace</h3>
                <p>
                  Your dashboard, courses, lessons, quizzes, capstones,
                  certificates, leaderboard, and AI mentor — everything in one
                  place.
                </p>
                <ul>
                  {STUDENT_ITEMS.map((item) => (
                    <li key={item}>
                      <span className="ls-check">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ls-role-card ls-role-admin">
                <div className="ls-role-tag">ADMIN</div>
                <h3>Admin Studio</h3>
                <p>
                  A powerful command center to publish courses, shape
                  assessments, and keep quality high across the platform.
                </p>
                <ul>
                  {ADMIN_ITEMS.map((item) => (
                    <li key={item}>
                      <span className="ls-check">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* interactive platform tour */}
        <ScrollReveal>
          <section className="ls-section ls-section-alt" id="tour">
            <div className="ls-container">
              <div className="ls-section-head">
                <span className="ls-section-eyebrow">Live Tour</span>
                <h2 className="ls-section-title">See the Platform in Action</h2>
                <p className="ls-section-subtitle">
                  Real interfaces from the app — switch between the learner
                  workspace, the admin studio, and the AI mentor.
                </p>
              </div>

              <div className="ls-tour">
                <div className="ls-tour-tabs">
                  <button
                    className={`ls-tour-tab ${
                      tourTab === "learner" ? "active" : ""
                    }`}
                    onClick={() => setTourTab("learner")}
                  >
                    🎓 Learner Workspace
                  </button>
                  <button
                    className={`ls-tour-tab ${
                      tourTab === "studio" ? "active" : ""
                    }`}
                    onClick={() => setTourTab("studio")}
                  >
                    🛠️ Admin Studio
                  </button>
                  <button
                    className={`ls-tour-tab ${
                      tourTab === "ai" ? "active" : ""
                    }`}
                    onClick={() => setTourTab("ai")}
                  >
                    🤖 AI Mentor
                  </button>
                </div>

                <div className="ls-tour-panel">
                  {tourTab === "learner" && <MockLearner />}
                  {tourTab === "studio" && <MockStudio />}
                  {tourTab === "ai" && <MockAi />}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* certificate band */}
        <ScrollReveal>
          <section className="ls-container">
            <div className="ls-cert-band">
              <div className="ls-cert-icon">🛡️</div>
              <div>
                <h2>QR-Verified Certificates You Can Actually Prove</h2>
                <p>
                  Pass the lessons, quizzes, and capstone of any course and a
                  certificate lands in your profile — every PDF carries a QR
                  code anyone can scan to verify it instantly.
                </p>
              </div>
              <button
                className="ls-btn ls-btn-primary ls-btn-hero"
                onClick={() => navigate("/register")}
              >
                Claim Yours →
              </button>
            </div>
          </section>
        </ScrollReveal>

        {/* faq */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="faq">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">FAQ</span>
              <h2 className="ls-section-title">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="ls-faq">
              {FAQS.map((item, i) => (
                <div
                  className={`ls-faq-item ${openFaq === i ? "open" : ""}`}
                  key={item.q}
                >
                  <button
                    className="ls-faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <span className="ls-faq-icon">+</span>
                  </button>
                  <div className="ls-faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* cta banner */}
        <ScrollReveal>
          <section className="ls-container">
            <div className="ls-cta-banner">
              <div>
                <span className="ls-cta-badge">Start Your Learning Journey</span>
                <h2>
                  Ready to Build Your
                  <br />
                  Next Skill?
                </h2>
                <p>
                  Join LearnSpace — enroll in a course, finish your capstone,
                  and earn a certificate you can verify anywhere.
                </p>
              </div>

              <button
                className="ls-btn ls-btn-primary ls-btn-hero"
                onClick={() => navigate("/register")}
              >
                Get Started Free →
              </button>
            </div>
          </section>
        </ScrollReveal>
      </div>

      {/* footer */}
      <ScrollReveal>
        <footer className="ls-footer">
          <div className="ls-container">
            <div className="ls-footer-grid">
              <div className="ls-footer-col">
                <a href="#home" className="ls-logo ls-footer-logo">
                  <img
                    src="/logo.jpg"
                    alt="LearnSpace"
                    className="ls-logo-img"
                  />
                  <span>
                    Learn<span className="ls-logo-accent">Space</span>
                  </span>
                </a>

                <p className="ls-footer-desc">
                  A complete learning platform — structured lessons, quizzes,
                  capstone projects, QR-verified certificates, and an AI mentor.
                </p>
              </div>

              <div className="ls-footer-col">
                <h4>Learn</h4>
                <ul>
                  <li>
                    <a href="#modules">Course Catalog</a>
                  </li>
                  <li>
                    <a href="#modules">Lessons & Quizzes</a>
                  </li>
                  <li>
                    <a href="#modules">Capstone Projects</a>
                  </li>
                  <li>
                    <a href="#modules">Certificates</a>
                  </li>
                </ul>
              </div>

              <div className="ls-footer-col">
                <h4>Platform</h4>
                <ul>
                  <li>
                    <a href="#flow">How It Works</a>
                  </li>
                  <li>
                    <a href="#roles">Student Workspace</a>
                  </li>
                  <li>
                    <a href="#roles">Admin Studio</a>
                  </li>
                  <li>
                    <a href="#tour">Platform Tour</a>
                  </li>
                </ul>
              </div>

              <div className="ls-footer-col">
                <h4>Support</h4>
                <ul>
                  <li>
                    <a href="#faq">FAQ</a>
                  </li>
                  <li>
                    <a href="/login">Student Login</a>
                  </li>
                  <li>
                    <a href="/register">Create Account</a>
                  </li>
                  <li>
                    <a href="/login">Admin Login</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="ls-copyright">
              © {new Date().getFullYear()} LearnSpace Learning Platform. All rights
              reserved.
            </div>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
};

export default Landing;
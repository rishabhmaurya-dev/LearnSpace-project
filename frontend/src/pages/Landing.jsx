import React, { useState } from "react";
import "./Landing.css";
import ScreenshotCarousel from "../components/ui/ScreenshotCarousel";

import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [selectedTopic, setSelectedTopic] = useState("useState");

  const navigate = useNavigate();

  return (
    <div className="ls-landing">
      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav className="ls-navbar">
        <div className="ls-container ls-nav-wrapper">
          <a href="#home" className="ls-logo">
            Learn<span>Space</span>
          </a>

          <ul className="ls-nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#flow">How It Works</a>
            </li>
            <li>
              <a href="#courses">Courses</a>
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

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="ls-hero ls-container" id="home">
        <div className="ls-tagline-badge">
          Learn. Practice. Prove Your Skills.
        </div>

        <h1 className="ls-hero-title">
          Build Skills That<br />
          <span>Take You Further</span>
        </h1>

        <p className="ls-hero-subtitle">
          Learn in a structured way, practice with interactive lessons, test
          your knowledge through quizzes, track your progress, and earn
          certificates as you master new skills.
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
            Continue Learning
          </button>
        </div>
      </section>

      {/* =========================================
          SCREENSHOT CAROUSEL
      ========================================= */}
      <ScreenshotCarousel />

      {/* =========================================
          INFINITE MARQUEE
      ========================================= */}
      <div className="ls-marquee-wrapper">
        <div className="ls-marquee-content">
          <div className="ls-marquee-item">React.js</div>
          <div className="ls-marquee-item">Node.js</div>
          <div className="ls-marquee-item">Python</div>
          <div className="ls-marquee-item">MongoDB</div>
          <div className="ls-marquee-item">Hands-on Practice</div>
          <div className="ls-marquee-item">Interactive Quizzes</div>
          <div className="ls-marquee-item">Progress Tracking</div>
          <div className="ls-marquee-item">Verified Certificates</div>

          {/* Duplicate for infinite animation */}
          <div className="ls-marquee-item">React.js</div>
          <div className="ls-marquee-item">Node.js</div>
          <div className="ls-marquee-item">Python</div>
          <div className="ls-marquee-item">MongoDB</div>
          <div className="ls-marquee-item">Hands-on Practice</div>
          <div className="ls-marquee-item">Interactive Quizzes</div>
          <div className="ls-marquee-item">Progress Tracking</div>
          <div className="ls-marquee-item">Verified Certificates</div>
        </div>
      </div>

      {/* =========================================
          PLATFORM FLOW
      ========================================= */}
      <section className="ls-container ls-explorer" id="flow">
        <h2 className="ls-section-title">
          Everything You Need<br />to Keep Learning
        </h2>

        <p className="ls-section-subtitle">
          A simple and structured learning experience designed to help you
          learn, practice, and track your progress.
        </p>

        {/* Role Tabs */}
        <div className="ls-role-tabs">
          <button
            className={`ls-tab-btn ${activeTab === "student" ? "active" : ""}`}
            onClick={() => setActiveTab("student")}
          >
            Student Learning
          </button>

          <button
            className={`ls-tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Admin Panel
          </button>
        </div>

        {/* STUDENT FLOW */}
        <div className="ls-flow-grid">
          {activeTab === "student" && (
            <>
              <div className="ls-flow-card">
                <div className="ls-step-num">01</div>

                <h3>Choose a Course</h3>

                <p>
                  Explore structured courses and select the skills you want to
                  learn and master.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">02</div>

                <h3>Learn Topic by Topic</h3>

                <p>
                  Watch lessons, read notes, access learning resources, and
                  progress through each topic at your own pace.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">03</div>

                <h3>Practice & Take Quizzes</h3>

                <p>
                  Test your understanding with interactive quizzes and improve
                  your knowledge as you progress.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">04</div>

                <h3>Track Progress & Earn Certificates</h3>

                <p>
                  Monitor your learning journey, complete courses, and earn
                  certificates for your achievements.
                </p>
              </div>
            </>
          )}

          {/* ADMIN FLOW */}
          {activeTab === "admin" && (
            <>
              <div className="ls-flow-card">
                <div className="ls-step-num">01</div>

                <h3>Manage Courses</h3>

                <p>
                  Create courses, organize modules, and structure lessons for
                  students.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">02</div>

                <h3>Create Learning Content</h3>

                <p>
                  Add video lessons, notes, downloadable resources, and other
                  learning materials.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">03</div>

                <h3>Quiz Management</h3>

                <p>
                  Create question banks, manage quizzes, configure passing
                  criteria, and monitor performance.
                </p>
              </div>

              <div className="ls-flow-card">
                <div className="ls-step-num">04</div>

                <h3>Monitor Student Progress</h3>

                <p>
                  Track enrollments, learning progress, quiz performance, and
                  completed certificates.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =========================================
          INTERACTIVE LMS DEMO
      ========================================= */}
      <section className="ls-container" id="courses">
        <div className="ls-lms-demo">
          <div className="ls-lms-header">
            <div>
              <span className="ls-tagline-badge" style={{ marginBottom: 4 }}>
                Interactive Learning Experience
              </span>

              <h3 style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}>
                React.js Complete Course
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div>
                <small style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Course Progress
                </small>

                <div className="ls-progress-bar-bg">
                  <div className="ls-progress-fill"></div>
                </div>
              </div>

              <span style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--accent)",
              }}>
                65%
              </span>
            </div>
          </div>

          <div className="ls-lms-grid">
            {/* TOPICS */}
            <div className="ls-resource-box">
              <h4 style={{
                margin: "0 0 16px 0",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}>
                Course Topics
              </h4>

              <div className="ls-topic-list">
                {[
                  "Introduction",
                  "Components",
                  "Props",
                  "useState",
                  "useEffect",
                ].map((topic) => (
                  <button
                    key={topic}
                    className={`ls-topic-btn ${
                      selectedTopic === topic ? "active" : ""
                    }`}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <div className="ls-resource-list">
                <button className="ls-btn ls-btn-resource">
                  Download CheatSheet
                </button>

                <button className="ls-btn ls-btn-resource">
                  Topic Notes
                </button>
              </div>
            </div>

            {/* VIDEO SECTION */}
            <div className="ls-video-player-card">
              <div className="ls-video-header">
                <span>Video Lesson: {selectedTopic}</span>

                <span>12 min</span>
              </div>

              <div className="ls-player-screen">
                <div className="ls-play-button">▶</div>
              </div>

              <div className="ls-video-actions">
                <button className="ls-btn ls-btn-primary">
                  Take Topic Quiz
                </button>

                <button className="ls-btn ls-btn-outline">Next Lesson →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          LEARNING CTA
      ========================================= */}
      <section className="ls-container">
        <div className="ls-learning-cta">
          <div>
            <span className="ls-cta-badge">Start Your Learning Journey</span>

            <h2>Ready to Build Your<br />Next Skill?</h2>

            <p>
              Join LearnSpace and start learning with structured courses,
              interactive quizzes, progress tracking, and certificates.
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

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="ls-footer">
        <div className="ls-container">
          <div className="ls-footer-grid">
            <div className="ls-footer-col">
              <a
                href="#home"
                className="ls-logo"
                style={{ marginBottom: "16px", display: "inline-flex" }}
              >
                Learn<span>Space</span>
              </a>

              <p style={{
                color: "var(--muted-foreground)",
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}>
                Learn, practice, and build real skills with structured courses,
                interactive quizzes, and progress tracking.
              </p>
            </div>

            <div className="ls-footer-col">
              <h4>Platform</h4>

              <ul>
                <li>
                  <a href="#home">Home</a>
                </li>

                <li>
                  <a href="#features">Features</a>
                </li>

                <li>
                  <a href="#flow">How It Works</a>
                </li>
              </ul>
            </div>

            <div className="ls-footer-col">
              <h4>Learning</h4>

              <ul>
                <li>
                  <a href="#courses">Course Catalog</a>
                </li>

                <li>
                  <a href="#courses">Interactive Quizzes</a>
                </li>

                <li>
                  <a href="#courses">Track Progress</a>
                </li>
              </ul>
            </div>

            <div className="ls-footer-col">
              <h4>Achievements</h4>

              <ul>
                <li>
                  <a href="#courses">Certificates</a>
                </li>

                <li>
                  <a href="#courses">Learning Progress</a>
                </li>

                <li>
                  <a href="#courses">Student Profile</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="ls-copyright">
            © {new Date().getFullYear()} LearnSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

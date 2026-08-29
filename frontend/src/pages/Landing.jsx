import React, { useState } from "react";
import "./Landing.css";
import ScrollReveal from "../animation/Scroll";

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
      <ScrollReveal>
        <section className="ls-hero ls-container" id="home">
          <div className="ls-tagline-badge">
            Learn. Practice. Prove Your Skills.
          </div>

          <h1 className="ls-hero-title">
            Build Skills That
            <br />
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
      </ScrollReveal>

      {/* =========================================
          INFINITE MARQUEE
      ========================================= */}
      <ScrollReveal>
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
      </ScrollReveal>

      {/* =========================================
          INTERACTIVE LMS DEMO
      ========================================= */}
      <ScrollReveal>
        <section className="ls-container" id="courses">
          <div className="ls-lms-demo">
            <div className="ls-lms-header">
              <div>
                <span className="ls-tagline-badge" style={{ marginBottom: 4 }}>
                  Interactive Learning Experience
                </span>

                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-heading)",
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--foreground)",
                  }}
                >
                  React.js Complete Course
                </h3>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div>
                  <small
                    style={{
                      color: "var(--muted-foreground)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Course Progress
                  </small>

                  <div className="ls-progress-bar-bg">
                    <div className="ls-progress-fill"></div>
                  </div>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "18px",
                    color: "var(--accent)",
                  }}
                >
                  65%
                </span>
              </div>
            </div>

            <div className="ls-lms-grid">
              {/* TOPICS */}
              <div className="ls-resource-box">
                <h4
                  style={{
                    margin: "0 0 16px 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                  }}
                >
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

                  <button className="ls-btn ls-btn-outline">
                    Next Lesson →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* =========================================
          LEARNING CTA
      ========================================= */}
      <ScrollReveal>
        <section className="ls-container">
          <div className="ls-learning-cta">
            <div>
              <span className="ls-cta-badge">Start Your Learning Journey</span>

              <h2>
                Ready to Build Your
                <br />
                Next Skill?
              </h2>

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
      </ScrollReveal>

      {/* =========================================
          FOOTER
      ========================================= */}
      <ScrollReveal>
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

                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    maxWidth: "280px",
                  }}
                >
                  Learn, practice, and build real skills with structured
                  courses, interactive quizzes, and progress tracking.
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
      </ScrollReveal>
    </div>
  );
};

export default Landing;

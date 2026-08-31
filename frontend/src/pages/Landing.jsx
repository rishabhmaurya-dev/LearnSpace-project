import { useState } from "react";
import "./Landing.css";
import ScrollReveal from "../animation/Scroll";

import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: "◆",
    title: "Structured Courses",
    desc: "Step-by-step learning paths that guide you from fundamentals to mastery, one focused module at a time.",
  },
  {
    icon: "◈",
    title: "Interactive Practice",
    desc: "Build real skills with hands-on lessons, coding challenges, and exercises designed to stick.",
  },
  {
    icon: "▣",
    title: "Quizzes & Assessments",
    desc: "Test your knowledge with interactive quizzes that give instant feedback so you always know where you stand.",
  },
  {
    icon: "◎",
    title: "Progress Tracking",
    desc: "See your learning velocity in real time with clear progress bars, streaks, and completion metrics.",
  },
  {
    icon: "◉",
    title: "Verified Certificates",
    desc: "Earn a certificate for every course you complete and prove your skills wherever you go.",
  },
  {
    icon: "✧",
    title: "Learn At Your Pace",
    desc: "Lifetime access and a pace that fits your schedule. Start, pause, and resume without losing momentum.",
  },
];

const PROCESS = [
  {
    title: "Choose a Path",
    desc: "Browse structured courses and pick the skill you want to master next.",
  },
  {
    title: "Learn & Practice",
    desc: "Watch lessons, read notes, and apply what you learn with interactive exercises.",
  },
  {
    title: "Test Yourself",
    desc: "Take quizzes after every module to lock in knowledge and track your progress.",
  },
  {
    title: "Get Certified",
    desc: "Complete the course, earn your certificate, and move to the next level.",
  },
];

const PLANS = [
  {
    name: "Explorer",
    price: "$0",
    period: "/forever",
    desc: "Start learning today — no credit card required.",
    features: [
      "Access to starter courses",
      "Interactive quizzes",
      "Personal progress tracking",
      "Community support",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    desc: "Everything you need to go deep and stay consistent.",
    features: [
      "All courses included",
      "Priority practice exercises",
      "Detailed analytics",
      "Verified certificates",
      "Ad-free experience",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Teams",
    price: "$29",
    period: "/month",
    desc: "For squads and classrooms that learn together.",
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Team progress dashboards",
      "Admin controls & reports",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. The Explorer plan is free forever with no credit card required. You can upgrade to Pro whenever you're ready.",
  },
  {
    q: "How do certificates work?",
    a: "Once you complete all modules and quizzes in a course, you'll unlock a verified certificate you can download and share on your profile or resume.",
  },
  {
    q: "Can I learn at my own pace?",
    a: "Absolutely. All courses are self-paced and you get lifetime access, so you can start, pause, and resume whenever it fits your schedule.",
  },
  {
    q: "What subjects are available?",
    a: "We cover modern full-stack development, including React, Node.js, Python, databases, and more — with new courses added regularly.",
  },
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings.",
  },
];

const Landing = () => {
  const [selectedTopic, setSelectedTopic] = useState("useState");
  const [openFaq, setOpenFaq] = useState(0);

  const navigate = useNavigate();

  return (
    <div className="ls-landing">
      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav className="ls-navbar">
        <div className="ls-container ls-nav-wrapper">
          <a href="#home" className="ls-logo">
            <span className="ls-logo-mark">L</span>
            Learn<span>Space</span>
          </a>

          <ul className="ls-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#flow">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
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
        {/* =========================================
            HERO
        ========================================= */}
        <ScrollReveal>
          <section className="ls-hero ls-container" id="home">
            <div className="ls-tagline-badge">
              Learn. Practice. Prove Your Skills.
            </div>

            <h1 className="ls-hero-title">
              Build Skills That
              <br />
              <span className="ls-gradient">Take You Further</span>
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

            <div className="ls-hero-stats">
              <div className="ls-stat">
                <span className="ls-stat-value">
                  12<em>k+</em>
                </span>
                <span className="ls-stat-label">Active Learners</span>
              </div>
              <div className="ls-stat">
                <span className="ls-stat-value">
                  85<em>+</em>
                </span>
                <span className="ls-stat-label">Structured Courses</span>
              </div>
              <div className="ls-stat">
                <span className="ls-stat-value">
                  4.9<em>/5</em>
                </span>
                <span className="ls-stat-label">Avg. Rating</span>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* =========================================
            SOCIAL PROOF — INFINITE MARQUEE
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
            FEATURES
        ========================================= */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="features">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">Why LearnSpace</span>
              <h2 className="ls-section-title">Everything You Need to Level Up</h2>
              <p className="ls-section-subtitle">
                A complete learning loop — discover, practice, test, and prove
                your skills in one focused platform.
              </p>
            </div>

            <div className="ls-features-grid">
              {FEATURES.map((f) => (
                <div className="ls-feature-card" key={f.title}>
                  <div className="ls-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* =========================================
            PROCESS / HOW IT WORKS
        ========================================= */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="flow">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">How It Works</span>
              <h2 className="ls-section-title">From Beginner to Certified in 4 Steps</h2>
              <p className="ls-section-subtitle">
                A simple, repeatable process that turns curiosity into confidence.
              </p>
            </div>

            <div className="ls-flow-grid">
              {PROCESS.map((step, i) => (
                <div className="ls-flow-card" key={step.title}>
                  <div className="ls-step-num">0{i + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
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

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

                    <button className="ls-btn ls-btn-resource">Topic Notes</button>
                  </div>
                </div>

                <div className="ls-video-player-card">
                  <div className="ls-video-header">
                    <span>Video Lesson: {selectedTopic}</span>
                    <span>12 min</span>
                  </div>

                  <div className="ls-player-screen">
                    <div className="ls-play-button">▶</div>
                  </div>

                  <div className="ls-video-actions">
                    <button className="ls-btn ls-btn-primary">Take Topic Quiz</button>
                    <button className="ls-btn ls-btn-outline">Next Lesson →</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* =========================================
            PRICING
        ========================================= */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="pricing">
            <div className="ls-section-head">
              <span className="ls-section-eyebrow">Pricing</span>
              <h2 className="ls-section-title">Simple, Transparent Plans</h2>
              <p className="ls-section-subtitle">
                Start free, upgrade when you're ready. Cancel anytime.
              </p>
            </div>

            <div className="ls-pricing-grid">
              {PLANS.map((plan) => (
                <div
                  className={`ls-price-card ${plan.featured ? "featured" : ""}`}
                  key={plan.name}
                >
                  {plan.featured && <span className="ls-price-badge">Most Popular</span>}

                  <span className="ls-price-name">{plan.name}</span>
                  <div className="ls-price-amount">
                    {plan.price}
                    <small>{plan.period}</small>
                  </div>
                  <p className="ls-price-desc">{plan.desc}</p>

                  <ul className="ls-price-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  <button
                    className={`ls-btn ${plan.featured ? "ls-btn-primary" : "ls-btn-outline"}`}
                    onClick={() => navigate("/register")}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* =========================================
            FAQ
        ========================================= */}
        <ScrollReveal>
          <section className="ls-section ls-container" id="faq">
            <div className="ls-section-head" style={{ margin: "0 auto 56px", textAlign: "center" }}>
              <span className="ls-section-eyebrow">FAQ</span>
              <h2 className="ls-section-title">Frequently Asked Questions</h2>
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

        {/* =========================================
            CTA BANNER
        ========================================= */}
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
      </div>

      {/* =========================================
          FOOTER
      ========================================= */}
      <ScrollReveal>
        <footer className="ls-footer">
          <div className="ls-container">
            <div className="ls-footer-grid">
              <div className="ls-footer-col">
                <a href="#home" className="ls-logo" style={{ marginBottom: "16px" }}>
                  <span className="ls-logo-mark">L</span>
                  Learn<span>Space</span>
                </a>

                <p className="ls-footer-desc">
                  Learn, practice, and build real skills with structured courses,
                  interactive quizzes, and progress tracking.
                </p>
              </div>

              <div className="ls-footer-col">
                <h4>Platform</h4>
                <ul>
                  <li><a href="#home">Home</a></li>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#flow">How It Works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                </ul>
              </div>

              <div className="ls-footer-col">
                <h4>Learning</h4>
                <ul>
                  <li><a href="#courses">Course Catalog</a></li>
                  <li><a href="#courses">Interactive Quizzes</a></li>
                  <li><a href="#courses">Track Progress</a></li>
                </ul>
              </div>

              <div className="ls-footer-col">
                <h4>Achievements</h4>
                <ul>
                  <li><a href="#courses">Certificates</a></li>
                  <li><a href="#courses">Learning Progress</a></li>
                  <li><a href="#courses">Student Profile</a></li>
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

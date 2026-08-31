import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import StudentActivityChart from "../../layouts/StudentLayout/StudentActivityChart";

import { fetchStudentDashboard } from "../../features/student/studentProfileThunks";
import styles from "./student.module.css";
import ScrollReveal from "../../animation/Scroll";

const StudentDashboard = () => {
  const dispatch = useDispatch();

  const { dashboard, loading, error } = useSelector(
    (state) => state.studentProfile,
  );

  useEffect(() => {
    dispatch(fetchStudentDashboard());
  }, [dispatch]);

  if (loading && !dashboard) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}>
          <div className={styles.loader} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBoxError}>
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  const primaryStats = [
    {
      label: "Enrolled Courses",
      value: stats.enrolledCourses || 0,
      icon: "📚",
      color: "primary",
    },
    {
      label: "Completed Courses",
      value: stats.completedCourses || 0,
      icon: "✅",
      color: "success",
    },
    {
      label: "Certificates Earned",
      value: stats.certificatesCount || 0,
      icon: "🏅",
      color: "secondary",
    },
    {
      label: "Overall Progress",
      value: `${stats.overallProgress || 0}%`,
      icon: "📈",
      color: "info",
    },
  ];

  const secondaryStats = [
    {
      label: "Lessons Done",
      value: stats.totalLessonsCompleted || 0,
      icon: "📖",
    },
    {
      label: "Avg Quiz Score",
      value: `${stats.avgQuizScore || 0}%`,
      icon: "🎯",
    },
    {
      label: "Reputation Points",
      value: stats.reputationPoints || 0,
      icon: "⭐",
    },
    {
      label: "Verified Skills",
      value: stats.verifiedSkillsCount || 0,
      icon: "✨",
    },
  ];

  const recentCourses = dashboard?.recentCourses || [];
  const progressDistribution = dashboard?.progressDistribution || [];
  const learningActivity = dashboard?.learningActivity || [];
  const recentCertificates = dashboard?.recentCertificates || [];
  const capstoneSummary = stats?.capstoneSummary || {};

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.headerBadge}>STUDENT DASHBOARD</span>
          <h1>Welcome Back!</h1>
          <p>Track your modules, capstones, and earned credentials.</p>
        </div>
        <Link
          to="/student/catalog"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Browse Catalog →
        </Link>
      </div>
      {/* TOP 4 STATS */}
      <div className={styles.primaryStatGrid}>
        {primaryStats.map((card, idx) => (
          <div
            className={`${styles.statCard} ${styles[`statCard_${card.color}`]}`}
            key={card.label}
            style={{ "--card-index": idx }}
          >
            <div className={styles.statIconWrap}>
              <span>{card.icon}</span>
            </div>
            <div className={styles.statDetails}>
              <strong>{card.value}</strong>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* SECONDARY MICRO-STATS STRIP */}
      <div className={styles.microStatsStrip}>
        {secondaryStats.map((item) => (
          <div className={styles.microStatItem} key={item.label}>
            <span className={styles.microIcon}>{item.icon}</span>
            <div className={styles.microInfo}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      <StudentActivityChart />
      {/* ================= LOWER SECTIONS (STRUCTURED BENTO GRID) ================= */}
      {/* 1. RECENT COURSES (FULL WIDTH HERO SECTION) */}

      <ScrollReveal>
        <section className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Recent Courses</h3>
              <span className={styles.panelSubtitle}>
                Pick up right where you left off
              </span>
            </div>
            <Link
              to="/student/courses"
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              View All Courses
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📚</span>
              <p>No active courses found.</p>
              <Link
                to="/student/catalog"
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className={styles.courseGrid}>
              {recentCourses.slice(0, 3).map((course) => {
                const progress = Math.min(
                  100,
                  Math.round(Number(course.progressPercentage || 0)),
                );
                return (
                  <div className={styles.courseCardItem} key={course.courseId}>
                    <div className={styles.courseCardTop}>
                      <span className={styles.courseIconBox}>📘</span>
                      <span className={styles.categoryChip}>
                        {course.category || "General"}
                      </span>
                    </div>

                    <h4 className={styles.courseCardTitle} title={course.title}>
                      {course.title}
                    </h4>

                    <div className={styles.courseCardBottom}>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className={styles.progressMeta}>
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* 2. THREE-COLUMN BALANCED FOOTER ROW */}
      <ScrollReveal>
        <div className={styles.footerThreeCol}>
          {/* Col 1: Progress Distribution */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Progress Stages</h3>
                <span className={styles.panelSubtitle}>Milestone metrics</span>
              </div>
            </div>

            <div className={styles.compactList}>
              {progressDistribution.length > 0 ? (
                progressDistribution.map((item) => (
                  <div className={styles.compactRow} key={item.label}>
                    <span className={styles.compactLabel}>{item.label}</span>
                    <span className={styles.badgePrimary}>
                      {item.count} courses
                    </span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>No progress data available</p>
              )}
            </div>
          </div>

          {/* Col 2: Activity & Capstone Summary */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Activity & Capstone</h3>
                <span className={styles.panelSubtitle}>
                  Review status & lessons
                </span>
              </div>
            </div>

            <div className={styles.compactList}>
              <div className={styles.compactRow}>
                <span className={styles.compactLabel}>⏳ Capstone Pending</span>
                <span className={styles.badgeWarning}>
                  {capstoneSummary.PENDING || 0}
                </span>
              </div>
              <div className={styles.compactRow}>
                <span className={styles.compactLabel}>✓ Capstone Approved</span>
                <span className={styles.badgeSuccess}>
                  {capstoneSummary.APPROVED || 0}
                </span>
              </div>
              {learningActivity.length > 0 && (
                <div className={styles.compactRow}>
                  <span className={styles.compactLabel}>
                    📅 Latest Activity
                  </span>
                  <span className={styles.badgeNeutral}>
                    {learningActivity[learningActivity.length - 1]?.lessons ||
                      0}{" "}
                    lessons (
                    {learningActivity[learningActivity.length - 1]?.month})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Earned Certificates */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Certificates</h3>
                <span className={styles.panelSubtitle}>
                  Verified credentials
                </span>
              </div>
            </div>

            <div className={styles.certList}>
              {recentCertificates.length > 0 ? (
                recentCertificates.slice(0, 2).map((cert, index) => (
                  <div className={styles.certItem} key={index}>
                    <div className={styles.certTop}>
                      <span className={styles.certIcon}>📜</span>
                      <div className={styles.certDetails}>
                        <strong className={styles.certTitle}>
                          {cert.title}
                        </strong>
                        <code>{cert.code}</code>
                      </div>
                    </div>
                    <span className={styles.certDate}>
                      Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>No certificates earned yet</p>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default StudentDashboard;

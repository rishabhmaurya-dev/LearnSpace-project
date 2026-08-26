import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { GradualSpacing } from "../../../animation/Text";
import {
  fetchAdminDashboardStats,
  fetchAdminPendingItems,
  fetchAdminActivity,
  fetchAdminLeaderboard,
} from "../../../features/admin/dashboard/adminDashboardThunks";

import StatisticsChart from "../../../layouts/AdminLayout/Chart";
import CategoryDonut from "./CategoryDonut";
import styles from "./AdminDashboard.module.css";

/* =========================================================
   HELPERS
======================================================== */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) {
      setValue(0);
      return undefined;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

const ACTIVITY_META = {
  COURSE_CREATED: { icon: "📚", tone: "primary", label: "Course created" },
  CERTIFICATE_ISSUED: {
    icon: "🏅",
    tone: "success",
    label: "Certificate issued",
  },
  CAPSTONE_SUBMITTED: {
    icon: "🎯",
    tone: "warning",
    label: "Capstone submitted",
  },
  CAPSTONE_APPROVED: {
    icon: "✅",
    tone: "success",
    label: "Capstone approved",
  },
  CAPSTONE_REJECTED: { icon: "⛔", tone: "danger", label: "Capstone rejected" },
};

/* =========================================================
   MAIN COMPONENT
======================================================== */
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  const {
    statistics,
    pendingCapstones = [],
    activity = [],
    leaderboard = [],
    loading,
    error,
  } = useSelector((state) => state.adminDashboard);

  const { isAuthenticated, rehydrating, user } = useSelector(
    (state) => state.auth,
  );

  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const refreshAll = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchAdminDashboardStats()),
      dispatch(fetchAdminPendingItems()),
      dispatch(fetchAdminActivity()),
      dispatch(fetchAdminLeaderboard(10)),
    ]).finally(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    });
  }, [dispatch]);

  useEffect(() => {
    if (!rehydrating && isAuthenticated) {
      refreshAll();
    }
  }, [rehydrating, isAuthenticated, refreshAll]);



  if (loading && !statistics) {
    return (
      <div className={styles.loader}>
        <span className={styles.loaderSpinner} />
        Loading dashboard...
      </div>
    );
  }

  if (error && !statistics) {
    return (
      <div className={styles.errorState}>
        <div className={styles.emptyIcon}>⚠️</div>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const handleViewStudent = (studentId) => {
    if (!studentId) return;
    navigate(`/admin/students/${studentId}`);
  };

  const adminFirstName = user?.name?.split(" ")[0] || "Admin";

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const coursePublishProgress = statistics?.courses?.total
    ? Math.round((statistics.courses.active / statistics.courses.total) * 100)
    : 0;

  const capstoneApprovalProgress =
    (statistics?.capstones?.approved || 0) +
      (statistics?.capstones?.rejected || 0) >
    0
      ? Math.round(
          ((statistics?.capstones?.approved || 0) /
            ((statistics?.capstones?.approved || 0) +
              (statistics?.capstones?.rejected || 0))) *
            100,
        )
      : 0;

  return (
    <div className={styles.dashboard} ref={dashboardRef}>
      {/* PAGE HEADER */}
      <header className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1>
            <GradualSpacing
              text={`${getGreeting()}, ${adminFirstName}`}
              className="rgbText"
            />
          </h1>
          <p>Here's what's happening on your SkillForge platform today</p>
        </div>

        <div className={styles.headerMeta}>
          <div className={styles.dateTimeBlock}>
            <span className={styles.dateLabel}>{dateLabel}</span>
            <span className={styles.timeLabel}>🕒 {timeLabel}</span>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={refreshAll}
            disabled={refreshing}
          >
            <span
              className={`${styles.refreshGlyph} ${
                refreshing ? styles.refreshing : ""
              }`}
            >
              ⟳
            </span>{" "}
            Refresh
          </button>
        </div>
      </header>

      {lastUpdated && (
        <p className={styles.lastUpdated}>
          Last updated {timeAgo(lastUpdated)} · auto-refreshes every minute
        </p>
      )}

      {/* TOP STATS */}
      <section className={styles.statsGrid}>
        <StatCard
          title="Total Students"
          value={statistics?.students?.total || 0}
          icon="🎓"
          type="students"
          delta={statistics?.students?.newThisMonth}
          deltaLabel="new this month"
          note={
            statistics?.students?.newThisWeek > 0
              ? `+${statistics.students.newThisWeek} this week`
              : "—"
          }
        />
        <StatCard
          title="Courses"
          value={statistics?.courses?.total || 0}
          icon="📖"
          type="courses"
          delta={statistics?.courses?.newThisMonth}
          deltaLabel="added this month"
          note={`${statistics?.courses?.active || 0} published`}
        />
        <StatCard
          title="Lessons"
          value={statistics?.lessons?.total || 0}
          icon="📄"
          type="lessons"
          note={`${statistics?.lessons?.published || 0} published`}
        />
        <StatCard
          title="Certificates"
          value={statistics?.certificates?.total || 0}
          icon="🏅"
          type="certificates"
          delta={statistics?.certificates?.newThisMonth}
          deltaLabel="issued this month"
          note={`${statistics?.capstones?.pending || 0} capstones awaiting review`}
        />
      </section>

      {/* QUICK ACTIONS */}
      <section className={styles.quickActions}>
        <ActionTile
          icon="➕"
          title="Create Course"
          hint="Add new content"
          onClick={() => navigate("/admin/courses/new")}
          tone="primary"
        />
        <ActionTile
          icon="🎯"
          title="Review Capstones"
          hint={`${statistics?.capstones?.pending || 0} pending`}
          onClick={() => navigate("/admin/capstones?status=PENDING")}
          tone="warning"
        />
        <ActionTile
          icon="👥"
          title="Manage Students"
          hint="Profiles & progress"
          onClick={() => navigate("/admin/students")}
          tone="secondary"
        />
        <ActionTile
          icon="🏅"
          title="Certificates"
          hint="Issued & revoked"
          onClick={() => navigate("/admin/certificates")}
          tone="success"
        />
      </section>

      {/* ================= SCROLL REVEAL SECTIONS ================= */}

      {/* CHARTS */}
      <section className={styles.chartsGrid}>
        <StatisticsChart />
        <CategoryDonut />
      </section>

      {/* STATUS CARDS */}
      <section className={styles.middleGrid}>
        <StatusCard
          title="Course Health"
          icon="📖"
          route="courses"
          rows={[
            {
              label: "Published",
              value: statistics?.courses?.active,
              type: "published",
            },
            {
              label: "Drafts",
              value: statistics?.courses?.draft,
              type: "draft",
            },
          ]}
          progress={{
            percent: coursePublishProgress,
            label: `${coursePublishProgress}% of catalog published`,
          }}
        />
        <StatusCard
          title="Capstone Reviews"
          icon="🎯"
          route="capstones"
          rows={[
            {
              label: "Pending",
              value: statistics?.capstones?.pending,
              type: "pending",
            },
            {
              label: "Approved",
              value: statistics?.capstones?.approved,
              type: "approved",
            },
            {
              label: "Rejected",
              value: statistics?.capstones?.rejected,
              type: "rejected",
            },
          ]}
          progress={{
            percent: capstoneApprovalProgress,
            label: `${capstoneApprovalProgress}% approval rate`,
          }}
        />
      </section>

      {/* PENDING ITEMS & ACTIVITY */}
      <section className={styles.bottomGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <div className={styles.panelIcon}>🎯</div>
              <h3>Pending Capstones</h3>
            </div>
            <span className={styles.countBadge}>{pendingCapstones.length}</span>
          </div>

          {pendingCapstones.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎉</div>
              <p>No pending capstones</p>
              <small>You're all caught up!</small>
            </div>
          ) : (
            <div className={styles.pendingList}>
              {pendingCapstones.slice(0, 3).map((submission) => (
                <div className={styles.pendingItem} key={submission._id}>
                  <div className={styles.pendingAvatar}>
                    {submission.studentId?.name?.charAt(0)?.toUpperCase() ||
                      "S"}
                  </div>
                  <div className={styles.pendingInfo}>
                    <strong>
                      {submission.studentId?.name || "Unknown Student"}
                    </strong>
                    <small>{submission.courseId?.title || ""}</small>
                  </div>
                  <button
                    type="button"
                    className={styles.reviewButton}
                    onClick={() => navigate(`/admin/capstones?status=PENDING`)}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.panelFooter}>
            <button
              type="button"
              onClick={() => navigate("/admin/capstones?status=pending")}
            >
              View All
            </button>
            <span>→</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <div className={styles.activityFeedIcon}>⚡</div>
              <h3>Recent Activity</h3>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🛰️</div>
              <p>No recent activity</p>
              <small>Platform events will appear here</small>
            </div>
          ) : (
            <ul className={styles.activityList}>
              {activity.slice(0, 6).map((item) => {
                const meta =
                  ACTIVITY_META[item.type] || ACTIVITY_META.COURSE_CREATED;
                return (
                  <li className={styles.activityItem} key={item._id}>
                    <span
                      className={`${styles.activityIcon} ${styles[meta.tone]}`}
                    >
                      {meta.icon}
                    </span>
                    <div className={styles.activityInfo}>
                      <strong title={item.title}>{item.title}</strong>
                      <small title={item.subtitle}>
                        {meta.label}
                        {item.subtitle ? ` · ${item.subtitle}` : ""}
                      </small>
                    </div>
                    <span className={styles.activityTime}>
                      {timeAgo(item.date)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* TOP STUDENTS */}
      <section className={styles.topStudents}>
        <div className={styles.studentsHeader}>
          <div className={styles.studentsTitle}>
            <div className={styles.trophyIcon}>🏆</div>
            <h3>Top Students</h3>
          </div>
          <button
            className={styles.viewAll}
            onClick={() => navigate("/admin/students/leaderboard")}
          >
            View All →
          </button>
        </div>

        <div className={styles.studentsGrid}>
          {leaderboard.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No students available</p>
            </div>
          ) : (
            leaderboard.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                onView={handleViewStudent}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

/* =========================================================
   SUB-COMPONENTS
======================================================== */
const StatCard = ({ title, value, icon, type, delta, deltaLabel, note }) => {
  const animatedValue = useCountUp(value || 0);

  return (
    <div className={`${styles.statCard} ${styles[type]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <strong>{animatedValue}</strong>
        <span>{title}</span>
        {(delta !== undefined && delta !== null) || note ? (
          <div className={styles.statFootnote}>
            {delta !== undefined && delta !== null && delta > 0 && (
              <em className={styles.deltaChip}>
                ▲ {delta} {deltaLabel}
              </em>
            )}
            {note && <em className={styles.statNote}>{note}</em>}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ActionTile = ({ icon, title, hint, onClick, tone }) => (
  <button
    type="button"
    className={`${styles.actionTile} ${styles[tone]}`}
    onClick={onClick}
  >
    <span className={styles.actionIcon}>{icon}</span>
    <span className={styles.actionText}>
      <strong>{title}</strong>
      <small>{hint}</small>
    </span>
    <span className={styles.actionArrow}>›</span>
  </button>
);

const StatusCard = ({ title, icon, route, rows, progress }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.statusCard}>
      <div className={styles.statusHeader}>
        <div className={styles.statusTitle}>
          <div className={styles.statusIcon}>{icon}</div>
          <h3>{title}</h3>
        </div>
        <button
          className={styles.arrow}
          onClick={() => navigate(`/admin/${route || ""}`)}
          aria-label={`Open ${title}`}
        >
          ›
        </button>
      </div>

      <div className={styles.statusBody}>
        {rows.map((row) => (
          <div className={styles.statusRow} key={row.label}>
            <div className={styles.statusLabel}>
              <span className={`${styles.statusDot} ${styles[row.type]}`}>
                {row.type === "approved" || row.type === "published"
                  ? "✓"
                  : row.type === "rejected"
                    ? "×"
                    : row.type === "pending"
                      ? "◷"
                      : "○"}
              </span>
              <span>{row.label}</span>
            </div>
            <strong>{row.value || 0}</strong>
          </div>
        ))}

        {progress && (
          <div className={styles.progressBlock}>
            <div className={styles.progressMeta}>
              <span>{progress.label}</span>
              <strong>{progress.percent}%</strong>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progress.percent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentCard = ({ student, onView }) => {
  return (
    <div className={styles.studentCard}>
      <div className={styles.rankBadge}>{student.rank}</div>
      <div className={styles.studentAvatar}>
        {student.avatar ? (
          <img src={student.avatar} alt={student.name || "Student"} />
        ) : (
          student.name?.charAt(0)?.toUpperCase() || "?"
        )}
      </div>
      <div className={styles.studentInfo}>
        <h4>{student.name || "No Name"}</h4>
        <p>{student.email || "noemail@mail.com"}</p>
      </div>
      <div className={styles.reputation}>
        <span>★</span>
        {student.reputationPoints || 0}
      </div>
      <div className={styles.studentStats}>
        <div className={styles.studentStat}>
          <span>📖</span>
          <div>
            <strong>{student.completedCoursesCount || 0}</strong>
            <small>Courses</small>
          </div>
        </div>
        <div className={styles.studentStat}>
          <span>🚀</span>
          <div>
            <strong>{student.completedProjectsCount || 0}</strong>
            <small>Projects</small>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={styles.profileButton}
        onClick={() => onView(student.studentId || student._id)}
      >
        View Profile
      </button>
    </div>
  );
};

export default AdminDashboard;
  
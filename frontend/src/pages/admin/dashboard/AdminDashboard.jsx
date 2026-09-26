import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleX,
  Flag,
  GraduationCap,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Rocket,
  Star,
  Target,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";

import {
  fetchAdminDashboardStats,
  fetchAdminPendingItems,
  fetchAdminActivity,
  fetchAdminLeaderboard,
} from "../../../features/admin/dashboard/adminDashboardThunks";

import StatisticsChart from "../../../layouts/AdminLayout/Chart";
import CategoryDonut from "./CategoryDonut";
import styles from "./AdminDashboard.module.css";

/* helpers */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return undefined;

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

  return target ? value : 0;
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
  COURSE_CREATED: { icon: BookOpen, tone: "green", label: "Course created" },
  CERTIFICATE_ISSUED: {
    icon: Award,
    tone: "green",
    label: "Certificate issued",
  },
  CAPSTONE_SUBMITTED: {
    icon: Flag,
    tone: "amber",
    label: "Capstone submitted",
  },
  CAPSTONE_APPROVED: {
    icon: CircleCheck,
    tone: "green",
    label: "Capstone approved",
  },
  CAPSTONE_REJECTED: {
    icon: CircleX,
    tone: "red",
    label: "Capstone rejected",
  },
};

const ROW_ICONS = {
  published: CircleCheck,
  approved: CircleCheck,
  draft: CircleDashed,
  pending: CircleDashed,
  rejected: CircleX,
};

/* main component */
const AdminDashboard = () => {
  const dispatch = useDispatch();

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

  const fetchAll = useCallback(
    () =>
      Promise.all([
        dispatch(fetchAdminDashboardStats()),
        dispatch(fetchAdminPendingItems()),
        dispatch(fetchAdminActivity()),
        dispatch(fetchAdminLeaderboard(10)),
      ]),
    [dispatch],
  );

  const refreshAll = useCallback(() => {
    setRefreshing(true);

    return fetchAll().finally(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    });
  }, [fetchAll]);

  useEffect(() => {
    if (!rehydrating && isAuthenticated) {
      fetchAll().then(() => setLastUpdated(new Date()));
    }
  }, [rehydrating, isAuthenticated, fetchAll]);

  if (loading && !statistics) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}>
          <LoaderCircle size={26} strokeWidth={2} className={styles.spin} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !statistics) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBoxError}>
          <CircleAlert size={16} strokeWidth={2} />
          <p>{error}</p>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

  const statCards = [
    {
      label: "Total Students",
      value: statistics?.students?.total || 0,
      icon: Users,
      tone: "green",
    },
    {
      label: "Courses",
      value: statistics?.courses?.total || 0,
      icon: BookOpen,
      tone: "teal",
    },
    {
      label: "Lessons",
      value: statistics?.lessons?.total || 0,
      icon: Layers,
      tone: "green",
    },
    {
      label: "Certificates",
      value: statistics?.certificates?.total || 0,
      icon: Award,
      tone: "amber",
    },
  ];

  const quickActions = [
    {
      to: "/admin/courses/new",
      title: "Create Course",
      hint: "Add new content",
      icon: Plus,
    },
    {
      to: "/admin/capstones?status=PENDING",
      title: "Review Capstones",
      hint: `${statistics?.capstones?.pending || 0} pending`,
      icon: Target,
    },
    {
      to: "/admin/students",
      title: "Manage Students",
      hint: "Profiles & progress",
      icon: UserCog,
    },
    {
      to: "/admin/certificates",
      title: "Certificates",
      hint: "Issued & revoked",
      icon: Award,
    },
  ];

  return (
    <div className={styles.container}>
      {/* page header */}
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <nav className={styles.breadcrumb}>
            <span>Admin</span>
            <ChevronRight size={13} strokeWidth={2.2} />
            <strong>Dashboard</strong>
          </nav>

          <h1>
            {getGreeting()}, {adminFirstName}
          </h1>
          <p>
            Monitor learner growth, course health and pending reviews across
            your SkillForge platform.
          </p>
        </div>

        <div className={styles.headActions}>
          <div className={styles.dateChip}>
            <CalendarDays size={15} strokeWidth={2} />
            <div>
              <strong>{dateLabel}</strong>
              <small>{timeLabel}</small>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnGhost}
            onClick={refreshAll}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              strokeWidth={2.2}
              className={refreshing ? styles.spin : undefined}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </header>

      {lastUpdated && (
        <p className={styles.lastUpdated}>Last synced {timeAgo(lastUpdated)}</p>
      )}

      {/* key metrics */}
      <section className={styles.statGrid}>
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      {/* quick actions */}
      <section className={styles.actionGrid}>
        {quickActions.map((action) => (
          <QuickAction key={action.title} {...action} />
        ))}
      </section>

      {/* charts */}
      <section className={styles.chartsGrid}>
        <StatisticsChart />
        <CategoryDonut />
      </section>

      {/* course health + capstone reviews */}
      <section className={styles.splitGrid}>
        <StatusPanel
          title="Course Health"
          subtitle="Publishing status of your catalog"
          icon={BookOpen}
          to="/admin/courses"
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

        <StatusPanel
          title="Capstone Reviews"
          subtitle="Submission decisions so far"
          icon={Target}
          to="/admin/capstones"
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

      {/* pending capstones + recent activity */}
      <section className={styles.splitGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Pending Capstones</h2>
              <p>Submissions waiting for your decision</p>
            </div>
            <span className={styles.countBadge}>{pendingCapstones.length}</span>
          </div>

          {pendingCapstones.length === 0 ? (
            <div className={styles.emptyState}>
              <CircleCheck size={26} strokeWidth={1.6} />
              <strong>Nothing to review</strong>
              <p>All capstone submissions have been handled.</p>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {pendingCapstones.slice(0, 3).map((submission) => (
                <li className={styles.itemRow} key={submission._id}>
                  <span className={styles.rowAvatar}>
                    {submission.studentId?.name?.charAt(0)?.toUpperCase() ||
                      "S"}
                  </span>

                  <div className={styles.rowBody}>
                    <strong>
                      {submission.studentId?.name || "Unknown Student"}
                    </strong>
                    <small>
                      {submission.courseId?.title || "Course unavailable"}
                    </small>
                  </div>

                  <Link
                    to="/admin/capstones?status=PENDING"
                    className={styles.btnMini}
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.panelFooter}>
            <Link to="/admin/capstones?status=PENDING" className={styles.panelLink}>
              View All
              <ChevronRight size={15} strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Recent Activity</h2>
              <p>Latest events across the platform</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className={styles.emptyState}>
              <Activity size={26} strokeWidth={1.6} />
              <strong>No recent activity</strong>
              <p>Platform events will appear here as they happen.</p>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {activity.slice(0, 6).map((item) => {
                const meta =
                  ACTIVITY_META[item.type] || ACTIVITY_META.COURSE_CREATED;
                const Icon = meta.icon;

                return (
                  <li className={styles.itemRow} key={item._id}>
                    <span
                      className={`${styles.rowIcon} ${styles[`tone_${meta.tone}`]}`}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </span>

                    <div className={styles.rowBody}>
                      <strong title={item.title}>{item.title}</strong>
                      <small title={item.subtitle}>
                        {meta.label}
                        {item.subtitle ? ` · ${item.subtitle}` : ""}
                      </small>
                    </div>

                    <span className={styles.rowTime}>{timeAgo(item.date)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* top students */}
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Top Students</h2>
            <p>Highest reputation on the leaderboard</p>
          </div>
          <Link to="/admin/students/leaderboard" className={styles.panelLink}>
            View All
            <ChevronRight size={15} strokeWidth={2.2} />
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className={styles.emptyState}>
            <Trophy size={26} strokeWidth={1.6} />
            <strong>No students yet</strong>
            <p>The leaderboard will fill up once learners start enrolling.</p>
          </div>
        ) : (
          <div className={styles.rankGrid}>
            {leaderboard.map((student) => (
              <StudentRow
                key={student._id}
                student={student}
                profilePath={`/admin/students/${student.studentId || student._id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/* sub-components */
const StatCard = ({ label, value, icon: Icon, tone }) => {
  const animatedValue = useCountUp(value || 0);

  return (
    <div className={styles.statCard}>
      <span className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}>
        <Icon size={18} strokeWidth={2} />
      </span>

      <div className={styles.statBody}>
        <strong>{animatedValue}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
};

const QuickAction = ({ to, title, hint, icon: Icon }) => (
  <Link to={to} className={styles.actionCard}>
    <span className={styles.actionIcon}>
      <Icon size={17} strokeWidth={2} />
    </span>

    <span className={styles.actionText}>
      <strong>{title}</strong>
      <small>{hint}</small>
    </span>

    <ChevronRight size={16} strokeWidth={2} className={styles.actionArrow} />
  </Link>
);

const StatusPanel = ({ title, subtitle, icon: Icon, to, rows, progress }) => (
  <div className={styles.panel}>
    <div className={styles.panelHead}>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Link
        to={to}
        className={styles.iconLink}
        aria-label={`Open ${title}`}
      >
        <Icon size={16} strokeWidth={2} />
      </Link>
    </div>

    <div className={styles.kvList}>
      {rows.map((row) => {
        const RowIcon = ROW_ICONS[row.type] || CircleDashed;

        return (
          <div className={styles.kvRow} key={row.label}>
            <span>
              <RowIcon size={14} strokeWidth={2} />
              {row.label}
            </span>
            <em
              className={`${styles.badge} ${
                row.type === "rejected"
                  ? styles.badgeDanger
                  : row.type === "draft" || row.type === "pending"
                    ? styles.badgeWarning
                    : styles.badgeSuccess
              }`}
            >
              {row.value || 0}
            </em>
          </div>
        );
      })}
    </div>

    {progress && (
      <div className={styles.progressBlock}>
        <div className={styles.progressMeta}>
          <span>{progress.label}</span>
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
);

const StudentRow = ({ student, profilePath }) => (
  <article className={styles.rankCard}>
    <span className={styles.rankIndex}>{student.rank}</span>

    <span className={styles.rankAvatar}>
      {student.avatar ? (
        <img src={student.avatar} alt={student.name || "Student"} />
      ) : (
        student.name?.charAt(0)?.toUpperCase() || "?"
      )}
    </span>

    <div className={styles.rankBody}>
      <strong title={student.name || "No Name"}>
        {student.name || "No Name"}
      </strong>
      <small>{student.email || "noemail@mail.com"}</small>
    </div>

    <div className={styles.rankMeta}>
      <span className={styles.reputation}>
        <Star size={12} strokeWidth={2} />
        {student.reputationPoints || 0}
      </span>

      <span className={styles.rankStat}>
        <GraduationCap size={13} strokeWidth={2} />
        {student.completedCoursesCount || 0}
      </span>

      <span className={styles.rankStat}>
        <Rocket size={13} strokeWidth={2} />
        {student.completedProjectsCount || 0}
      </span>
    </div>

    <Link
      to={profilePath}
      className={styles.iconLink}
      aria-label={`View ${student.name || "student"} profile`}
    >
      <ChevronRight size={16} strokeWidth={2} />
    </Link>
  </article>
);

export default AdminDashboard;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CircleCheckBig,
  Award,
  TrendingUp,
  GraduationCap,
  Target,
  Star,
  Sparkles,
  FileText,
  PlayCircle,
  ChevronRight,
  LayoutGrid,
  Flame,
  Layers,
} from "lucide-react";

import StudentActivityChart from "../../layouts/StudentLayout/StudentActivityChart";

import { fetchStudentDashboard } from "../../features/student/studentProfileThunks";
import styles from "./student.module.css";

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

  const enrolled = Number(stats.enrolledCourses || 0);

  const primaryStats = [
    {
      label: "Enrolled Courses",
      value: enrolled,
      icon: BookOpen,
      tone: "green",
    },
    {
      label: "Completed Courses",
      value: Number(stats.completedCourses || 0),
      icon: CircleCheckBig,
      tone: "green",
    },
    {
      label: "Certificates Earned",
      value: Number(stats.certificatesCount || 0),
      icon: Award,
      tone: "amber",
    },
    {
      label: "Overall Progress",
      value: `${Number(stats.overallProgress || 0)}%`,
      icon: TrendingUp,
      tone: "teal",
    },
  ];

  const secondaryStats = [
    {
      label: "Lessons Completed",
      value: Number(stats.totalLessonsCompleted || 0),
      icon: GraduationCap,
    },
    {
      label: "Average Quiz Score",
      value: `${Number(stats.avgQuizScore || 0)}%`,
      icon: Target,
    },
    {
      label: "Reputation Points",
      value: Number(stats.reputationPoints || 0),
      icon: Star,
    },
    {
      label: "Verified Skills",
      value: Number(stats.verifiedSkillsCount || 0),
      icon: Sparkles,
    },
  ];

  const recentCourses = dashboard?.recentCourses || [];
  const progressDistribution = dashboard?.progressDistribution || [];
  const learningActivity = dashboard?.learningActivity || [];
  const recentCertificates = dashboard?.recentCertificates || [];
  const capstoneSummary = stats?.capstoneSummary || {};

  const maxDistribution = Math.max(
    enrolled,
    ...progressDistribution.map((item) => Number(item.count || 0)),
    1,
  );

  return (
    <div className={styles.container}>
      {/* page header */}
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <nav className={styles.breadcrumb}>
            <span>Student</span>
            <ChevronRight size={13} strokeWidth={2.2} />
            <strong>Dashboard</strong>
          </nav>
          <h1>Dashboard</h1>
          <p>
            Pick up where you left off, track progress across your courses, and
            review the credentials you have earned.
          </p>
        </div>

        <Link
          to="/student/catalog"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <LayoutGrid size={15} strokeWidth={2.2} />
          Browse Catalog
        </Link>
      </header>

      {/* key metrics */}
      <section className={styles.statGrid}>
        {primaryStats.map((card) => {
          const Icon = card.icon;

          return (
            <div className={styles.statCard} key={card.label}>
              <span
                className={`${styles.statIcon} ${styles[`tone_${card.tone}`]}`}
              >
                <Icon size={18} strokeWidth={2} />
              </span>
              <div className={styles.statBody}>
                <strong>{card.value}</strong>
                <span>{card.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* summary bar */}
      <section className={styles.summaryBar}>
        {secondaryStats.map((item) => {
          const Icon = item.icon;

          return (
            <div className={styles.summaryCell} key={item.label}>
              <Icon size={15} strokeWidth={2} className={styles.summaryIcon} />
              <div>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* continue learning + progress breakdown */}
      <div className={styles.splitGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Continue Learning</h2>
              <p>Your most recently accessed courses</p>
            </div>
            <Link to="/student/courses" className={styles.panelLink}>
              My Courses
              <ChevronRight size={15} strokeWidth={2.2} />
            </Link>
          </div>

          {recentCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={26} strokeWidth={1.6} />
              <strong>You have not enrolled in any course yet</strong>
              <p>Browse the catalog and start your first course today.</p>
              <Link
                to="/student/catalog"
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className={styles.resumeGrid}>
              {recentCourses.slice(0, 4).map((course) => {
                const progress = Math.min(
                  100,
                  Math.round(Number(course.progressPercentage || 0)),
                );
                const courseId = course.courseId || course.title;

                return (
                  <article className={styles.resumeCard} key={courseId}>
                    <div className={styles.resumeThumb}>
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          loading="lazy"
                        />
                      ) : (
                        <BookOpen size={22} strokeWidth={1.7} />
                      )}

                      {course.isCompleted && (
                        <span className={styles.resumeDone}>
                          <CircleCheckBig size={12} strokeWidth={2.4} />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className={styles.resumeBody}>
                      <span className={styles.resumeCategory}>
                        {course.category || "General"}
                      </span>

                      <h3 title={course.title}>{course.title}</h3>

                      <div className={styles.resumeProgress}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span>{progress}% complete</span>
                      </div>

                      <Link
                        to={`/student/courses/${courseId}/learn`}
                        className={styles.resumeCta}
                      >
                        <PlayCircle size={15} strokeWidth={2.1} />
                        {progress > 0 ? "Resume" : "Start Learning"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Progress Breakdown</h2>
              <p>How your courses are distributed</p>
            </div>
          </div>

          {progressDistribution.some((item) => Number(item.count) > 0) ? (
            <div className={styles.barList}>
              {progressDistribution.map((item) => {
                const count = Number(item.count || 0);
                const width = Math.round((count / maxDistribution) * 100);

                return (
                  <div className={styles.barRow} key={item.label}>
                    <div className={styles.barMeta}>
                      <span>{item.label}</span>
                      <strong>{count}</strong>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyText}>
              No progress data yet. Enroll in a course to start tracking.
            </p>
          )}

          <div className={styles.panelDivider} />

          <div className={styles.panelSubhead}>
            <h3>Capstone Submissions</h3>
          </div>

          <div className={styles.kvList}>
            <div className={styles.kvRow}>
              <span>
                <Flame size={14} strokeWidth={2} />
                Awaiting review
              </span>
              <em className={styles.badgeWarning}>
                {capstoneSummary.PENDING || 0}
              </em>
            </div>
            <div className={styles.kvRow}>
              <span>
                <CircleCheckBig size={14} strokeWidth={2} />
                Approved
              </span>
              <em className={styles.badgeSuccess}>
                {capstoneSummary.APPROVED || 0}
              </em>
            </div>
            <div className={styles.kvRow}>
              <span>
                <FileText size={14} strokeWidth={2} />
                Needs changes
              </span>
              <em className={styles.badgeDanger}>
                {capstoneSummary.REJECTED || 0}
              </em>
            </div>
          </div>
        </section>
      </div>

      <StudentActivityChart />

      {/* certificates + monthly activity */}
      <div className={styles.splitGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>My Certificates</h2>
              <p>QR-verified credentials you have earned</p>
            </div>
            <Link to="/student/certificates" className={styles.panelLink}>
              View All
              <ChevronRight size={15} strokeWidth={2.2} />
            </Link>
          </div>

          {recentCertificates.length === 0 ? (
            <p className={styles.emptyText}>
              No certificates earned yet. Complete a course capstone to unlock
              your first one.
            </p>
          ) : (
            <ul className={styles.certList}>
              {recentCertificates.slice(0, 3).map((cert, index) => {
                const code = cert.certificateCode || cert.code;
                const issuedAt = cert.issueDate || cert.issuedAt;

                return (
                  <li className={styles.certRow} key={code || index}>
                    <span className={styles.certIcon}>
                      <Award size={17} strokeWidth={1.9} />
                    </span>

                    <div className={styles.certBody}>
                      <strong>{cert.title}</strong>
                      {code && <code>{code}</code>}
                    </div>

                    {issuedAt && (
                      <time className={styles.certDate}>
                        {new Date(issuedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Monthly Activity</h2>
              <p>Lessons completed over the last 6 months</p>
            </div>
          </div>

          {learningActivity.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Lessons</th>
                  </tr>
                </thead>
                <tbody>
                  {learningActivity.map((row) => (
                    <tr key={row.key || row.month}>
                      <td>
                        <Layers size={14} strokeWidth={2} />
                        {row.month}
                      </td>
                      <td>
                        <strong>{Number(row.lessons || 0)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.emptyText}>No activity recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;

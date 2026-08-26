import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { fetchMyEnrolledCourses } from "../../features/student/studentCourseThunks";
import { CardGridSkeleton } from "../../components/AppSkeletons";

import styles from "./MyCourses.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyCourses = () => {
  const dispatch = useDispatch();

  const {
    enrolledCourses = [],
    loading,
    error,
  } = useSelector((state) => state.studentCourse);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    dispatch(fetchMyEnrolledCourses());
  }, [dispatch]);

  const stats = useMemo(() => {
    let completed = 0;
    let capstoneReady = 0;
    let inProgress = 0;

    enrolledCourses.forEach((item) => {
      const progress = item.progress || {};
      const percent = Math.round(progress.progressPercentage || 0);
      const isDone = progress.isCompleted || percent >= 100;
      const isCapUnlocked = !isDone && Boolean(progress.isCapstoneUnlocked);

      if (isDone) completed += 1;
      else if (isCapUnlocked) capstoneReady += 1;
      else inProgress += 1;
    });

    return {
      total: enrolledCourses.length,
      inProgress,
      capstoneReady,
      completed,
    };
  }, [enrolledCourses]);

  const filteredCourses = useMemo(() => {
    return enrolledCourses.filter((item) => {
      const course = item.course || {};
      const progress = item.progress || {};
      const percent = Math.round(progress.progressPercentage || 0);
      const isDone = progress.isCompleted || percent >= 100;
      const isCapUnlocked = !isDone && Boolean(progress.isCapstoneUnlocked);

      const matchesSearch =
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.category?.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === "IN_PROGRESS")
        matchesStatus = !isDone && !isCapUnlocked;
      if (filterStatus === "CAPSTONE") matchesStatus = isCapUnlocked;
      if (filterStatus === "COMPLETED") matchesStatus = isDone;

      return matchesSearch && matchesStatus;
    });
  }, [enrolledCourses, search, filterStatus]);

  if (loading && enrolledCourses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1>My Enrolled Courses</h1>
          <p>
            Pick up right where you left off and finish your learning goals.
          </p>
        </div>
        <CardGridSkeleton />
      </div>
    );
  }

  if (error && enrolledCourses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBoxError}>{error}</div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1>My Enrolled Courses</h1>
          <p>
            Pick up right where you left off and finish your learning goals.
          </p>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.emptyIcon}>🎓</div>
          <h3>No Enrolled Courses Yet</h3>
          <p>
            Start learning by exploring our industry-aligned course catalog.
          </p>
          <Link
            to="/student/catalog"
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ marginTop: 16 }}
          >
            Browse Course Catalog →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ================= PAGE HEADER ================= */}
      <div className={styles.pageHeader}>
        <h1>My Enrolled Courses</h1>
        <p>
          Pick up right where you left off, unlock capstone projects, and earn
          verified credentials.
        </p>
      </div>

      {/* ================= STATS SUMMARY ================= */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Total Enrolled</span>
          <strong className={styles.metricValue}>{stats.total}</strong>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>In Progress</span>
          <strong className={styles.metricValuePrimary}>
            {stats.inProgress}
          </strong>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Capstone Ready</span>
          <strong className={styles.metricValueSecondary}>
            {stats.capstoneReady}
          </strong>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Completed</span>
          <strong className={styles.metricValueSuccess}>
            {stats.completed}
          </strong>
        </div>
      </div>

      {/* ================= SEARCH & CONTROLS ================= */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.filterPill} ${
              filterStatus === "ALL" ? styles.filterPillActive : ""
            }`}
            onClick={() => setFilterStatus("ALL")}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              filterStatus === "IN_PROGRESS" ? styles.filterPillActive : ""
            }`}
            onClick={() => setFilterStatus("IN_PROGRESS")}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              filterStatus === "CAPSTONE" ? styles.filterPillActive : ""
            }`}
            onClick={() => setFilterStatus("CAPSTONE")}
          >
            Capstone Ready ({stats.capstoneReady})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              filterStatus === "COMPLETED" ? styles.filterPillActive : ""
            }`}
            onClick={() => setFilterStatus("COMPLETED")}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* ================= RESPONSIVE COURSES CONTAINER ================= */}
      {filteredCourses.length === 0 ? (
        <div className={styles.emptyFilterState}>
          <p>No enrolled courses matched your search criteria.</p>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setSearch("");
              setFilterStatus("ALL");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div
          className={styles.courseContainer}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredCourses.map((item) => {
            const course = item.course || {};
            const progress = item.progress || {};
            const percent = Math.round(progress.progressPercentage || 0);
            const lessonsDone = progress.completedLessons?.length || 0;
            const isDone = progress.isCompleted || percent >= 100;
            const capstoneUnlocked =
              !isDone && Boolean(progress.isCapstoneUnlocked);

            const statusClass = isDone
              ? styles.statusDone
              : capstoneUnlocked
                ? styles.statusCapstone
                : percent > 0
                  ? styles.statusActive
                  : styles.statusNew;

            const statusLabel = isDone
              ? "✓ Completed"
              : capstoneUnlocked
                ? "🚀 Capstone Unlocked"
                : percent > 0
                  ? "In Progress"
                  : "Just Started";

            const enrolledDate = formatDate(progress.enrolledAt);

            return (
              <motion.article
                className={styles.courseItem}
                key={course?._id || progress.courseId}
                variants={cardVariants}
                whileHover={{ y: -3 }}
              >
                {/* 1. THUMBNAIL (Laptop / Desktop ONLY) */}
                <div className={styles.thumbWrap}>
                  {course.thumbnailUrl ? (
                    <img
                      className={styles.courseThumb}
                      src={course.thumbnailUrl}
                      alt={course.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.courseThumbFallback}>
                      <span>📚</span>
                    </div>
                  )}

                  {course.category && (
                    <span className={styles.categoryTag}>
                      {course.category}
                    </span>
                  )}

                  <span className={`${styles.statusRibbon} ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* 2. COURSE DETAILS BODY */}
                <div className={styles.courseBody}>
                  {/* Top Mobile/Tablet Header Bar (When thumb is hidden) */}
                  <div className={styles.mobileTopBar}>
                    {course.category && (
                      <span className={styles.mobileCategoryTag}>
                        {course.category}
                      </span>
                    )}
                    <span
                      className={`${styles.statusRibbonMobile} ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h3 title={course.title}>
                    {course.title || "Untitled Course"}
                  </h3>

                  <p>
                    {course.description || "Keep up your learning momentum."}
                  </p>

                  {/* PROGRESS SECTION */}
                  <div className={styles.progressSection}>
                    <div className={styles.progressHead}>
                      <strong className={styles.percentLabel}>
                        {percent}%
                      </strong>
                      <span>{isDone ? "Completed 🎉" : "Complete"}</span>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          isDone ? styles.progressFillSuccess : ""
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* STATS CHIPS & ACTION FOOTER */}
                  <div className={styles.bottomRow}>
                    <div className={styles.statRow}>
                      <span className={styles.statChip}>
                        ▤ {lessonsDone} done
                      </span>

                      {progress.isQuizPassed && (
                        <span
                          className={`${styles.statChip} ${styles.statChipSuccess}`}
                        >
                          🏅 Quiz {progress.quizScore}%
                        </span>
                      )}

                      {enrolledDate && (
                        <span className={styles.statChip}>
                          📅 {enrolledDate}
                        </span>
                      )}
                    </div>

                    {/* ACTION CTA */}
                    <Link
                      to={`/student/courses/${course._id}/learn`}
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.ctaBtn}`}
                    >
                      <span>
                        {isDone ? "Review Course" : "Continue Learning"}
                      </span>
                      <span className={styles.btnArrow}>→</span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default MyCourses;

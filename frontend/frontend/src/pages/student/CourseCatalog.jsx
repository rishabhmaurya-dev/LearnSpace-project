import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import { CardGridSkeleton } from "../../components/AppSkeletons";

import {
  fetchPublishedCourses,
  enrollInCourse,
} from "../../features/student/studentCourseThunks";

import {
  clearStudentCourseError,
  clearStudentCourseSuccess,
} from "../../features/student/studentCourseSlice";

import styles from "./CourseCatalog.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const CourseCatalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    catalog = [],
    loading,
    error,
    success,
    message,
  } = useSelector((state) => state.studentCourse);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  useEffect(() => {
    dispatch(fetchPublishedCourses());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(message || "Operation successful");
      dispatch(clearStudentCourseSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearStudentCourseError());
    }
  }, [error, dispatch]);

  const categories = useMemo(() => {
    const list = ["ALL"];
    catalog.forEach((c) => {
      if (c.category && !list.includes(c.category)) {
        list.push(c.category);
      }
    });
    return list;
  }, [catalog]);

  const filteredCourses = useMemo(() => {
    return catalog.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "ALL" || course.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [catalog, searchQuery, selectedCategory]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      const res = await dispatch(enrollInCourse(courseId));

      if (enrollInCourse.fulfilled.match(res)) {
        navigate(`/student/courses/${courseId}/learn`);
      } else {
        toast.error(res.payload || "Failed to enroll in course");
      }
    } catch (err) {
      toast.error("An error occurred during enrollment.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <div className={styles.catalogWrapper}>
      {/* Background Ambience */}
      <div className={styles.glowTopLeft} />
      <div className={styles.glowBottomRight} />

      {/* Header */}
      <section className={styles.heroSection}>
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.heroContent}
        >
          <span className={styles.heroBadge}>🎓 Accredited Skill Paths</span>
          <h1 className={styles.heroTitle}>
            Explore <span className={styles.gradientText}>Course Catalog</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Complete modules, submit real-world capstone projects, and unlock
            verified completion certificates.
          </p>
        </motion.div>

        {/* Filter Controls */}
        <div className={styles.filterControls}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search courses by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.pillBtn} ${selectedCategory === cat ? styles.pillActive : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className={styles.catalogContainer}>
        {loading ? (
          <CardGridSkeleton count={8} />
        ) : filteredCourses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📂</div>
            <h3>No courses found</h3>
            <p>Try searching for a different course title or category.</p>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            className={styles.courseGrid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredCourses.map((course) => {
              const isEnrolling = enrollingCourseId === course._id;

              return (
                <motion.article
                  className={styles.courseCard}
                  key={course._id}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Thumbnail / Header Media */}
                  <div className={styles.imageContainer}>
                    {course.thumbnailUrl ? (
                      <img
                        className={styles.courseImage}
                        src={course.thumbnailUrl}
                        alt={course.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.fallbackThumb}>
                        <span>📚</span>
                      </div>
                    )}
                    <div className={styles.imageOverlay} />

                    {/* Category Tag */}
                    {course.category && (
                      <span className={styles.categoryBadge}>
                        {course.category}
                      </span>
                    )}

                    {/* Level Tag */}
                    <span
                      className={`${styles.levelBadge} ${
                        styles[course.level?.toLowerCase()] || styles.beginner
                      }`}
                    >
                      {course.level || "Beginner"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className={styles.cardBody}>
                    {/* Course Deliverables Highlights */}
                    <div className={styles.featureHighlights}>
                      <span className={styles.featureTag}>
                        📌 Capstone Project
                      </span>
                      <span className={styles.featureTag}>
                        📜 QR Verified PDF
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className={styles.courseTitle} title={course.title}>
                      {course.title}
                    </h3>
                    <p className={styles.courseDescription}>
                      {course.description ||
                        "Step-by-step modular lessons with interactive evaluation and capstone submission."}
                    </p>

                    {/* Meta Info */}
                    <div className={styles.metaRow}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaSymbol}>▤</span>
                        <span>{course.lessonCount || 0} Lessons</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaSymbol}>⚡</span>
                        <span>Self-Paced</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaSymbol}>🛡️</span>
                        <span>Certificate</span>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className={styles.cardFooter}>
                      <AnimatePresence mode="wait">
                        {course.isEnrolled ? (
                          <Link
                            to={`/student/courses/${course._id}/learn`}
                            className={`${styles.actionBtn} ${styles.continueBtn}`}
                          >
                            <span>Continue Learning</span>
                            <span className={styles.btnArrow}>→</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.enrollBtn}`}
                            disabled={isEnrolling}
                            onClick={() => handleEnroll(course._id)}
                          >
                            {isEnrolling ? (
                              <div className={styles.btnLoading}>
                                <span className={styles.spinner} />
                                <span>Enrolling...</span>
                              </div>
                            ) : (
                              <>
                                <span>Enroll Now</span>
                                <span className={styles.btnArrow}>→</span>
                              </>
                            )}
                          </button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default CourseCatalog;

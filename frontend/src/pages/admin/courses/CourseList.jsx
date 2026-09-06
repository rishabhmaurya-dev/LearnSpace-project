import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { CourseCardSkeleton } from "../../../components/AppSkeletons";
import {
  fetchAdminCourses,
  deleteAdminCourse,
  publishAdminCourse,
  unpublishAdminCourse,
} from "../../../features/courses/courseThunks";
import {
  clearCourseError,
  clearCourseSuccess,
} from "../../../features/courses/courseSlice";

import styles from "./CourseList.module.css";
import { GradualSpacing } from "../../../animation/Text";

/* icons (clean inline svgs) */
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BookOpenIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l1.9 5.7a2 2 0 0 0 1.27 1.27L20.87 11l-5.7 1.9a2 2 0 0 0-1.27 1.27L12 20.87l-1.9-5.7a2 2 0 0 0-1.27-1.27L3.13 11l5.7-1.9A2 2 0 0 0 10.1 7.7L12 2z" />
  </svg>
);

const CourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    courses = [],
    pagination,
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCourse);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [showLoader, setShowLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loaderTimer = setTimeout(() => setShowLoader(false), 600);
    dispatch(
      fetchAdminCourses({
        search: debouncedSearch,
        category,
        status,
        page,
        limit,
      }),
    );
    return () => clearTimeout(loaderTimer);
  }, [dispatch, debouncedSearch, category, status, page, limit]);

  useEffect(() => {
    if (!success) return;
    toast.success(message || "Operation successful");
    const timer = setTimeout(() => dispatch(clearCourseSuccess()), 2500);
    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    const timer = setTimeout(() => dispatch(clearCourseError()), 3500);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setPage(1);
  };

  const refreshCourses = () => {
    dispatch(
      fetchAdminCourses({
        search: debouncedSearch,
        category,
        status,
        page,
        limit,
      }),
    );
  };

  const handleTogglePublish = (course) => {
    const action = course.isPublished
      ? unpublishAdminCourse(course._id)
      : publishAdminCourse(course._id);

    dispatch(action).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        refreshCourses();
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    dispatch(deleteAdminCourse(deleteTarget._id)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setDeleteTarget(null);
        refreshCourses();
      }
    });
  };

  const totalPages = pagination?.totalPages || 1;
  const totalCourses = pagination?.total || courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;
  const categories = [
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  return (
    <div className={styles.container}>
      {/* Ambient Glow Orbs */}
      <div className={styles.glowOrbTop} aria-hidden="true" />
      <div className={styles.glowOrbBottom} aria-hidden="true" />

      {/* hero header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.kicker}>
            <span className={styles.kickerDot} />
            LearnSpace Studio
          </span>
          <h1 className={styles.title}>
            <GradualSpacing text="Course Catalog" />
          </h1>
          <p className={styles.subtitle}>
            Create, structure, and supervise all active curriculums and learning
            paths.
          </p>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            {totalCourses} in library
          </span>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => navigate("/admin/courses/new")}
          >
            <PlusIcon />
            <span>Create New Course</span>
          </button>
        </div>
      </header>

      {/* stats overview */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconTile} ${styles.tileBrand}`}>
            <SparkleIcon />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Courses</span>
            <strong className={styles.statValue}>{totalCourses}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconTile} ${styles.tileGreen}`}>🚀</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Published Live</span>
            <strong className={styles.statValue}>{publishedCourses}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconTile} ${styles.tileAmber}`}>📝</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Draft In Progress</span>
            <strong className={styles.statValue}>{draftCourses}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconTile} ${styles.tileViolet}`}>🗂️</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Categories</span>
            <strong className={styles.statValue}>
              {categories.length || 0}
            </strong>
          </div>
        </div>
      </section>

      {/* filter / search toolbar */}
      <section className={styles.toolbar}>
        <p className={styles.resultsText}>
          Showing{" "}
          <strong className={styles.resultsCount}>{courses.length}</strong> of{" "}
          {totalCourses} courses
        </p>

        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by title, topics, or keywords..."
            value={search}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {search && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearch("")}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filtersWrapper}>
          <select
            className={styles.customSelect}
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={styles.customSelect}
            value={status}
            onChange={handleStatusChange}
          >
            <option value="">All Visibility</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          {(search || category || status) && (
            <button
              type="button"
              className={styles.resetFiltersBtn}
              onClick={handleClearFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* course list */}
      <main className={styles.courseList}>
        {loading || showLoader ? (
          <CourseCardSkeleton count={8} />
        ) : courses.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrap}>
              <div className={styles.emptyArt}>📁</div>
            </div>
            <h3>No courses found</h3>
            <p>Try refining your query or clear the current filters.</p>
            {(search || category || status) && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          courses.map((course) => (
            <article key={course._id} className={styles.card}>
              {/* Top Thumbnail Container */}
              <div className={styles.thumbnailWrapper}>
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className={styles.thumbnailImg}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.placeholderThumbnail}>
                    <span className={styles.placeholderBrand}>LearnSpace</span>
                  </div>
                )}

                <div className={styles.imageOverlay} />

                {/* Category Badge (Top Left) */}
                <span className={styles.categoryBadge}>
                  {course.category || "General"}
                </span>

                {/* Status Pill (Top Right) */}
                <span
                  className={`${styles.statusPill} ${
                    course.isPublished ? styles.publishedPill : styles.draftPill
                  }`}
                >
                  <span className={styles.statusDot} />
                  {course.isPublished ? "Live" : "Draft"}
                </span>
              </div>

              {/* Body Content */}
              <div className={styles.cardBody}>
                <h3 className={styles.courseTitle} title={course.title}>
                  {course.title}
                </h3>

                <p className={styles.courseDesc}>
                  {course.description ||
                    "Structured lessons with interactive quizzes and hands-on capstone evaluation."}
                </p>

                <div className={styles.metaRow}>
                  <div className={styles.metaChip} title="Total lessons">
                    <span className={styles.metaIconWrap}>
                      <BookOpenIcon />
                    </span>
                    <span>{course.lessonCount || 0} Lessons</span>
                  </div>

                  <div className={styles.metaChip} title="Quizzes included">
                    <span className={styles.metaIconWrap}>
                      <HelpCircleIcon />
                    </span>
                    <span>{course.quiz?.length || 0} Quizzes</span>
                  </div>

                  <div className={styles.metaChip} title="Creation date">
                    <span className={styles.metaIconWrap}>
                      <CalendarIcon />
                    </span>
                    <span>{formatDate(course.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <footer className={styles.cardFooter}>
                <div className={styles.mainActions}>
                  <button
                    type="button"
                    className={`${styles.btnAction} ${styles.btnView}`}
                    onClick={() => navigate(`/admin/courses/${course._id}`)}
                    title="Preview course"
                  >
                    <EyeIcon />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.btnAction} ${styles.btnEdit}`}
                    onClick={() =>
                      navigate(`/admin/courses/${course._id}/edit`)
                    }
                    title="Edit course"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.btnAction} ${
                      course.isPublished
                        ? styles.btnUnpublish
                        : styles.btnPublish
                    }`}
                    disabled={operationLoading}
                    onClick={() => handleTogglePublish(course)}
                    title={
                      course.isPublished ? "Unpublish course" : "Publish course"
                    }
                  >
                    {course.isPublished ? <EyeOffIcon /> : <CheckCircleIcon />}
                    <span>{course.isPublished ? "Unpublish" : "Publish"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.btnAction} ${styles.btnDelete}`}
                  disabled={operationLoading}
                  onClick={() => setDeleteTarget(course)}
                  title="Delete course"
                  aria-label="Delete course"
                >
                  <TrashIcon />
                </button>
              </footer>
            </article>
          ))
        )}
      </main>

      {/* pagination */}
      {!loading && !showLoader && courses.length > 0 && totalPages > 1 && (
        <nav className={styles.paginationNav}>
          <button
            type="button"
            className={`${styles.pagerBtn} ${
              page === 1 ? styles.pagerDisabled : ""
            }`}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeftIcon />
            <span>Previous</span>
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                type="button"
                key={num}
                className={`${styles.pageDot} ${
                  page === num ? styles.activeDot : ""
                }`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.pagerBtn} ${
              page === totalPages ? styles.pagerDisabled : ""
            }`}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRightIcon />
          </button>
        </nav>
      )}

      {/* delete confirmation modal */}
      {deleteTarget && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDeleteTarget(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalWarningIcon}>
              <TrashIcon />
            </div>

            <h3 className={styles.modalHeading}>Delete this course?</h3>
            <p className={styles.modalDescription}>
              Are you sure you want to permanently delete{" "}
              <strong>"{deleteTarget.title}"</strong>? This will remove all
              enrolled curriculum, quizzes, and learner progress.
            </p>

            <div className={styles.modalBtnGroup}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                disabled={operationLoading}
                onClick={handleDeleteConfirm}
              >
                {operationLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default CourseList;

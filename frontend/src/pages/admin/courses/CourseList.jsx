import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  Globe,
  Layers,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

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

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CourseCardSkeleton = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={`${styles.skeletonBlock} ${styles.skeletonMedia}`} />
    <div className={styles.cardBody}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonLineTall}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
      <div className={styles.skeletonMeta}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonChip}`} />
      </div>
    </div>
    <div className={styles.cardFooter}>
      <div className={styles.skeletonCreator}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonAvatar}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLineMid}`} />
      </div>
      <div className={styles.skeletonActions}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
      </div>
    </div>
  </div>
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
  const hasFilters = Boolean(search || category || status);

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses,
      icon: Layers,
      tone: "brand",
    },
    {
      label: "Published Live",
      value: publishedCourses,
      icon: Globe,
      tone: "green",
    },
    {
      label: "Draft In Progress",
      value: draftCourses,
      icon: FileText,
      tone: "amber",
    },
    {
      label: "Active Categories",
      value: categories.length || 0,
      icon: FolderTree,
      tone: "violet",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <span>Admin</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Courses</span>
          </nav>
          <h1 className={styles.title}>Course Catalog</h1>
          <p className={styles.subtitle}>
            Create, structure, and supervise all active curriculums and learning
            paths.
          </p>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.counterChip}>
            <Sparkles size={14} />
            {totalCourses} in library
          </span>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => navigate("/admin/courses/new")}
          >
            <Plus size={17} />
            <span>Create New Course</span>
          </button>
        </div>
      </header>

      <section className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={`${styles.statIconTile} ${styles[stat.tone]}`}>
                <Icon size={18} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <strong className={styles.statValue}>{stat.value}</strong>
              </div>
            </div>
          );
        })}
      </section>

      <section className={styles.toolbar}>
        <p className={styles.resultsText}>
          Showing <strong>{courses.length}</strong> of {totalCourses} courses
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by title, topics, or keywords..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Search courses"
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={category}
              onChange={handleCategoryChange}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className={styles.selectIcon} />
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={status}
              onChange={handleStatusChange}
              aria-label="Filter by visibility"
            >
              <option value="">All Visibility</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <ChevronDown size={15} className={styles.selectIcon} />
          </div>

          {hasFilters && (
            <button
              type="button"
              className={styles.resetFiltersBtn}
              onClick={handleClearFilters}
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>
      </section>

      <main className={styles.courseList}>
        {loading || showLoader ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : courses.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrap}>
              <BookOpen size={26} />
            </div>
            <h3 className={styles.emptyHeading}>No courses found</h3>
            <p className={styles.emptyText}>
              {hasFilters
                ? "No course matches the current filters. Try a different search or clear them."
                : "Create your first course to start building the library."}
            </p>
            {hasFilters && (
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
          courses.map((course) => {
            const quizCount = course.quiz?.length || 0;
            const hasCapstone = Boolean(
              course.capstoneProject?.title?.trim() ||
                course.capstoneProject?.description?.trim(),
            );
            const creatorName = course.createdBy?.name || "Unknown admin";
            const passMark = course.passingPercentage ?? 0;

            return (
              <article key={course._id} className={styles.card}>
                <div className={styles.media}>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className={styles.thumbnailImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.mediaFallback}>
                      <BookOpen size={26} />
                      <span>No thumbnail</span>
                    </div>
                  )}

                  <span className={styles.mediaScrim} />

                  {course.category && (
                    <span className={styles.categoryBadge}>
                      {course.category}
                    </span>
                  )}

                  <span
                    className={`${styles.statusPill} ${
                      course.isPublished
                        ? styles.publishedPill
                        : styles.draftPill
                    }`}
                    title={
                      course.isPublished
                        ? `Published ${formatDate(course.publishedAt)}`
                        : `Created ${formatDate(course.createdAt)}`
                    }
                  >
                    <span className={styles.statusDot} />
                    {course.isPublished ? "Live" : "Draft"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.courseTitle} title={course.title}>
                    {course.title}
                  </h3>

                  <p className={styles.courseDesc} title={course.description}>
                    {course.description}
                  </p>

                  <div className={styles.metaRow}>
                    <span
                      className={`${styles.metaChip} ${
                        quizCount ? "" : styles.metaChipWarn
                      }`}
                      title="Questions in the final quiz"
                    >
                      <CircleHelp size={12} />
                      {quizCount || 0}
                    </span>

                    <span
                      className={`${styles.metaChip} ${
                        hasCapstone ? "" : styles.metaChipWarn
                      }`}
                      title={
                        hasCapstone
                          ? "Capstone project configured"
                          : "No capstone project configured"
                      }
                    >
                      <Rocket size={12} />
                      Capstone
                    </span>

                    <span className={styles.metaChip} title="Pass mark">
                      <Target size={12} />
                      {passMark}%
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.creator} title={creatorName}>
                    <span className={styles.creatorAvatar} aria-hidden="true">
                      {creatorName.charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.creatorName}>{creatorName}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={`${styles.btnIcon} ${styles.btnView}`}
                      onClick={() => navigate(`/admin/courses/${course._id}`)}
                      title="Preview course"
                      aria-label={`Preview ${course.title}`}
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      type="button"
                      className={`${styles.btnIcon} ${styles.btnEdit}`}
                      onClick={() =>
                        navigate(`/admin/courses/${course._id}/edit`)
                      }
                      title="Edit course"
                      aria-label={`Edit ${course.title}`}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      className={`${styles.btnIcon} ${
                        course.isPublished
                          ? styles.btnUnpublish
                          : styles.btnPublish
                      }`}
                      disabled={operationLoading}
                      onClick={() => handleTogglePublish(course)}
                      title={
                        course.isPublished
                          ? "Unpublish course"
                          : "Publish course"
                      }
                      aria-label={
                        course.isPublished
                          ? `Unpublish ${course.title}`
                          : `Publish ${course.title}`
                      }
                    >
                      {course.isPublished ? (
                        <EyeOff size={14} />
                      ) : (
                        <CircleCheck size={14} />
                      )}
                    </button>

                    <button
                      type="button"
                      className={`${styles.btnIcon} ${styles.btnDelete}`}
                      disabled={operationLoading}
                      onClick={() => setDeleteTarget(course)}
                      title="Delete course"
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>

      {!loading && !showLoader && courses.length > 0 && totalPages > 1 && (
        <nav className={styles.paginationNav} aria-label="Pagination">
          <button
            type="button"
            className={styles.pagerBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                type="button"
                key={num}
                className={`${styles.pageNumBtn} ${
                  page === num ? styles.pageNumActive : ""
                }`}
                onClick={() => setPage(num)}
                aria-current={page === num ? "page" : undefined}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.pagerBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      {deleteTarget && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalIcon}>
              <TriangleAlert size={22} />
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

export default CourseList;


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../../../components/ui/Loader";

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

const CourseList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =====================================================
     REDUX STATE
  ===================================================== */

  const {
    courses,
    pagination,
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCourse);

  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [showLoader, setShowLoader] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =====================================================
     DEBOUNCE SEARCH
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* =====================================================
     FETCH COURSES
  ===================================================== */

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
    }, 700);

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

  /* =====================================================
     SUCCESS MESSAGE
  ===================================================== */

  useEffect(() => {
    if (!success) return;

    toast.success(message || "Operation successful");

    const timer = setTimeout(() => {
      dispatch(clearCourseSuccess());
    }, 2500);

    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  /* =====================================================
     ERROR MESSAGE
  ===================================================== */

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(clearCourseError());
    }, 3500);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  /* =====================================================
     HANDLERS
  ===================================================== */

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

  /* =====================================================
     CREATE
  ===================================================== */

  const handleCreate = () => {
    navigate("/admin/courses/new");
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (courseId) => {
    navigate(`/admin/courses/${courseId}/edit`);
  };

  /* =====================================================
     REFRESH COURSES
  ===================================================== */

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

  /* =====================================================
     PUBLISH / UNPUBLISH
  ===================================================== */

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

  /* =====================================================
     DELETE CONFIRM
  ===================================================== */

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    dispatch(deleteAdminCourse(deleteTarget._id)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setDeleteTarget(null);

        refreshCourses();
      }
    });
  };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
  };

  /* =====================================================
     DATA
  ===================================================== */

  const totalPages = pagination?.totalPages || 1;

  const totalCourses = pagination?.total || 0;

  const publishedCourses = courses.filter(
    (course) => course.isPublished,
  ).length;

  const categories = [
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className={styles.container}>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1>
            <GradualSpacing text="Courses" />
          </h1>

          <p>Manage your courses, lessons, quizzes, and capstone projects</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <strong>{totalCourses}</strong>
              <span>Total</span>
            </div>

            <div className={styles.headerStat}>
              <strong>{publishedCourses}</strong>
              <span>Published</span>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={handleCreate}>
            <span className={styles.primaryBtnIcon}>+</span>
            New Course
          </button>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className={styles.filters}>
        {/* SEARCH */}

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>

          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={handleSearchChange}
          />

          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {/* CATEGORY */}

        <select
          className={styles.select}
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

        {/* STATUS */}

        <select
          className={styles.select}
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">All Status</option>

          <option value="PUBLISHED">Published</option>

          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* =================================================
          COURSE LIST
      ================================================= */}

      <div className={styles.courseList}>
        {loading || showLoader ? (
          /* LOADING */

          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : courses.length === 0 ? (
          /* EMPTY */

          <div className={styles.stateBox}>
            <div className={styles.emptyIcon}>▣</div>

            <h3>No courses found</h3>

            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          /* COURSES */

          courses.map((course, index) => (
            <div
              key={course._id}
              className={styles.courseCard}
              style={{
                "--index": index,
              }}
            >
              {/* =========================================
                  THUMBNAIL
              ========================================= */}

              <div className={styles.courseThumbnail}>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} />
                ) : (
                  <div className={styles.thumbnailFallback}>
                    <span>▣</span>
                  </div>
                )}
              </div>

              {/* =========================================
                  COURSE CONTENT
              ========================================= */}

              <div className={styles.courseContent}>
                {/* TITLE + STATUS */}

                <div className={styles.courseTitleRow}>
                  <h3 title={course.title}>{course.title}</h3>

                  <span
                    className={`${styles.statusBadge} ${
                      course.isPublished
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    <span className={styles.statusDot} />

                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* CATEGORY */}

                <div className={styles.courseCategory}>
                  <span className={styles.categoryIcon}>◇</span>

                  <span>{course.category || "Uncategorized"}</span>
                </div>

                {/* =====================================
                    STATS
                ===================================== */}

                <div className={styles.courseStats}>
                  {/* LESSONS */}

                  <div className={styles.statItem}>
                    <span className={`${styles.statIcon} ${styles.lessonIcon}`}>
                      ▤
                    </span>

                    <div>
                      <strong>{course.lessonCount || 0}</strong>

                      <span>Lessons</span>
                    </div>
                  </div>

                  {/* QUESTIONS */}

                  <div className={styles.statItem}>
                    <span
                      className={`${styles.statIcon} ${styles.questionIcon}`}
                    >
                      ?
                    </span>

                    <div>
                      <strong>{course.quiz?.length || 0}</strong>

                      <span>Questions</span>
                    </div>
                  </div>

                  {/* CREATED */}

                  <div className={styles.statItem}>
                    <span className={`${styles.statIcon} ${styles.dateIcon}`}>
                      ◷
                    </span>

                    <div>
                      <strong>{formatDate(course.createdAt)}</strong>

                      <span>Created At</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================
                  ACTIONS
              ========================================= */}

              <div className={styles.courseActions}>
                {/* VIEW */}

                <button
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => handleView(course._id)}
                  title="View Course"
                >
                  <span className={styles.actionIcon}>◉</span>

                  <span>View</span>
                </button>

                {/* EDIT */}

                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => handleEdit(course._id)}
                  title="Edit Course"
                >
                  <span className={styles.actionIcon}>✎</span>

                  <span>Edit</span>
                </button>

                {/* PUBLISH / UNPUBLISH */}

                <button
                  className={`${styles.actionBtn} ${
                    course.isPublished ? styles.unpublishBtn : styles.publishBtn
                  }`}
                  disabled={operationLoading}
                  onClick={() => handleTogglePublish(course)}
                  title={
                    course.isPublished ? "Unpublish Course" : "Publish Course"
                  }
                >
                  <span className={styles.actionIcon}>
                    {course.isPublished ? "↩" : "↑"}
                  </span>

                  <span>{course.isPublished ? "Unpublish" : "Publish"}</span>
                </button>

                {/* DELETE */}

                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  disabled={operationLoading}
                  onClick={() => setDeleteTarget(course)}
                  title="Delete Course"
                >
                  <span className={styles.actionIcon}>♢</span>

                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading && !showLoader && courses.length > 0 && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Previous
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  className={`${styles.pageNumber} ${
                    page === pageNumber ? styles.activePage : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>

          <button
            className={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteTarget(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}

            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <div className={styles.modalIcon}>!</div>

                <div>
                  <h3>Delete Course</h3>

                  <span>This action cannot be undone</span>
                </div>
              </div>

              <button
                className={styles.modalClose}
                onClick={() => setDeleteTarget(null)}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.title}</strong>
                ?
                <br />
                This will also delete all related lessons and quizzes.
              </p>
            </div>

            {/* MODAL ACTIONS */}

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className={styles.dangerBtn}
                disabled={operationLoading}
                onClick={handleDeleteConfirm}
              >
                {operationLoading ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatViews = (views) => {
  if (!views) return "0";

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }

  return views.toString();
};

export default CourseList;

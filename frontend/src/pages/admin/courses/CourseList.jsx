import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

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

import styles from "./course.module.css";
import toast from "react-hot-toast";
import { GradualSpacing } from "../../../animation/Text";
const CourseList = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    courses,
    pagination,
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCourse);

  /* -----------------------------------------------------
     LOCAL STATE
  ----------------------------------------------------- */

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [status, setStatus] = useState("");

  const [showLoader, setshowLoader] = useState(true);

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* -----------------------------------------------------
     DEBOUNCE SEARCH
  ----------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* -----------------------------------------------------
     FETCH COURSES
  ----------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setshowLoader(false);
    }, 2000);

    dispatch(
      fetchAdminCourses({
        search: debouncedSearch,
        category,
        status,
        page,
        limit,
      }),
    );
    return () => clearTimeout(timer);
  }, [dispatch, debouncedSearch, category, status, page, limit]);

  /* -----------------------------------------------------
     CLEAR MESSAGES
  ----------------  ------------------------------------- */

  useEffect(() => {
    if (success) {
      toast.success(message);
      const timer = setTimeout(() => dispatch(clearCourseSuccess()), 2500);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => dispatch(clearCourseError()), 3500);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /* -----------------------------------------------------
     HANDLERS
  ----------------------------------------------------- */

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

  const handleCreate = () => {
    navigate("/admin/courses/new");
  };

  const handleView = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/courses/${courseId}/edit`);
  };

  const handleTogglePublish = (course) => {
    const action = course.isPublished
      ? unpublishAdminCourse(course._id)
      : publishAdminCourse(course._id);

    dispatch(action).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        // Refetch list to ensure latest state
        dispatch(
          fetchAdminCourses({
            search: debouncedSearch,
            category,
            status,
            page,
            limit,
          }),
        );
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    dispatch(deleteAdminCourse(deleteTarget._id)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        setDeleteTarget(null);
        // Refetch list
        dispatch(
          fetchAdminCourses({
            search: debouncedSearch,
            category,
            status,
            page,
            limit,
          }),
        );
      }
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setPage(newPage);
  };

  const totalPages = pagination.totalPages || 1;

  const categories = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <div className={styles.container}>
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className={styles.pageHeader}>
        <div>
          <h1>
            <GradualSpacing text="Courses" />
          </h1>

          <p>Manage your courses, lessons, quizzes, and capstone projects</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <strong>{pagination.total || 0}</strong>

              <span>Total</span>
            </div>

            <div className={styles.headerStat}>
              <strong>{courses.filter((c) => c.isPublished).length}</strong>

              <span>Published</span>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={handleCreate}>
            + New Course
          </button>
        </div>
      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>

          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

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
      {/* =========================================
    COMPACT COURSE LIST
========================================= */}

      <div className={styles.courseList}>
        {loading || showLoader ? (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        ) : courses.length === 0 ? (
          <div className={styles.stateBox}>No courses found</div>
        ) : (
          courses.map((course, index) => (
            <div
              key={course._id}
              className={styles.courseRow}
              style={{ "--index": index }}
            >
              {/* =====================================
            THUMBNAIL
        ===================================== */}

              <div className={styles.courseThumbnail}>
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} />
                ) : (
                  <span>📚</span>
                )}
              </div>

              {/* =====================================
            COURSE INFO
        ===================================== */}

              <div className={styles.courseInfo}>
                <div className={styles.courseTitleRow}>
                  <h3>{course.title}</h3>

                  <span
                    className={`${styles.statusBadge} ${
                      course.isPublished
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p>{course.description || "No description available."}</p>

                <div className={styles.courseMeta}>
                  <span className={styles.categoryChip}>
                    {course.category || "Uncategorized"}
                  </span>

                  <span>📖 {course.lessonCount || 0} Lessons</span>

                  <span>❓ {course.quiz?.length || 0} Questions</span>
                </div>
              </div>

              {/* =====================================
            DATE
        ===================================== */}

              <div className={styles.courseDate}>
                <span>Created</span>

                <strong>{formatDate(course.createdAt)}</strong>
              </div>

              {/* =====================================
            ACTIONS
        ===================================== */}

              <div className={styles.courseActions}>
                <button
                  className={styles.viewBtn}
                  onClick={() => handleView(course._id)}
                  title="View Course"
                >
                  👁
                </button>

                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(course._id)}
                  title="Edit Course"
                >
                  ✏️
                </button>

                <button
                  className={
                    course.isPublished ? styles.unpublishBtn : styles.publishBtn
                  }
                  disabled={operationLoading}
                  onClick={() => handleTogglePublish(course)}
                  title={
                    course.isPublished ? "Unpublish Course" : "Publish Course"
                  }
                >
                  {course.isPublished ? "↩" : "🚀"}
                </button>

                <button
                  className={styles.deleteBtn}
                  disabled={operationLoading}
                  onClick={() => setDeleteTarget(course)}
                  title="Delete Course"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================
          DELETE CONFIRM MODAL
      ========================================= */}

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteTarget(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Delete Course</h3>

              <button
                className={styles.modalClose}
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.title}</strong>? This will also delete all
                related lessons and quizzes. This action cannot be undone.
              </p>

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

export default CourseList;

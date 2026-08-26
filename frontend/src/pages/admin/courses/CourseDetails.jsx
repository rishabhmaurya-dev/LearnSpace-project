import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-hot-toast";

import { useNavigate, useParams, Link } from "react-router-dom";

import {
  fetchAdminCourseDetails,
  publishAdminCourse,
  unpublishAdminCourse,
  deleteAdminCourse,
} from "../../../features/courses/courseThunks";

import {
  clearCourseError,
  clearCourseSuccess,
} from "../../../features/courses/courseSlice";

import styles from "./course.module.css";

const CourseDetails = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { courseId } = useParams();

  const {
    selectedCourse: course,
    lessons,
    detailsLoading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCourse);

  /* -----------------------------------------------------
     FETCH COURSE DETAILS
  ----------------------------------------------------- */

  useEffect(() => {
    if (courseId) {
      dispatch(fetchAdminCourseDetails(courseId));
    }
  }, [dispatch, courseId]);

  /* -----------------------------------------------------
     CLEAR MESSAGES
  ----------------------------------------------------- */

  useEffect(() => {
    if (success) {
      toast.success(message || "Operation successful", { duration: 2500 });
      const timer = setTimeout(() => dispatch(clearCourseSuccess()), 2500);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred", { duration: 3500 });
      const timer = setTimeout(() => dispatch(clearCourseError()), 3500);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /* -----------------------------------------------------
     HANDLERS
  ----------------------------------------------------- */

  const handleEdit = () => {
    navigate(`/admin/courses/${courseId}/edit`);
  };

  const handleTogglePublish = () => {
    if (!course) return;

    if (course.isPublished) {
      dispatch(unpublishAdminCourse(courseId));
    } else {
      dispatch(publishAdminCourse(courseId));
    }
  };

  const handleDelete = () => {
    if (!course) return;

    if (
      !window.confirm(`Delete course "${course.title}"? This cannot be undone.`)
    ) {
      return;
    }

    dispatch(deleteAdminCourse(courseId)).then(() => {
      navigate("/admin/courses");
    });
  };

  if (detailsLoading) {
    return <div className={styles.stateBox}>Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className={styles.container}>
        <Link to="/admin/courses" className={styles.backLink}>
          ← Back to Courses
        </Link>

        <div className={styles.stateBox}>{error || "Course not found"}</div>
      </div>
    );
  }

  const publishedCount = lessons.filter((l) => l.isPublished).length;

  const lessonsWithMcq = lessons.filter((l) => l.mcqCount > 0).length;

  return (
    <div className={styles.container}>
      {/* =========================================
          HEADER
      ========================================= */}

      <div className={styles.detailHeader}>
        <Link to="/admin/courses" className={styles.backLink}>
          ← Back to Courses
        </Link>
      </div>

      {/* =========================================
          HERO
      ========================================= */}

      <div className={styles.courseHero}>
        <div className={styles.heroThumb}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} />
          ) : (
            "📚"
          )}
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.heroHeaderRow}>
            <h2>{course.title}</h2>

            <span
              className={`${styles.statusBadge} ${
                course.isPublished ? styles.statusPublished : styles.statusDraft
              }`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <span className={styles.categoryChip}>{course.category}</span>

          <p>{course.description}</p>

          <div className={styles.heroActions}>
            <button className={styles.primaryBtn} onClick={handleEdit}>
              ✏️ Edit Course
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(`/admin/courses/${courseId}/edit?step=1`)}
            >
              📖 Lessons
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(`/admin/courses/${courseId}/edit?step=2`)}
            >
              📝 Quiz
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(`/admin/courses/${courseId}/edit?step=3`)}
            >
              🎯 Capstone
            </button>

            <button
              className={
                course.isPublished ? styles.secondaryBtn : styles.successBtn
              }
              disabled={operationLoading}
              onClick={handleTogglePublish}
            >
              {course.isPublished ? "Unpublish" : "Publish"}
            </button>

            <button
              className={styles.dangerBtn}
              disabled={operationLoading}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          META GRID
      ========================================= */}

      <div className={styles.metaGrid}>
        <MetaCard label="Lessons" value={lessons.length} icon="📖" />

        <MetaCard label="Lesson MCQs" value={lessonsWithMcq} icon="❓" />

        <MetaCard
          label="Final Quiz"
          value={`${course.quiz?.length || 0} Qs`}
          icon="📝"
        />

        <MetaCard
          label="Pass %"
          value={`${course.passingPercentage || 70}%`}
          icon="🎯"
        />

        <MetaCard
          label="Quiz Time"
          value={`${course.quizTimeLimitMinutes || 45}m`}
          icon="⏱"
        />

        <MetaCard label="Published" value={publishedCount} icon="✅" />
      </div>

      {/* =========================================
          LESSONS
      ========================================= */}

      <div className={styles.detailSection}>
        <h3>
          Lessons
          <span className={styles.sectionCount}>{lessons.length} total</span>
        </h3>

        {lessons.length === 0 ? (
          <div className={styles.stateBox}>No lessons yet</div>
        ) : (
          <div className={styles.lessonList}>
            {lessons.map((lesson) => (
              <div key={lesson._id} className={styles.lessonItem}>
                <div className={styles.lessonNum}>{lesson.lessonNumber}</div>

                <div className={styles.lessonInfo}>
                  <strong>{lesson.title}</strong>

                  <small>{lesson.topicHeading}</small>
                </div>

                <span
                  className={`${styles.mcqBadge} ${
                    lesson.mcqCount > 0 ? styles.mcqOk : styles.mcqMissing
                  }`}
                >
                  {lesson.mcqCount > 0 ? `${lesson.mcqCount} MCQs` : "No MCQs"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================
          FINAL QUIZ
      ========================================= */}

      <div className={styles.detailSection}>
        <h3>
          Final Quiz
          <span className={styles.sectionCount}>
            {course.quiz?.length || 0} questions
          </span>
        </h3>

        {course.quiz?.length > 0 ? (
          <div className={styles.quizList}>
            {course.quiz.slice(0, 20).map((q, index) => (
              <div key={index} className={styles.quizItem}>
                <span>Q{index + 1}.</span>

                <div>
                  {q.question}
                  <div className={styles.muted}>
                    ✓ {q.options[q.correctOptionIndex]}
                  </div>
                </div>
              </div>
            ))}

            {course.quiz.length > 20 && (
              <div className={styles.stateBox}>
                +{course.quiz.length - 20} more questions
              </div>
            )}
          </div>
        ) : (
          <div className={styles.stateBox}>No final quiz uploaded yet</div>
        )}
      </div>

      {/* =========================================
          CAPSTONE
      ========================================= */}

      <div className={styles.detailSection}>
        <h3>Capstone Project</h3>

        {course.capstoneProject?.title ? (
          <div className={styles.capstoneCard}>
            <div className={styles.capstoneRow}>
              <label>Title</label>

              <div>{course.capstoneProject.title}</div>
            </div>

            <div className={styles.capstoneRow}>
              <label>Description</label>

              <div>{course.capstoneProject.description}</div>
            </div>

            <div className={styles.capstoneRow}>
              <label>Submission</label>

              <div>{course.capstoneProject.submissionRequirements}</div>
            </div>
          </div>
        ) : (
          <div className={styles.stateBox}>No capstone project details yet</div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   META CARD
========================================================= */

const MetaCard = ({ label, value, icon }) => {
  return (
    <div className={styles.metaCard}>
      <strong>
        {icon} {value}
      </strong>

      <span>{label}</span>
    </div>
  );
};

export default CourseDetails;

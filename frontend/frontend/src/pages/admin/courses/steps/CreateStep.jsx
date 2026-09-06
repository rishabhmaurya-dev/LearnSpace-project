import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import styles from "../course.module.css";

const CreateStep = ({
  course,
  lessons = [],
  publishing,
  onPublish,
  error,
  success,
  message,
}) => {
  const navigate = useNavigate();

  /* -----------------------------------------------------
      TOAST ALERTS TRIGGER
  ----------------------------------------------------- */
  useEffect(() => {
    if (success && message) {
      toast.success(message);
    }
  }, [success, message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /* -----------------------------------------------------
      REQUIREMENTS CALCULATIONS
  ----------------------------------------------------- */
  const lessonsWithMcq = lessons.filter((l) => l.mcqCount > 0).length;
  const quizCount = course?.quiz?.length || 0;
  const hasCapstone =
    course?.capstoneProject?.title && course?.capstoneProject?.description;

  const requirements = [
    {
      label: "Basic course info & images",
      ok: Boolean(
        course?.title &&
        course?.category &&
        course?.description &&
        course?.thumbnailUrl,
      ),
    },
    {
      label: "At least one lesson",
      ok: lessons.length >= 1,
    },
    {
      label: "Every lesson has at least one MCQ",
      ok: lessons.length > 0 && lessonsWithMcq === lessons.length,
    },
    {
      label: "Final quiz has 10–50 questions",
      ok: quizCount >= 10 && quizCount <= 50,
    },
    {
      label: "Capstone project details completed",
      ok: hasCapstone,
    },
  ];

  const allReady = requirements.every((req) => req.ok);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* =========================================
          SECTION 1: PAGE HEADER CARD
      ========================================= */}
      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleWrapper}>
            <h2 className={styles.stepTitle}>Create Course</h2>
          </div>

          <div className={styles.subtitleWrapper} style={{ marginTop: 6 }}>
            <p className={styles.stepSubtitle}>
              Final step — verify all requirements and publish your course.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION 2: REQUIREMENTS CHECKLIST CARD
      ========================================= */}
      <div className={styles.card}>
        <div className={styles.cardHeaderWrapper} style={{ marginBottom: 14 }}>
          <h4>Course Completion Checklist</h4>
        </div>

        <div className={styles.requirementsCard}>
          {requirements.map((req, index) => (
            <div key={index} className={styles.requirementRow}>
              {/* Icon Container */}
              <div className={styles.iconContainer}>
                <span
                  className={`${styles.reqIcon} ${
                    req.ok ? styles.reqOk : styles.reqMissing
                  }`}
                >
                  {req.ok ? "✓" : "!"}
                </span>
              </div>

              {/* Label Container */}
              <div className={styles.labelContainer}>
                <span>{req.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
          SECTION 3: PUBLISH ACTION CARD
      ========================================= */}
      <div className={styles.card}>
        <div className={styles.actionHeaderWrapper} style={{ marginBottom: 8 }}>
          <h4>🚀 Publish Course</h4>
        </div>

        <div className={styles.hintWrapper} style={{ marginBottom: 16 }}>
          <p className={styles.hint}>
            Publishing will make the course available to students. A published
            course cannot be modified until it is unpublished.
          </p>
        </div>

        <div className={styles.actionBodyWrapper}>
          <div className={styles.headerActions}>
            {/* Button Box */}
            <div className={styles.btnBox}>
              <button
                className={styles.successBtn}
                disabled={!allReady || publishing}
                onClick={() => onPublish(course?._id)}
              >
                {publishing ? (
                  <div
                    className={styles.loadingState}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span className={styles.spinner}></span>
                    <span>Publishing...</span>
                  </div>
                ) : (
                  <div className={styles.btnLabel}>
                    <span>✓ Publish Course</span>
                  </div>
                )}
              </button>
            </div>

            {/* Missing Notice Box */}
            {!allReady && (
              <div className={styles.warningNoticeBox} style={{ marginTop: 6 }}>
                <span
                  className={styles.hint}
                  style={{ color: "var(--warning)" }}
                >
                  Complete the missing requirements before publishing.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION 4: SAVE DRAFT / ALTERNATE ACTIONS CARD
      ========================================= */}
      <div className={styles.card}>
        <div className={styles.draftHeaderWrapper} style={{ marginBottom: 8 }}>
          <h4>💾 Not ready yet?</h4>
        </div>

        <div className={styles.hintWrapper} style={{ marginBottom: 16 }}>
          <p className={styles.hint}>
            You can save this course as a draft and come back later. All changes
            are already saved to the server as you progress through the steps.
          </p>
        </div>

        <div className={styles.draftActionsWrapper}>
          <div className={styles.headerActions}>
            <div className={styles.backBtnWrapper}>
              <button
                className={styles.secondaryBtn}
                onClick={() => navigate("/admin/courses")}
              >
                ← Back to Courses
              </button>
            </div>

            <div className={styles.detailsBtnWrapper}>
              <button
                className={styles.primaryBtn}
                onClick={() => navigate(`/admin/courses/${course?._id}`)}
              >
                View Course Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION 5: SUCCESS SCREEN CARD (IF PUBLISHED)
      ========================================= */}
      {course?.isPublished && (
        <div className={`${styles.card} ${styles.successScreen}`}>
          <div className={styles.iconWrapper} style={{ marginBottom: 10 }}>
            <div className={styles.successIcon}>🎉</div>
          </div>

          <div
            className={styles.successTitleWrapper}
            style={{ marginBottom: 8 }}
          >
            <h2>Course Published!</h2>
          </div>

          <div
            className={styles.successMessageWrapper}
            style={{ marginBottom: 18 }}
          >
            <p>
              <strong>{course.title}</strong> is now live and available to
              students.
            </p>
          </div>

          <div className={styles.successBtnGroupWrapper}>
            <div className={styles.successActions}>
              <div className={styles.btnItem}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => navigate(`/admin/courses/${course._id}`)}
                >
                  View Course
                </button>
              </div>

              <div className={styles.btnItem}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => navigate("/admin/courses")}
                >
                  Back to Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStep;

import styles from "../course.module.css";

const ReviewStep = ({ course, lessons, onNext }) => {
  if (!course) {
    return (
      <div className={styles.stepForm}>
        <h2 className={styles.stepTitle}>Review</h2>

        <p className={styles.stepSubtitle}>
          Review your course details before publishing.
        </p>

        <div className={styles.stateBox}>
          No course data available yet. Complete the previous steps first.
        </div>
      </div>
    );
  }

  const lessonsWithMcq = lessons.filter((l) => l.mcqCount > 0).length;

  const quizCount = course.quiz?.length || 0;

  const hasCapstone =
    course.capstoneProject?.title && course.capstoneProject?.description;

  /* =========================================
     PUBLISH READINESS CHECKLIST
  ========================================= */

  const checklist = [
    {
      label: "Basic course info & images uploaded",
      ok: Boolean(
        course.title &&
        course.category &&
        course.description &&
        course.thumbnailUrl,
      ),
    },
    {
      label: "At least one lesson uploaded",
      ok: lessons.length >= 1,
    },
    {
      label: "Every lesson has at least one MCQ",
      ok: lessons.length > 0 && lessonsWithMcq === lessons.length,
    },
    {
      label: "Final quiz has 10-50 questions",
      ok: quizCount >= 10 && quizCount <= 50,
    },
    {
      label: "Capstone project details completed",
      ok: hasCapstone,
    },
  ];

  const ready = checklist.every((item) => item.ok);

  return (
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>Review</h2>

      <p className={styles.stepSubtitle}>
        Verify all course details before publishing.
      </p>

      <div className={styles.reviewGrid}>
        {/* =========================================
            BASIC INFO
        ========================================= */}

        <div className={styles.reviewSection}>
          <h4>📋 Basic Info</h4>

          <div className={styles.reviewThumb}>
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} />
            ) : (
              <div className={styles.thumbnail}>📚</div>
            )}

            <strong>{course.title}</strong>
          </div>

          <div className={styles.reviewRow}>
            <span>Category</span>

            <strong>{course.category}</strong>
          </div>

          <div className={styles.reviewRow}>
            <span>Pass %</span>

            <strong>{course.passingPercentage || 70}%</strong>
          </div>

          <div className={styles.reviewRow}>
            <span>Quiz Time</span>

            <strong>{course.quizTimeLimitMinutes || 45} min</strong>
          </div>

          <div className={styles.reviewRow}>
            <span>Lesson Quiz Pass %</span>

            <strong>{course.lessonQuizPassingPercentage || 70}%</strong>
          </div>
        </div>

        {/* =========================================
            LESSONS & MCQ
        ========================================= */}

        <div className={styles.reviewSection}>
          <h4>
            📖 Lessons
            <span className={styles.sectionCount}>{lessons.length}</span>
          </h4>

          {lessons.length === 0 ? (
            <div className={styles.stateBox}>No lessons uploaded</div>
          ) : (
            <div>
              {lessons.map((lesson) => (
                <div key={lesson._id} className={styles.reviewLessonRow}>
                  <span>
                    {lesson.lessonNumber}. {lesson.title}
                  </span>

                  <span
                    className={`${styles.mcqBadge} ${
                      lesson.mcqCount > 0 ? styles.mcqOk : styles.mcqMissing
                    }`}
                  >
                    {lesson.mcqCount > 0 ? `${lesson.mcqCount} MCQs` : "No MCQ"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================
            FINAL QUIZ
        ========================================= */}

        <div className={styles.reviewSection}>
          <h4>
            📝 Final Quiz
            <span className={styles.sectionCount}>{quizCount} Qs</span>
          </h4>

          {quizCount === 0 ? (
            <div className={styles.stateBox}>No final quiz uploaded</div>
          ) : (
            <div className={styles.quizList}>
              {course.quiz.slice(0, 8).map((q, index) => (
                <div key={index} className={styles.quizItem}>
                  <span>Q{index + 1}.</span>
                  <div>{q.question}</div>
                </div>
              ))}

              {quizCount > 8 && (
                <div className={styles.muted}>
                  +{quizCount - 8} more questions
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================
            CAPSTONE
        ========================================= */}

        <div className={styles.reviewSection}>
          <h4>🎯 Capstone</h4>

          {!hasCapstone ? (
            <div className={styles.stateBox}>
              No capstone project details yet
            </div>
          ) : (
            <>
              <div className={styles.reviewRow}>
                <span>Title</span>

                <strong>{course.capstoneProject.title}</strong>
              </div>

              <p className={styles.reviewDesc}>
                {course.capstoneProject.description}
              </p>

              <div className={styles.reviewRow}>
                <span>Submission</span>

                <strong>{course.capstoneProject.submissionRequirements}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================
          PUBLISH CHECKLIST
      ========================================= */}

      <div className={styles.reviewSection} style={{ marginTop: 20 }}>
        <h4>✅ Publish Readiness</h4>

        <div className={styles.checklist}>
          {checklist.map((item, index) => (
            <div key={index} className={styles.checkItem}>
              <span
                className={`${styles.checkIcon} ${
                  item.ok ? styles.checkOk : styles.checkMissing
                }`}
              >
                {item.ok ? "✓" : "!"}
              </span>

              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
          NAV
      ========================================= */}

      <div className={styles.wizardNav}>
        <div></div>

        <div className={styles.wizardNavRight}>
          <button
            className={ready ? styles.primaryBtn : styles.secondaryBtn}
            onClick={onNext}
          >
            {ready ? "Proceed to Create →" : "View Checklist →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;

import { useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Link, useParams } from "react-router-dom";

import { fetchCourseLearningData } from "../../features/student/studentCourseThunks";

import styles from "./Courselearn.module.css";

const CourseLearn = () => {
  const dispatch = useDispatch();

  const { courseId } = useParams();

  const { learningData, learningLoading, error } = useSelector(
    (state) => state.studentCourse,
  );

  useEffect(() => {
    if (!courseId) return;

    dispatch(fetchCourseLearningData(courseId));
  }, [dispatch, courseId]);

  const continueLesson = useMemo(() => {
    if (!learningData) return null;

    const lessons = learningData.lessons || [];

    if (lessons.length === 0) return null;

    const lastId = learningData.progress?.lastAccessedLessonId;
    const last =
      lastId && lessons.find((l) => String(l._id) === String(lastId));

    if (last && !last.isCompleted) return last;

    return lessons.find((l) => l.isUnlocked && !l.isCompleted) || null;
  }, [learningData]);

  if (learningLoading && !learningData) {
    return (
      <div className={styles.courseState}>
        <div className={styles.loader} />

        <p>Loading course...</p>
      </div>
    );
  }

  if (error && !learningData) {
    return (
      <div className={styles.courseState}>
        <p>{error}</p>
      </div>
    );
  }

  if (!learningData) {
    return null;
  }

  const course = learningData.course;

  const progress = learningData.progress || {};

  const lessons = learningData.lessons || [];

  const completedCount = progress.completedLessons || 0;

  const totalCount = progress.totalLessons || lessons.length;

  const percent = Math.round(progress.progressPercentage || 0);

  const quizzesPassed = lessons.filter((l) => l.isQuizPassed).length;

  const remainingCount = Math.max(totalCount - completedCount, 0);

  const courseDone = progress.isCompleted || percent >= 100;

  return (
    <div className={styles.learnPage}>
      {/* =========================
          COURSE HEADER
      ========================= */}

      <header className={styles.learnHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <span className={styles.sectionEyebrow}>📚 Course Learning</span>

            <h1>{course.title}</h1>

            <p>{course.description}</p>

            <div className={styles.metaChips}>
              {course.category && (
                <span className={styles.metaChip}>🏷️ {course.category}</span>
              )}

              <span className={styles.metaChip}>▤ {totalCount} Lessons</span>

              {typeof course.lessonQuizPassingPercentage === "number" && (
                <span className={styles.metaChip}>
                  🎯 {course.lessonQuizPassingPercentage}% to pass each quiz
                </span>
              )}

              {course.quizTimeLimitMinutes ? (
                <span className={styles.metaChip}>
                  ⏱️ {course.quizTimeLimitMinutes} min final quiz
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles.headerMedia}>
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} />
            ) : (
              <div className={styles.mediaFallback}>📚</div>
            )}
          </div>
        </div>
      </header>

      {/* =========================
          PROGRESS
      ========================= */}

      <section className={styles.progressCard}>
        <div className={styles.progressTop}>
          <div>
            <span>YOUR PROGRESS</span>

            <h2>{percent}% Complete</h2>
          </div>

          <div className={styles.progressActions}>
            {continueLesson && (
              <Link
                to={`/student/courses/${courseId}/learn/${continueLesson._id}`}
                className={styles.continueBtn}
              >
                {completedCount > 0 ? "Continue Learning" : "Start Learning"}→
              </Link>
            )}

            <div className={styles.lessonCounter}>
              {completedCount}/{totalCount} Lessons
            </div>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${percent}%`,
            }}
          />
        </div>

        <div className={styles.progressStats}>
          <div className={styles.statItem}>
            <strong>{completedCount}</strong>

            <span>Completed</span>
          </div>

          <div className={styles.statItem}>
            <strong>{remainingCount}</strong>

            <span>Remaining</span>
          </div>

          <div className={styles.statItem}>
            <strong>{quizzesPassed}</strong>

            <span>Quizzes Passed</span>
          </div>

          <div
            className={`${styles.statItem} ${
              progress.isQuizPassed ? styles.statSuccess : ""
            }`}
          >
            <strong>
              {progress.isQuizPassed
                ? `${progress.quizScore ?? 0}%`
                : courseDone
                  ? "Pending"
                  : "🔒 Locked"}
            </strong>

            <span>Final Quiz</span>
          </div>
        </div>
      </section>

      {/* =========================
          LESSONS
      ========================= */}

      <section className={styles.lessonsSection}>
        <div className={styles.lessonsHeader}>
          <div>
            <span className={styles.sectionEyebrow}>Course Content</span>

            <h2>Lessons</h2>
          </div>

          <span>
            ✓ {completedCount} of {totalCount} done
          </span>
        </div>

        <div className={styles.lessonList}>
          {lessons.map((lesson) => {
            const isLocked = !lesson.isUnlocked;

            return (
              <div
                key={lesson._id}
                className={`${styles.lessonCard} ${
                  isLocked ? styles.lessonLocked : ""
                }`}
              >
                {/* NUMBER */}

                <div className={styles.lessonNumber}>
                  {lesson.isCompleted ? "✓" : lesson.lessonNumber}
                </div>

                {/* INFO */}

                <div className={styles.lessonInfo}>
                  <h3>
                    {isLocked && "🔒 "}

                    {lesson.title}
                  </h3>

                  <p>
                    {lesson.isCompleted
                      ? lesson.isQuizPassed
                        ? `Completed · Quiz passed (${lesson.quizScore}%)`
                        : "Completed"
                      : lesson.isUnlocked
                        ? lesson.quizAttempts > 0
                          ? `Attempted ${lesson.quizAttempts} time${
                              lesson.quizAttempts > 1 ? "s" : ""
                            } · keep going`
                          : "Ready to learn"
                        : "Complete previous lesson to unlock"}
                  </p>

                  {(lesson.mcqCount > 0 || lesson.isQuizPassed || isLocked) && (
                    <div className={styles.lessonChips}>
                      {!isLocked && lesson.mcqCount > 0 && (
                        <span className={styles.chip}>
                          ▤ {lesson.mcqCount} MCQs
                        </span>
                      )}

                      {!isLocked && lesson.isQuizPassed && (
                        <span
                          className={`${styles.chip} ${styles.chipSuccess}`}
                        >
                          ✓ Quiz Passed
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* BUTTON */}

                {lesson.isUnlocked ? (
                  <Link
                    to={`/student/courses/${courseId}/learn/${lesson._id}`}
                    className={styles.viewLessonBtn}
                  >
                    {lesson.isCompleted ? "Review Lesson" : "View Lesson"}→
                  </Link>
                ) : (
                  <button type="button" disabled className={styles.lockedBtn}>
                    🔒 Locked
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================
          FINAL ASSESSMENT
      ========================= */}

      <section
        className={`${styles.finalCard} ${
          courseDone ? "" : styles.finalLocked
        }`}
      >
        <div>
          <span className={styles.sectionEyebrow}>
            {courseDone ? "🎉 COURSE COMPLETION" : "🔒 FINAL ASSESSMENT"}
          </span>

          <h2>Final Quiz &amp; Capstone</h2>

          {courseDone ? (
            <p>
              You completed all lessons. You can now take the final assessment.
            </p>
          ) : (
            <p>
              Complete all remaining lessons ({remainingCount} left) to unlock
              the final quiz and capstone project.
            </p>
          )}
        </div>

        {courseDone ? (
          <Link
            to={`/student/courses/${courseId}/final`}
            className={styles.viewLessonBtn}
          >
            Continue →
          </Link>
        ) : (
          <button type="button" disabled className={styles.lockedBtn}>
            🔒 Locked
          </button>
        )}
      </section>
    </div>
  );
};

export default CourseLearn;

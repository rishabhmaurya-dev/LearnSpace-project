import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  fetchCourseLearningData,
  fetchFinalQuiz,
  submitFinalQuiz,
  fetchMyCapstoneSubmission,
  submitCapstone,
} from "../../features/student/studentCourseThunks";

import {
  clearFinalQuiz,
  clearStudentCourseError,
  clearStudentCourseSuccess,
} from "../../features/student/studentCourseSlice";

import styles from "./FinalAssessment.module.css";

const FinalAssessment = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();

  const {
    learningData,
    learningLoading,
    finalQuiz,
    finalQuizResult,
    capstoneSubmission,
    submitting,
    error,
    success,
    message,
  } = useSelector((state) => state.studentCourse);

  /* =====================================================
     LOCAL STATE
  ===================================================== */
  const [finalAnswers, setFinalAnswers] = useState({});
  const [capForm, setCapForm] = useState({
    githubRepoUrl: "",
    liveDemoUrl: "",
  });

  /* =====================================================
     LOAD DATA
  ===================================================== */
  useEffect(() => {
    if (!courseId) return;

    dispatch(fetchCourseLearningData(courseId));
    dispatch(fetchMyCapstoneSubmission(courseId));

    return () => {
      dispatch(clearFinalQuiz());
    };
  }, [dispatch, courseId]);

  /* =====================================================
     NOTIFICATIONS (SUCCESS & ERROR)
  ===================================================== */
  useEffect(() => {
    if (!success) return;

    toast.success(message || "Operation successful", {
      duration: 2500,
    });

    const timer = setTimeout(() => {
      dispatch(clearStudentCourseSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      dispatch(clearStudentCourseError());
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  /* =====================================================
     FINAL QUIZ HANDLERS
  ===================================================== */
  const openFinalQuiz = () => {
    setFinalAnswers({});
    dispatch(fetchFinalQuiz(courseId));
  };

  const handleFinalAnswer = (questionId, selectedIndex) => {
    setFinalAnswers((prev) => ({
      ...prev,
      [questionId]: selectedIndex,
    }));
  };

  const handleSubmitFinalQuiz = () => {
    if (!finalQuiz) return;

    const answers = Object.entries(finalAnswers).map(
      ([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex: Number(selectedIndex),
      }),
    );

    dispatch(
      submitFinalQuiz({
        courseId,
        answers,
      }),
    );
  };

  const handleRetakeFinalQuiz = () => {
    dispatch(clearFinalQuiz());
    setFinalAnswers({});
    dispatch(fetchFinalQuiz(courseId));
  };

  /* =====================================================
     CAPSTONE HANDLERS
  ===================================================== */
  const handleCapstoneChange = (event) => {
    const { name, value } = event.target;
    setCapForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitCapstone = () => {
    if (!capForm.githubRepoUrl.trim() || !capForm.liveDemoUrl.trim()) {
      toast.error("Please enter GitHub repository URL and Live Demo URL");
      return;
    }

    dispatch(
      submitCapstone({
        courseId,
        githubRepoUrl: capForm.githubRepoUrl,
        liveDemoUrl: capForm.liveDemoUrl,
      }),
    );
  };

  /* =====================================================
     HELPER
  ===================================================== */
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  /* =====================================================
     LOADING & NOT FOUND STATES
  ===================================================== */
  if (learningLoading && !learningData) {
    return (
      <div className={styles.pageState}>
        <div className={styles.loader} />
        <p>Loading final assessment...</p>
      </div>
    );
  }

  if (!learningData) {
    return (
      <div className={styles.pageState}>
        <h2>Course not found</h2>
        <Link to="/student/courses" className={styles.backButton}>
          ← Back to My Courses
        </Link>
      </div>
    );
  }

  /* =====================================================
     DERIVED DYNAMIC DATA (ORDER FIXED TO PREVENT CRASH)
  ===================================================== */
  const course = learningData.course || {};
  const progress = learningData.progress || {};
  const lessons = Array.isArray(learningData.lessons)
    ? learningData.lessons
    : [];

  const totalLessons = Number(progress.totalLessons ?? lessons.length ?? 0);
  const completedLessons = Array.isArray(progress.completedLessons)
    ? progress.completedLessons.length
    : Number(progress.completedLessons || 0);

  const progressPct = Math.min(
    100,
    Math.round(Number(progress.progressPercentage || 0)),
  );

  const passingPercentage = Number(course.passingPercentage || 0);

  // Status & Lock Flags (Defined FIRST before stat cards/checklists)
  const courseCompleted =
    Boolean(progress.isCompleted) ||
    Number(progress.progressPercentage || 0) >= 100;
  const finalQuizPassed = Boolean(progress.isQuizPassed);
  const capstoneUnlocked = Boolean(progress.isCapstoneUnlocked);

  const capstoneStatus = capstoneSubmission?.status || null;
  const capstoneApproved = capstoneStatus === "APPROVED";
  const capstoneRejected = capstoneStatus === "REJECTED";
  const certificateIssued = Boolean(capstoneSubmission?.certificateIssued);

  /* =====================================================
     STATS STRIP & CHECKLIST DATA (NOW SAFE)
  ===================================================== */
  const statCards = [
    {
      icon: "📚",
      value: `${completedLessons}/${totalLessons}`,
      label: "Lessons Completed",
    },
    {
      icon: "📈",
      value: `${progressPct}%`,
      label: "Course Progress",
    },
    {
      icon: "🧠",
      value: finalQuizPassed ? `${Number(progress.quizScore || 0)}%` : "—",
      label: finalQuizPassed ? "Best Quiz Score" : "Quiz Not Attempted",
    },
    {
      icon: "🎯",
      value:
        capstoneStatus || (capstoneUnlocked ? "Ready to Submit" : "Locked"),
      label: "Capstone Status",
    },
  ];

  const capstoneStepDetail = capstoneApproved
    ? "Project approved by admin"
    : capstoneRejected
      ? "Revise and resubmit your project"
      : capstoneStatus === "PENDING"
        ? "Under admin review"
        : capstoneUnlocked
          ? "Submit your capstone project"
          : "Unlocks after passing the final quiz";

  const checklistItems = [
    {
      key: "lessons",
      icon: "📚",
      label: "Complete all lessons",
      detail: `${completedLessons} of ${totalLessons} lessons completed`,
      done: courseCompleted,
    },
    {
      key: "quiz",
      icon: "🧠",
      label: "Pass the final quiz",
      detail: finalQuizPassed
        ? `Scored ${Number(progress.quizScore || 0)}% (passing: ${passingPercentage}%)`
        : `Score at least ${passingPercentage}% to pass`,
      done: finalQuizPassed,
    },
    {
      key: "capstone",
      icon: "🎯",
      label: "Get capstone approved",
      detail: capstoneStepDetail,
      done: capstoneApproved,
    },
  ];

  const completedSteps = checklistItems.filter((item) => item.done).length;

  return (
    <div className={styles.finalAssessmentPage}>
      {/* ================= HEADER ================= */}
      <header className={styles.assessmentHeader}>
        <div>
          <span className={styles.eyebrow}>COURSE COMPLETION</span>
          <h1>Final Assessment</h1>
          <p>{course.title}</p>

          {course.category && (
            <div className={styles.headerChips}>
              <span className={styles.headerChip}>🏷 {course.category}</span>
            </div>
          )}

          <div className={styles.headerProgress}>
            <div className={styles.headerProgressBar}>
              <div
                className={styles.headerProgressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={styles.headerProgressText}>
              {progressPct}% complete
            </span>
          </div>
        </div>

        <Link
          to={`/student/courses/${courseId}/learn`}
          className={styles.backButton}
        >
          ← Back to Course
        </Link>
      </header>

      {/* ================= LOCK OR ACTIVE SECTIONS ================= */}
      {!courseCompleted ? (
        <section className={styles.lockedCard}>
          <div className={styles.lockIcon}>🔒</div>
          <h2>Complete all lessons first</h2>
          <p>
            Finish every lesson and pass the required lesson quizzes to unlock
            the final quiz.
          </p>
          <Link
            to={`/student/courses/${courseId}/learn`}
            className={styles.primaryButton}
          >
            Continue Learning →
          </Link>
        </section>
      ) : (
        <>
          {/* STATS STRIP */}
          <section className={styles.statsStrip}>
            {statCards.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statInfo}>
                  <span
                    className={`${styles.statValue} ${
                      stat.label === "Capstone Status"
                        ? capstoneApproved
                          ? styles.statApproved
                          : capstoneRejected
                            ? styles.statRejected
                            : styles.statPending
                        : ""
                    }`}
                  >
                    {stat.value}
                  </span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </section>

          {/* CERTIFICATION READINESS */}
          <section className={styles.assessmentCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>CERTIFICATION PATH</span>
                <h2>🏅 Certification Readiness</h2>
                <p>
                  Complete each step to earn the <strong>{course.title}</strong>{" "}
                  credential.
                </p>
              </div>

              <span className={styles.stepCounter}>
                {completedSteps}/{checklistItems.length} steps done
              </span>
            </div>

            <ol className={styles.checklist}>
              {checklistItems.map((item) => (
                <li
                  key={item.key}
                  className={`${styles.checklistItem} ${
                    item.done ? styles.checklistDone : ""
                  }`}
                >
                  <div className={styles.checklistIcon}>
                    {item.done ? "✓" : item.icon}
                  </div>

                  <div className={styles.checklistText}>
                    <h3>{item.label}</h3>
                    <p>{item.detail}</p>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      item.done ? styles.approved : styles.pending
                    }`}
                  >
                    {item.done ? "DONE" : "PENDING"}
                  </span>
                </li>
              ))}
            </ol>

            {(certificateIssued || (capstoneApproved && finalQuizPassed)) && (
              <div className={styles.certReadyBanner}>
                🎓 All requirements met!
                {certificateIssued
                  ? " Your certificate has been issued."
                  : " Your certificate will be generated after admin approval."}
              </div>
            )}
          </section>

          {/* FINAL QUIZ */}
          <section className={styles.assessmentCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>FINAL QUIZ</span>
                <h2>🧠 Final Course Quiz</h2>
                <p>
                  {finalQuizPassed
                    ? `Passed with ${Number(progress.quizScore || 0)}% — passing score is ${passingPercentage}%.`
                    : `Test your knowledge of the complete course. You need at least ${passingPercentage}% to pass.`}
                </p>
              </div>

              {finalQuizPassed && (
                <span className={styles.successBadge}>✓ Passed</span>
              )}
            </div>

            {/* QUIZ TOGGLE BUTTON */}
            {!finalQuiz || finalQuiz.course?._id !== courseId ? (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={capstoneApproved}
                onClick={openFinalQuiz}
              >
                {finalQuizPassed ? "Retake Final Quiz" : "Start Final Quiz"} →
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => dispatch(clearFinalQuiz())}
              >
                Close Quiz
              </button>
            )}

            {/* QUIZ FORM VIEW */}
            {finalQuiz && finalQuiz.course?._id === courseId && (
              <FinalQuizView
                quiz={finalQuiz}
                answers={finalAnswers}
                result={finalQuizResult}
                submitting={submitting}
                timeLimitMinutes={course.quizTimeLimitMinutes}
                onAnswer={handleFinalAnswer}
                onSubmit={handleSubmitFinalQuiz}
                onRetake={handleRetakeFinalQuiz}
              />
            )}
          </section>

          {/* CAPSTONE PROJECT */}
          <section className={styles.assessmentCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>FINAL PROJECT</span>
                <h2>
                  🎯 {course.capstoneProject?.title || "Capstone Project"}
                </h2>
                <p>
                  {capstoneApproved
                    ? "Your project has been approved. Great work!"
                    : capstoneRejected
                      ? "Your submission needs revisions. Check the admin feedback below."
                      : capstoneStatus === "PENDING"
                        ? "Your submission is under admin review."
                        : capstoneUnlocked
                          ? "Submit your project for admin review."
                          : "Pass the final quiz to unlock capstone submission."}
                </p>
              </div>

              {capstoneSubmission && (
                <span
                  className={`${styles.statusBadge} ${
                    capstoneApproved
                      ? styles.approved
                      : capstoneRejected
                        ? styles.rejected
                        : styles.pending
                  }`}
                >
                  {capstoneSubmission.status}
                </span>
              )}
            </div>

            {/* PROJECT BRIEF */}
            {(course.capstoneProject?.description ||
              course.capstoneProject?.submissionRequirements) && (
              <div className={styles.projectBrief}>
                {course.capstoneProject?.description && (
                  <div>
                    <h3>Project Description</h3>
                    <p>{course.capstoneProject.description}</p>
                  </div>
                )}
                {course.capstoneProject?.submissionRequirements && (
                  <div className={styles.requirements}>
                    <h3>📋 Submission Requirements</h3>
                    <p>{course.capstoneProject.submissionRequirements}</p>
                  </div>
                )}
              </div>
            )}

            {/* CAPSTONE FORM / LOCKED */}
            {!capstoneUnlocked ? (
              <div className={styles.capstoneLocked}>
                <div>🔒</div>
                <h3>Capstone Locked</h3>
                <p>Pass the final quiz to unlock project submission.</p>
              </div>
            ) : (
              <div className={styles.capstoneForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="githubRepoUrl">GitHub Repository URL</label>
                  <input
                    id="githubRepoUrl"
                    type="url"
                    name="githubRepoUrl"
                    placeholder="https://github.com/username/project"
                    value={capForm.githubRepoUrl}
                    onChange={handleCapstoneChange}
                    disabled={capstoneApproved}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="liveDemoUrl">Live Demo URL</label>
                  <input
                    id="liveDemoUrl"
                    type="url"
                    name="liveDemoUrl"
                    placeholder="https://your-project.vercel.app"
                    value={capForm.liveDemoUrl}
                    onChange={handleCapstoneChange}
                    disabled={capstoneApproved}
                  />
                </div>

                <button
                  type="button"
                  className={styles.successButton}
                  disabled={submitting || capstoneApproved}
                  onClick={handleSubmitCapstone}
                >
                  {submitting
                    ? "Submitting..."
                    : capstoneApproved
                      ? "Capstone Approved ✓"
                      : capstoneStatus === "PENDING"
                        ? "Submitted for Review"
                        : capstoneRejected
                          ? "Resubmit Capstone"
                          : "Submit Capstone"}
                </button>
              </div>
            )}

            {/* SUBMISSION SUMMARY */}
            {capstoneSubmission && (
              <div className={styles.submissionSummary}>
                <h3>📤 Submission Details</h3>
                <div className={styles.summaryGrid}>
                  <div>
                    <span>GitHub Repository</span>
                    <a
                      href={capstoneSubmission.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {capstoneSubmission.githubRepoUrl}
                    </a>
                  </div>

                  <div>
                    <span>Live Demo</span>
                    <a
                      href={capstoneSubmission.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {capstoneSubmission.liveDemoUrl}
                    </a>
                  </div>

                  <div>
                    <span>Submitted On</span>
                    <p>{formatDate(capstoneSubmission.createdAt)}</p>
                  </div>

                  {capstoneSubmission.reviewedAt && (
                    <div>
                      <span>Reviewed On</span>
                      <p>{formatDate(capstoneSubmission.reviewedAt)}</p>
                    </div>
                  )}

                  {Number(capstoneSubmission.submissionVersion || 1) > 1 && (
                    <div>
                      <span>Version</span>
                      <p>v{capstoneSubmission.submissionVersion}</p>
                    </div>
                  )}
                </div>

                {capstoneSubmission.adminFeedback && (
                  <div
                    className={`${styles.feedbackBox} ${
                      capstoneRejected ? styles.feedbackRejected : ""
                    }`}
                  >
                    <strong>
                      💬 Admin Feedback
                      {capstoneRejected ? " (resubmission required)" : ""}
                    </strong>
                    <p>{capstoneSubmission.adminFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* LESSON PERFORMANCE RECAP */}
          {lessons.length > 0 && (
            <section className={styles.assessmentCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.cardEyebrow}>LESSON RECAP</span>
                  <h2>📚 Lesson Performance</h2>
                  <p>
                    Review your quiz performance across every lesson of the
                    course.
                  </p>
                </div>

                <span className={styles.stepCounter}>
                  {completedLessons}/{totalLessons} completed
                </span>
              </div>

              <div className={styles.recapList}>
                {lessons.map((lesson) => {
                  const passed = lesson.isQuizPassed === true;
                  const locked = !lesson.isUnlocked && !lesson.isCompleted;

                  return (
                    <div key={lesson._id} className={styles.recapRow}>
                      <div className={styles.recapIndex}>
                        {lesson.lessonNumber}
                      </div>
                      <div className={styles.recapInfo}>
                        <h4>{lesson.title}</h4>
                        {lesson.topicHeading && <p>{lesson.topicHeading}</p>}
                      </div>
                      <div className={styles.recapMeta}>
                        {passed ? (
                          <span
                            className={`${styles.statusBadge} ${styles.approved}`}
                          >
                            ✓ {Number(lesson.quizScore || 0)}%
                          </span>
                        ) : locked ? (
                          <span
                            className={`${styles.statusBadge} ${styles.lockedBadge}`}
                          >
                            🔒 Locked
                          </span>
                        ) : (
                          <span
                            className={`${styles.statusBadge} ${styles.pending}`}
                          >
                            In Progress
                          </span>
                        )}

                        {Number(lesson.quizAttempts || 0) > 0 && (
                          <small>
                            {lesson.quizAttempts}{" "}
                            {lesson.quizAttempts === 1 ? "attempt" : "attempts"}
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

/* =====================================================
   FINAL QUIZ COMPONENT
===================================================== */
const FinalQuizView = ({
  quiz,
  answers,
  result,
  submitting,
  timeLimitMinutes,
  onAnswer,
  onSubmit,
  onRetake,
}) => {
  const questions = quiz.questions || [];
  const passed = result?.result?.passed;
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (question) => answers[question._id] !== undefined,
  ).length;

  const answeredPct =
    totalQuestions === 0
      ? 0
      : Math.round((answeredCount / totalQuestions) * 100);

  if (result) {
    return (
      <div className={styles.quizResult}>
        <div
          className={`${styles.resultBox} ${
            passed ? styles.resultPassed : styles.resultFailed
          }`}
        >
          <div>
            <h3>{passed ? "🎉 Final Quiz Passed!" : "❌ Quiz Not Passed"}</h3>
            <p>
              Score: {result.result?.correctAnswers}/
              {result.result?.totalQuestions} ({result.result?.percentage}%)
            </p>
            <small>Passing Score: {result.result?.passingPercentage}%</small>
          </div>
        </div>

        {!passed && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onRetake}
          >
            Retake Final Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.quizArea}>
      <div className={styles.quizMetaBar}>
        <span>🧾 {totalQuestions} Questions</span>
        <span>
          📝 Answered {answeredCount}/{totalQuestions}
        </span>
        {timeLimitMinutes && <span>⏱ {timeLimitMinutes} min limit</span>}
      </div>

      <div className={styles.quizMetaProgress}>
        <div
          className={styles.quizMetaProgressFill}
          style={{ width: `${answeredPct}%` }}
        />
      </div>

      {answeredCount < totalQuestions && (
        <p className={styles.quizMetaHint}>
          Answer all questions before submitting.
        </p>
      )}

      {questions.map((question, questionIndex) => (
        <div key={question._id} className={styles.quizQuestion}>
          <div className={styles.questionNumber}>
            Question {questionIndex + 1} of {totalQuestions}
            {answers[question._id] !== undefined && (
              <span className={styles.answeredTick}>✓</span>
            )}
          </div>

          <h3>{question.question}</h3>

          <div className={styles.optionsList}>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question._id] === optionIndex;

              return (
                <label
                  key={optionIndex}
                  className={`${styles.quizOption} ${
                    selected ? styles.selected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    checked={selected}
                    onChange={() => onAnswer(question._id, optionIndex)}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        className={styles.successButton}
        disabled={submitting || totalQuestions === 0}
        onClick={onSubmit}
      >
        {submitting
          ? "Submitting..."
          : `Submit Final Quiz (${answeredCount}/${totalQuestions})`}
      </button>
    </div>
  );
};

export default FinalAssessment;

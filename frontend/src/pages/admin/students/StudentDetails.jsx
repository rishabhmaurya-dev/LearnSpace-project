import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { formatDate } from "../capstones/CapstoneReview";
import {
  fetchStudentDetails,
  updateStudentStatus,
  updateStudentReputation,
} from "../../../features/admin/student/adminStudentThunks";

import {
  clearStudentError,
  clearStudentSuccess,
} from "../../../features/admin/student/adminStudentSlice";

import {
  approveCapstone,
  rejectCapstone,
} from "../../../features/admin/capstone/adminCapstoneThunks";

import styles from "./StudentDetails.module.css";
import { GradualSpacing } from "../../../animation/Text";

const StudentDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentId } = useParams();

  const {
    selectedStudent,
    summary,
    courseProgress = [],
    quizAttempts = [],
    capstoneSubmissions = [],
    detailsLoading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminStudent);

  const capstone = useSelector((state) => state.adminCapstone);

  /* =====================================================
      LOCAL STATE
  ===================================================== */
  const [activeTab, setActiveTab] = useState("overview");

  const [showReputationModal, setShowReputationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVE");
  const [reviewFeedback, setReviewFeedback] = useState("");

  const [repPoints, setRepPoints] = useState("");
  const [repOperation, setRepOperation] = useState("ADD");
  const [repReason, setRepReason] = useState("");

  /* =====================================================
      FETCH
  ===================================================== */
  useEffect(() => {
    if (studentId) {
      dispatch(fetchStudentDetails(studentId));
    }
  }, [dispatch, studentId]);

  /* =====================================================
      TOASTS
  ===================================================== */
  useEffect(() => {
    if (!success) return;
    toast.success(message);
    const timer = setTimeout(() => {
      dispatch(clearStudentSuccess());
    }, 2500);
    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    const timer = setTimeout(() => {
      dispatch(clearStudentError());
    }, 3500);
    return () => clearTimeout(timer);
  }, [error, dispatch]);

  /* =====================================================
      STATUS
  ===================================================== */
  const handleToggleStatus = () => {
    if (!selectedStudent) return;
    dispatch(
      updateStudentStatus({
        studentId: selectedStudent._id,
        isActive: !selectedStudent.isActive,
      }),
    );
  };

  /* =====================================================
      REPUTATION
  ===================================================== */
  const openReputationModal = () => {
    setRepPoints("");
    setRepOperation("ADD");
    setRepReason("");
    setShowReputationModal(true);
  };

  const handleReputationSubmit = () => {
    const points = Number(repPoints);
    if (!points || points <= 0) return;

    dispatch(
      updateStudentReputation({
        studentId,
        points,
        operation: repOperation,
        reason: repReason,
      }),
    );
    setShowReputationModal(false);
  };

  /* =====================================================
      CAPSTONE REVIEW
  ===================================================== */
  const openReviewModal = (submission, action) => {
    setReviewTarget(submission);
    setReviewAction(action);
    setReviewFeedback(submission.adminFeedback || "");
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;

    if (reviewAction === "APPROVE") {
      await dispatch(
        approveCapstone({
          submissionId: reviewTarget._id,
          feedback: reviewFeedback,
        }),
      );
    } else {
      if (!reviewFeedback.trim()) return;
      await dispatch(
        rejectCapstone({
          submissionId: reviewTarget._id,
          feedback: reviewFeedback,
        }),
      );
    }

    setShowReviewModal(false);
    setReviewTarget(null);
    setReviewFeedback("");
    dispatch(fetchStudentDetails(studentId));
  };

  /* =====================================================
      LOADING & ERROR STATES
  ===================================================== */
  if (detailsLoading && !selectedStudent) {
    return (
      <div className={styles.statePage}>
        <div className={styles.loader}>
          <div className={styles.loaderRing}></div>
          <span>Loading student profile...</span>
        </div>
      </div>
    );
  }

  if (error && !selectedStudent) {
    return (
      <div className={styles.statePage}>
        <div className={styles.stateBox}>
          <span className={styles.stateIcon}>⚠️</span>
          <h3>Unable to load student</h3>
          <p>{error}</p>
          <button className={styles.primaryBtn} onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className={styles.statePage}>
        <div className={styles.stateBox}>
          <span className={styles.stateIcon}>👤</span>
          <h3>Student not found</h3>
          <button className={styles.primaryBtn} onClick={() => navigate(-1)}>
            ← Back to Students
          </button>
        </div>
      </div>
    );
  }

  const profile = selectedStudent.profile || {};

  const tabs = [
    { key: "overview", label: "Overview", icon: "👤" },
    {
      key: "progress",
      label: "Course Progress",
      icon: "📚",
      count: courseProgress.length,
    },
    {
      key: "quizzes",
      label: "Quiz History",
      icon: "📝",
      count: quizAttempts.length,
    },
    {
      key: "capstones",
      label: "Capstones",
      icon: "🎯",
      count: capstoneSubmissions.length,
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.container}>
        {/* TOP NAVIGATION */}
        <div className={`${styles.topNavigation} ${styles.animateFadeIn}`}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span>←</span> Back to Directory
          </button>

          <nav className={styles.breadcrumb}>
            <span>Admin</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span>Students</span>
            <span className={styles.breadcrumbDivider}>/</span>
            <span className={styles.breadcrumbActive}>
              {selectedStudent.name}
            </span>
          </nav>
        </div>

        {/* HERO CARD CONTAINER */}
        <section className={`${styles.heroCard} ${styles.animateSlideDown}`}>
          <div className={styles.heroGlow} />

          <div className={styles.heroInner}>
            <div className={styles.heroTop}>
              <div className={styles.profileIdentity}>
                <div className={styles.heroAvatarWrapper}>
                  <div className={styles.heroAvatar}>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={selectedStudent.name} />
                    ) : (
                      <span>
                        {selectedStudent.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <span
                    className={`${styles.onlineDot} ${
                      selectedStudent.isActive ? styles.online : styles.offline
                    }`}
                  />
                </div>

                <div className={styles.heroInfo}>
                  <div className={styles.nameLine}>
                    <h1>
                      <GradualSpacing text={selectedStudent.name} />
                    </h1>
                    <span
                      className={`${styles.statusBadge} ${
                        selectedStudent.isActive
                          ? styles.statusActive
                          : styles.statusBlocked
                      }`}
                    >
                      <span className={styles.statusDot} />
                      {selectedStudent.isActive ? "Active" : "Blocked"}
                    </span>
                  </div>

                  <p className={styles.heroEmail}>{selectedStudent.email}</p>

                  <div className={styles.heroMeta}>
                    <span className={styles.metaChip}>
                      📅 Joined {formatDate(selectedStudent.createdAt)}
                    </span>
                    <span className={styles.metaChip}>
                      🛡️ {selectedStudent.role || "STUDENT"}
                    </span>
                    {selectedStudent.leaderboardRank && (
                      <span className={`${styles.metaChip} ${styles.rankChip}`}>
                        🏆 Rank #{selectedStudent.leaderboardRank}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.heroActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={openReputationModal}
                >
                  <span>＋</span> Reputation
                </button>
                <button
                  className={
                    selectedStudent.isActive
                      ? styles.blockBtn
                      : styles.activateBtn
                  }
                  disabled={operationLoading}
                  onClick={handleToggleStatus}
                >
                  {selectedStudent.isActive
                    ? "Block Account"
                    : "Activate Account"}
                </button>
              </div>
            </div>

            {/* HERO STATS BAR */}
            <div className={styles.heroStatsGrid}>
              <HeroStat
                icon="⭐"
                label="Reputation"
                value={profile.reputationPoints || 0}
                index={0}
              />
              <HeroStat
                icon="🏅"
                label="Verified Skills"
                value={profile.verifiedSkills?.length || 0}
                index={1}
              />
              <HeroStat
                icon="📚"
                label="Courses Finished"
                value={profile.completedCoursesCount || 0}
                index={2}
              />
              <HeroStat
                icon="⏳"
                label="Pending Reviews"
                value={summary?.pendingCapstones || 0}
                tone={summary?.pendingCapstones > 0 ? "warning" : ""}
                index={3}
              />
            </div>

            {/* SKILLS & BADGES ROW */}
            <div className={styles.profileShowcaseGrid}>
              <div className={styles.showcaseCard}>
                <div className={styles.showcaseHeader}>
                  <span className={styles.showcaseIcon}>⚡</span>
                  <h4>Verified Skills</h4>
                </div>
                <div className={styles.skillTags}>
                  {profile.verifiedSkills?.length ? (
                    profile.verifiedSkills.map((skillItem, i) => (
                      <span
                        key={skillItem}
                        className={`${styles.skillTag} ${styles.animateScale}`}
                        style={{ "--card-index": i }}
                      >
                        {skillItem}
                      </span>
                    ))
                  ) : (
                    <span className={styles.emptyInlineText}>
                      No verified skills found
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE KPI SUMMARY METRICS */}
        <section className={styles.summarySection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Performance Highlights</h3>
              <p>Overall student engagement and assessment records</p>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <SummaryCard
              label="Enrolled Courses"
              value={summary?.totalCourses || 0}
              icon="📚"
              index={0}
            />
            <SummaryCard
              label="Completed Courses"
              value={summary?.completedCourses || 0}
              icon="✅"
              index={1}
            />
            <SummaryCard
              label="Quiz Attempts"
              value={summary?.totalQuizAttempts || 0}
              icon="📝"
              index={2}
            />
            <SummaryCard
              label="Quizzes Passed"
              value={summary?.passedQuizzes || 0}
              icon="🎯"
              index={3}
            />
            <SummaryCard
              label="Capstones Total"
              value={summary?.totalCapstoneSubmissions || 0}
              icon="🚀"
              index={4}
            />
            <SummaryCard
              label="Pending Capstones"
              value={summary?.pendingCapstones || 0}
              icon="⏳"
              tone={summary?.pendingCapstones > 0 ? "warning" : ""}
              index={5}
            />
          </div>
        </section>

        {/* CONTENT TABS */}
        <section className={styles.tabsSection}>
          <div className={styles.tabBar}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tabBtn} ${activeTab === tab.key ? styles.activeTabBtn : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={styles.tabCounter}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div
            key={activeTab}
            className={`${styles.tabBody} ${styles.tabPaneEnter}`}
          >
            {activeTab === "overview" && (
              <OverviewTab profile={profile} student={selectedStudent} />
            )}

            {activeTab === "progress" && (
              <CourseProgressTab progress={courseProgress} />
            )}

            {activeTab === "quizzes" && (
              <QuizHistoryTab attempts={quizAttempts} />
            )}

            {activeTab === "capstones" && (
              <CapstonesTab
                submissions={capstoneSubmissions}
                onReview={openReviewModal}
              />
            )}
          </div>
        </section>

        {/* MODAL: REPUTATION */}
        {showReputationModal && (
          <Modal
            title="Adjust Reputation"
            icon="⭐"
            onClose={() => setShowReputationModal(false)}
          >
            <div className={styles.formGroup}>
              <label>Operation Type</label>
              <select
                className={styles.inputField}
                value={repOperation}
                onChange={(e) => setRepOperation(e.target.value)}
              >
                <option value="ADD">Add Points (+)</option>
                <option value="SUBTRACT">Subtract Points (-)</option>
                <option value="SET">Set Explicit Value (=)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Points</label>
              <input
                className={styles.inputField}
                type="number"
                min="1"
                placeholder="Enter points value"
                value={repPoints}
                onChange={(e) => setRepPoints(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Reason / Note</label>
              <textarea
                className={styles.inputField}
                rows="3"
                placeholder="Provide a reason for auditing records..."
                value={repReason}
                onChange={(e) => setRepReason(e.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowReputationModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                disabled={!repPoints || Number(repPoints) <= 0}
                onClick={handleReputationSubmit}
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}

        {/* MODAL: CAPSTONE REVIEW */}
        {showReviewModal && reviewTarget && (
          <Modal
            title={
              reviewAction === "APPROVE"
                ? "Approve Capstone Submission"
                : "Reject Capstone Submission"
            }
            icon={reviewAction === "APPROVE" ? "✓" : "✕"}
            onClose={() => setShowReviewModal(false)}
          >
            <div className={styles.reviewSummaryBox}>
              <div className={styles.reviewRow}>
                <span>Student</span>
                <strong>
                  {reviewTarget.studentId?.name || selectedStudent.name || "—"}
                </strong>
              </div>

              <div className={styles.reviewRow}>
                <span>Course</span>
                <strong>{reviewTarget.courseId?.title || "—"}</strong>
              </div>

              <div className={styles.reviewRow}>
                <span>Repository</span>
                <a
                  href={reviewTarget.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GitHub ↗
                </a>
              </div>

              <div className={styles.reviewRow}>
                <span>Live Demo</span>
                <a
                  href={reviewTarget.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Project Demo ↗
                </a>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>
                {reviewAction === "APPROVE"
                  ? "Feedback Notes (Optional)"
                  : "Rejection Reason & Required Fixes *"}
              </label>
              <textarea
                className={styles.inputField}
                rows="4"
                placeholder="Write structured feedback for the student..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button
                className={
                  reviewAction === "APPROVE"
                    ? styles.successBtn
                    : styles.dangerBtn
                }
                disabled={
                  operationLoading ||
                  capstone.operationLoading ||
                  (reviewAction === "REJECT" && !reviewFeedback.trim())
                }
                onClick={handleReviewSubmit}
              >
                {reviewAction === "APPROVE"
                  ? "✓ Confirm Approval"
                  : "✕ Reject Submission"}
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
};

/* =========================================================
   SUB-COMPONENTS
========================================================= */

const HeroStat = ({ icon, label, value, tone = "", index = 0 }) => (
  <div
    className={`${styles.heroStatCard} ${styles.staggerItem} ${tone ? styles[`stat_${tone}`] : ""}`}
    style={{ "--card-index": index }}
  >
    <span className={styles.heroStatIcon}>{icon}</span>
    <div className={styles.heroStatText}>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  </div>
);

const SummaryCard = ({ label, value, icon, tone = "", index = 0 }) => (
  <div
    className={`${styles.summaryCard} ${styles.staggerItem} ${tone ? styles[`summary_${tone}`] : ""}`}
    style={{ "--card-index": index }}
  >
    <div className={styles.summaryIconBox}>{icon}</div>
    <div className={styles.summaryText}>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  </div>
);

const Modal = ({ title, icon, onClose, children }) => (
  <div className={styles.modalOverlay} onClick={onClose}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <div className={styles.modalTitle}>
          <span className={styles.modalIconWrapper}>{icon}</span>
          <h3>{title}</h3>
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

const OverviewTab = ({ profile, student }) => (
  <div className={styles.overviewGrid}>
    <div
      className={`${styles.infoCard} ${styles.staggerItem}`}
      style={{ "--card-index": 0 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>👤</span>
        <div>
          <h4>Account Details</h4>
          <p>Registration and verification status</p>
        </div>
      </div>
      <div className={styles.infoList}>
        <InfoRow label="Full Name" value={student.name} />
        <InfoRow label="Email Address" value={student.email} />
        <InfoRow label="Access Role" value={student.role} />
        <InfoRow label="Joined Date" value={formatDate(student.createdAt)} />
        <InfoRow
          label="Last Active Profile"
          value={formatDate(student.updatedAt)}
        />
        <InfoRow
          label="Total Reputation"
          value={`⭐ ${profile.reputationPoints || 0} pts`}
        />
      </div>
    </div>

    <div
      className={`${styles.infoCard} ${styles.staggerItem}`}
      style={{ "--card-index": 1 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>📈</span>
        <div>
          <h4>Progress Metrics</h4>
          <p>Curriculum accomplishments</p>
        </div>
      </div>
      <div className={styles.infoList}>
        <InfoRow
          label="Courses Completed"
          value={profile.completedCoursesCount || 0}
        />
        <InfoRow
          label="Verified Skills Count"
          value={profile.verifiedSkills?.length || 0}
        />
      </div>
    </div>

    <div
      className={`${styles.infoCard} ${styles.staggerItem}`}
      style={{ "--card-index": 2 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>🔗</span>
        <div>
          <h4>External Profiles</h4>
          <p>Portfolio and professional references</p>
        </div>
      </div>
      <div className={styles.socialList}>
        <SocialLink icon="💻" label="GitHub" value={profile.githubProfile} />
        <SocialLink
          icon="💼"
          label="LinkedIn"
          value={profile.linkedinProfile}
        />
      </div>
    </div>

    <div
      className={`${styles.infoCard} ${styles.staggerItem}`}
      style={{ "--card-index": 3 }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>📝</span>
        <div>
          <h4>Student Bio</h4>
          <p>Candidate background statement</p>
        </div>
      </div>
      <div className={styles.bioContainer}>
        <p>{profile.bio || "No student biography provided yet."}</p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    <strong className={styles.infoValue}>{value || "—"}</strong>
  </div>
);

const SocialLink = ({ icon, label, value }) => (
  <div className={styles.socialItem}>
    <div className={styles.socialIcon}>{icon}</div>
    <div className={styles.socialContent}>
      <small>{label}</small>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          {value}
        </a>
      ) : (
        <span className={styles.notSet}>Not provided</span>
      )}
    </div>
  </div>
);

const CourseProgressTab = ({ progress }) => {
  if (!progress.length)
    return <EmptyTabState message="No course progress records available." />;

  return (
    <div className={styles.dataGrid}>
      {progress.map((item, index) => (
        <div
          key={item._id}
          className={`${styles.dataCard} ${styles.staggerItem}`}
          style={{ "--card-index": index }}
        >
          <div className={styles.dataCardTop}>
            <div className={styles.dataTitleWrapper}>
              <span className={styles.dataBadgeIcon}>📚</span>
              <div>
                <h5>{item.courseId?.title || "Unknown Course"}</h5>
                <span className={styles.dataCategory}>
                  {item.courseId?.category || "Course Module"}
                </span>
              </div>
            </div>
            <span
              className={`${styles.statusBadge} ${
                item.isCompleted ? styles.statusActive : styles.statusPending
              }`}
            >
              {item.isCompleted ? "Completed" : "In Progress"}
            </span>
          </div>

          <div className={styles.progressBarSection}>
            <div className={styles.progressLabelRow}>
              <span>Progress</span>
              <strong>{item.progressPercentage || 0}%</strong>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${item.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          <div className={styles.dataCardMeta}>
            <span>
              📖 {item.completedLessons?.length || 0} Lessons Complete
            </span>
            {item.isQuizPassed && (
              <span className={styles.quizPassedTag}>
                ✓ Quiz Passed ({item.quizScore || 0}%)
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const QuizHistoryTab = ({ attempts }) => {
  if (!attempts.length)
    return <EmptyTabState message="No recorded quiz attempts found." />;

  return (
    <div className={styles.dataGrid}>
      {attempts.map((attempt, index) => (
        <div
          key={attempt._id}
          className={`${styles.dataCard} ${styles.staggerItem}`}
          style={{ "--card-index": index }}
        >
          <div className={styles.dataCardTop}>
            <div className={styles.dataTitleWrapper}>
              <span className={styles.dataBadgeIcon}>📝</span>
              <div>
                <h5>{attempt.courseId?.title || "Course Quiz"}</h5>
                <span className={styles.dataCategory}>
                  {attempt.lessonId
                    ? `Lesson ${attempt.lessonId.lessonNumber}: ${attempt.lessonId.title}`
                    : "Final Assessment"}
                </span>
              </div>
            </div>
            <span
              className={`${styles.statusBadge} ${
                attempt.passed ? styles.statusActive : styles.statusBlocked
              }`}
            >
              {attempt.passed ? "Passed" : "Failed"}
            </span>
          </div>

          <div className={styles.quizScoreRow}>
            <div className={styles.scoreUnit}>
              <span>Score</span>
              <strong>{attempt.percentage || 0}%</strong>
            </div>
            <div className={styles.scoreUnit}>
              <span>Scope</span>
              <strong>
                {attempt.quizType === "FINAL_COURSE" ? "Final" : "Lesson"}
              </strong>
            </div>
            <div className={styles.scoreUnit}>
              <span>Submitted</span>
              <strong>{formatDate(attempt.submittedAt)}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CapstonesTab = ({ submissions, onReview }) => {
  if (!submissions.length)
    return <EmptyTabState message="No capstone projects submitted." />;

  return (
    <div className={styles.dataGrid}>
      {submissions.map((submission, index) => (
        <div
          key={submission._id}
          className={`${styles.dataCard} ${styles.staggerItem}`}
          style={{ "--card-index": index }}
        >
          <div className={styles.dataCardTop}>
            <div className={styles.dataTitleWrapper}>
              <span className={styles.dataBadgeIcon}>🎯</span>
              <div>
                <h5>{submission.courseId?.title || "Capstone Project"}</h5>
                <span className={styles.dataCategory}>
                  Version {submission.submissionVersion} •{" "}
                  {formatDate(submission.createdAt)}
                </span>
              </div>
            </div>
            <span
              className={`${styles.statusBadge} ${
                submission.status === "APPROVED"
                  ? styles.statusActive
                  : submission.status === "REJECTED"
                    ? styles.statusBlocked
                    : styles.statusPending
              }`}
            >
              {submission.status}
            </span>
          </div>

          <div className={styles.capstoneLinks}>
            <a
              href={submission.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.linkPill}
            >
              🔗 GitHub Repository ↗
            </a>
            <a
              href={submission.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.linkPill}
            >
              🌐 Live Deployment ↗
            </a>
          </div>

          {submission.adminFeedback && (
            <div className={styles.adminFeedbackNote}>
              <strong>Feedback:</strong>
              <p>{submission.adminFeedback}</p>
            </div>
          )}

          {submission.status === "PENDING" && (
            <div className={styles.capstoneActionRow}>
              <button
                className={styles.successBtn}
                onClick={() => onReview(submission, "APPROVE")}
              >
                ✓ Approve
              </button>
              <button
                className={styles.dangerBtn}
                onClick={() => onReview(submission, "REJECT")}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EmptyTabState = ({ message }) => (
  <div className={styles.emptyBox}>
    <span className={styles.emptyIcon}>📭</span>
    <h4>No Records Found</h4>
    <p>{message}</p>
  </div>
);

export default StudentDetails;

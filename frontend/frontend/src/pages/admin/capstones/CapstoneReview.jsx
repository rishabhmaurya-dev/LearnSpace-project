import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCapstoneStats,
  fetchCapstoneSubmissions,
  approveCapstone,
  rejectCapstone,
} from "../../../features/admin/capstone/adminCapstoneThunks";

import {
  clearCapstoneError,
  clearCapstoneSuccess,
} from "../../../features/admin/capstone/adminCapstoneSlice";

import {
  previewCertificate,
  sendCertificate,
} from "../../../features/admin/certificate/adminCertificateThunks";

import {
  clearCertificateError,
  clearPreview,
} from "../../../features/admin/certificate/adminCertificateSlice";

import { toast } from "react-hot-toast";
import styles from "./CapstoneReview.module.css";
import { GradualSpacing } from "../../../animation/Text";
const CapstoneReview = () => {
  const dispatch = useDispatch();

  const {
    submissions,
    stats,
    pagination,
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCapstone);

  const [searchParams, setSearchParams] = useSearchParams();

  /* -----------------------------------------------------
     LOCAL STATE
  ----------------------------------------------------- */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(
    (searchParams.get("status") || "").toUpperCase(),
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVE");
  const [reviewFeedback, setReviewFeedback] = useState("");

  /* Certificate issue state */
  const [certificateTarget, setCertificateTarget] = useState(null);

  const {
    preview: certPreview,
    previewLoading,
    sending,
    error: certError,
  } = useSelector((state) => state.adminCertificate);

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
     FETCH DATA HELPER
  ----------------------------------------------------- */
  const refreshData = () => {
    dispatch(fetchCapstoneStats());
    dispatch(
      fetchCapstoneSubmissions({
        search: debouncedSearch,
        status,
        page,
        limit,
      }),
    );
  };

  useEffect(() => {
    refreshData();
  }, [dispatch, debouncedSearch, status, page, limit]);

  /* -----------------------------------------------------
     CLEAR MESSAGES
  ----------------------------------------------------- */
  useEffect(() => {
    if (success) {
      toast.success(message || "Operation successful", { duration: 2500 });
      const timer = setTimeout(() => dispatch(clearCapstoneSuccess()), 2500);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error || "An error occurred", { duration: 3500 });
      const timer = setTimeout(() => dispatch(clearCapstoneError()), 3500);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /* -----------------------------------------------------
     HANDLERS
  ----------------------------------------------------- */
  const openReview = (submission, action) => {
    setReviewTarget(submission);
    setReviewAction(action);
    setReviewFeedback(submission.adminFeedback || "");
  };

  const handleSubmit = async () => {
    if (!reviewTarget) return;

    let result;
    if (reviewAction === "APPROVE") {
      result = await dispatch(
        approveCapstone({
          submissionId: reviewTarget._id,
          feedback: reviewFeedback,
        }),
      );
    } else {
      if (!reviewFeedback.trim()) return;
      result = await dispatch(
        rejectCapstone({
          submissionId: reviewTarget._id,
          feedback: reviewFeedback,
        }),
      );
    }

    // Checking if action was fulfilled
    if (
      approveCapstone.fulfilled.match(result) ||
      rejectCapstone.fulfilled.match(result)
    ) {
      toast.success(
        reviewAction === "APPROVE"
          ? "Capstone approved successfully!"
          : "Capstone rejected.",
      );
      // Immediately refresh list and stats so status converts to APPROVED
      refreshData();
    } else {
      toast.error(result.payload || "Operation failed");
    }

    setReviewTarget(null);
    setReviewFeedback("");
  };

  const totalPages = pagination.totalPages || 1;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  /* -----------------------------------------------------
     CERTIFICATE HANDLERS
  ----------------------------------------------------- */
  const openCertificate = (submission) => {
    setCertificateTarget(submission);
    dispatch(clearCertificateError());
    dispatch(clearPreview());
    dispatch(previewCertificate(submission._id));
  };

  const closeCertificate = () => {
    setCertificateTarget(null);
    dispatch(clearPreview());
  };

  const handleSendCertificate = async () => {
    if (!certificateTarget) return;

    const result = await dispatch(sendCertificate(certificateTarget._id));

    if (sendCertificate.fulfilled.match(result)) {
      toast.success(result.payload.message || "Certificate sent successfully");
      closeCertificate();

      // Refresh data so certificateIssued reflects as true
      refreshData();
    } else {
      toast.error(certError || result.payload || "Failed to send certificate");
    }
  };

  return (
    <div className={styles.container}>
      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1>
            <GradualSpacing text="Capstone Review" />
          </h1>
          <p>Review and approve student capstone submissions</p>
        </div>
      </div>
      
      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Submissions"
          value={stats?.total || 0}
          icon="📦"
        />
        <StatCard
          label="Pending Review"
          value={stats?.pending || 0}
          icon="⏳"
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={stats?.approved || 0}
          icon="✅"
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected || 0}
          icon="❌"
          tone="danger"
        />
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by student, email, or course..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={styles.select}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* SUBMISSIONS LIST */}
      {loading ? (
        <div className={styles.stateBox}>Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className={styles.stateBox}>No submissions found</div>
      ) : (
        <div className={styles.submissionList}>
          {submissions.map((submission) => (
            <div key={submission._id} className={styles.submissionCard}>
              <div className={styles.submissionHeader}>
                <div className={styles.studentInfo}>
                  <div className={styles.avatar}>
                    {submission.student?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <strong>{submission.student?.name || "Unknown"}</strong>
                    <small>{submission.student?.email || ""}</small>
                  </div>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    submission.status === "APPROVED"
                      ? styles.statusApproved
                      : submission.status === "REJECTED"
                        ? styles.statusRejected
                        : styles.statusPending
                  }`}
                >
                  {submission.status}
                </span>
              </div>

              <div className={styles.courseInfo}>
                <strong>{submission.course?.title || "Unknown Course"}</strong>
                <small>{submission.course?.category || ""}</small>
              </div>

              <div className={styles.linksRow}>
                <a
                  href={submission.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  🔗 GitHub Repo
                </a>
                <a
                  href={submission.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  🌐 Live Demo
                </a>
              </div>

              {submission.adminFeedback && (
                <p className={styles.feedbackText}>
                  <strong>Feedback:</strong> {submission.adminFeedback}
                </p>
              )}

              <div className={styles.submissionMeta}>
                <span>Submitted {formatDate(submission.createdAt)}</span>
                {submission.submissionVersion > 1 && (
                  <span>Version {submission.submissionVersion}</span>
                )}
                {submission.reviewedAt && (
                  <span>Reviewed {formatDate(submission.reviewedAt)}</span>
                )}
              </div>

              {/* ACTION BUTTONS (DYNMICALLY SWITCHES TO ISSUE CERTIFICATE ON APPROVE) */}
              {submission.status === "PENDING" && (
                <div className={styles.reviewActions}>
                  <button
                    className={styles.approveBtn}
                    onClick={() => openReview(submission, "APPROVE")}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => openReview(submission, "REJECT")}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}

              {submission.status === "APPROVED" && (
                <div className={styles.reviewActions}>
                  {submission.certificateIssued ? (
                    <span className={styles.certIssuedBadge}>
                      🎓 Certificate Issued
                    </span>
                  ) : (
                    <button
                      className={styles.certBtn}
                      onClick={() => openCertificate(submission)}
                    >
                      🎓 Issue Certificate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {submissions.length > 0 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Prev
          </button>
          <span>
            Page {pagination.currentPage || page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setReviewTarget(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                {reviewAction === "APPROVE"
                  ? "Approve Capstone"
                  : "Reject Capstone"}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setReviewTarget(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.reviewInfo}>
                <p>
                  <strong>Student:</strong> {reviewTarget.student?.name || "—"}
                </p>
                <p>
                  <strong>Course:</strong> {reviewTarget.course?.title || "—"}
                </p>
                <p>
                  <strong>Repo:</strong>{" "}
                  <a
                    href={reviewTarget.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {reviewTarget.githubRepoUrl || "—"}
                  </a>
                </p>
                <p>
                  <strong>Demo:</strong>{" "}
                  <a
                    href={reviewTarget.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {reviewTarget.liveDemoUrl || "—"}
                  </a>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>
                  {reviewAction === "APPROVE"
                    ? "Feedback (optional)"
                    : "Rejection Feedback *"}
                </label>
                <textarea
                  className={styles.textarea}
                  rows="4"
                  placeholder="Enter feedback for the student..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setReviewTarget(null)}
                >
                  Cancel
                </button>
                <button
                  className={
                    reviewAction === "APPROVE"
                      ? styles.approveBtn
                      : styles.rejectBtn
                  }
                  disabled={
                    operationLoading ||
                    (reviewAction === "REJECT" && !reviewFeedback.trim())
                  }
                  onClick={handleSubmit}
                >
                  {reviewAction === "APPROVE" ? "✓ Approve" : "✕ Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {certificateTarget && (
        <div className={styles.modalOverlay} onClick={closeCertificate}>
          <div
            className={`${styles.modal} ${styles.certModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Certificate Preview</h3>
              <button className={styles.modalClose} onClick={closeCertificate}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {previewLoading && (
                <div className={styles.stateBox}>Generating preview...</div>
              )}

              {certError && (
                <div className={styles.errorAlert}>{certError}</div>
              )}

              {!previewLoading && certPreview?.url && (
                <div className={styles.certPreview}>
                  <iframe
                    src={certPreview.url}
                    title="Certificate Preview"
                    className={styles.certPreviewFrame}
                  />
                </div>
              )}

              {!previewLoading && !certPreview?.url && !certError && (
                <div className={styles.stateBox}>
                  No preview available for this submission.
                </div>
              )}

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={closeCertificate}>
                  Cancel
                </button>

                <button
                  className={styles.certBtn}
                  disabled={sending || !certPreview?.url}
                  onClick={handleSendCertificate}
                >
                  {sending
                    ? "Issuing..."
                    : `Issue & Send to ${
                        certificateTarget.student?.name || "Student"
                      }`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* STAT CARD COMPONENT */
const StatCard = ({ label, value, icon, tone = "" }) => {
  return (
    <div className={`${styles.statCard} ${tone ? styles[`stat${tone}`] : ""}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
};

/* HELPERS */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default CapstoneReview;

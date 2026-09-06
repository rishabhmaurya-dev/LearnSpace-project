import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { fetchCertificates } from "../../../features/admin/certificate/adminCertificateThunks";

import { deleteCertificate } from "../../../features/admin/certificate/adminCertificateThunks";

import {
  clearCertificateError,
  clearCertificateSuccess,
} from "../../../features/admin/certificate/adminCertificateSlice";

import styles from "./certificates.module.css";
import { GradualSpacing } from "../../../animation/Text";
const Certificates = () => {
  const dispatch = useDispatch();

  const {
    certificates = [],
    loading,
    error,
    success,
    message,
    deletingId,
  } = useSelector((state) => state.adminCertificate);

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =====================================================
     FETCH COURSE COMPLETION CERTIFICATES
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchCertificates({
        type: "COURSE_COMPLETION",
      }),
    );
  }, [dispatch]);

  /* =====================================================
     SUCCESS
  ===================================================== */

  useEffect(() => {
    if (!success) return;

    toast.success(message || "Operation successful");

    const timer = setTimeout(() => {
      dispatch(clearCertificateSuccess());
    }, 2500);

    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  /* =====================================================
     ERROR
  ===================================================== */

  useEffect(() => {
    if (!error) return;

    toast.error(error || "An error occurred");

    const timer = setTimeout(() => {
      dispatch(clearCertificateError());
    }, 3500);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  /* =====================================================
     DELETE HANDLER
  ===================================================== */

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await dispatch(
      deleteCertificate(deleteTarget._id),
    );

    if (deleteCertificate.fulfilled.match(result)) {
      toast.success(result.payload.message || "Certificate deleted");
      setDeleteTarget(null);
    } else {
      toast.error(result.payload || "Failed to delete certificate");
    }
  };

  return (
    <div className={styles.container}>

      {/* =================================================
          HEADER
      ======================================================= */}

      <div className={styles.pageHeader}>
        <div>
          <h1>
            <GradualSpacing text="Course Certificates" />
          </h1>

          <p>
            All course completion certificates issued to students
          </p>
        </div>

        <div className={styles.totalBadge}>
          <span>🏅</span>
          <strong>{certificates.length}</strong>
          <small>Certificates</small>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ======================================================= */}

      {loading ? (
        <div className={styles.stateBox}>
          <div className={styles.loadingIcon}>🏅</div>
          <span>Loading certificates...</span>
        </div>
      ) : certificates.length === 0 ? (
        <div className={styles.stateBox}>
          <div className={styles.emptyIcon}>📜</div>

          <strong>No certificates found</strong>

          <span>
            Course completion certificates will appear here.
          </span>
        </div>
      ) : (
        <div className={styles.certGrid}>
          {certificates.map((cert, index) => (
            <CertificateCard
              key={cert._id}
              cert={cert}
              index={index}
              deleting={deletingId === cert._id}
              onDelete={() => setDeleteTarget(cert)}
            />
          ))}
        </div>
      )}

      {/* =================================================
          DELETE CONFIRM MODAL
      ======================================================= */}

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmIcon}>🗑️</div>

            <h3>Delete Certificate?</h3>

            <p>
              This will permanently delete the certificate for{" "}
              <strong>{deleteTarget.studentName || "this student"}</strong>
              {" "}({deleteTarget.certificateCode || "—"}). The linked
              capstone will be reset so you can re-issue it, and the
              related verified skill will be removed.
            </p>

            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget._id}
              >
                Cancel
              </button>

              <button
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deletingId === deleteTarget._id}
              >
                {deletingId === deleteTarget._id
                  ? "Deleting..."
                  : "Delete Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   CERTIFICATE CARD
========================================================= */

const CertificateCard = ({ cert, index, deleting = false, onDelete }) => {
  const courseTitle =
    cert.courseId?.title ||
    cert.metadata?.entityName ||
    "Course";

  return (
    <article
      className={styles.certCard}
      style={{
        "--delay": `${index * 0.06}s`,
      }}
    >
      {/* TOP GLOW */}

      <div className={styles.cardGlow} />

      {/* HEADER */}

      <div className={styles.cardTop}>

        <div className={styles.certificateIcon}>
          🏅
        </div>

        <div className={styles.typeInfo}>
          <span className={styles.certificateLabel}>
            COURSE COMPLETION
          </span>

          <span className={styles.typeBadge}>
            Verified
          </span>
        </div>

      </div>

      {/* STUDENT */}

      <div className={styles.studentSection}>

        <div className={styles.avatar}>
          {cert.studentName
            ?.charAt(0)
            ?.toUpperCase() || "S"}
        </div>

        <div className={styles.studentInfo}>
          <h3>
            {cert.studentName || "Unknown Student"}
          </h3>

          <p>
            {cert.studentEmail || "No email available"}
          </p>
        </div>

      </div>

      {/* COURSE */}

      <div className={styles.titleSection}>

        <span>COURSE COMPLETED</span>

        <h2>
          {courseTitle}
        </h2>

        <p>
          Successfully completed the course
        </p>

      </div>

      {/* META */}

      <div className={styles.metaGrid}>

        <div className={styles.metaItem}>
          <span>Certificate Code</span>

          <strong>
            {cert.certificateCode || "—"}
          </strong>
        </div>

        <div className={styles.metaItem}>
          <span>Issued Date</span>

          <strong>
            {formatDate(cert.issueDate)}
          </strong>
        </div>

      </div>

      {/* FOOTER */}

      <div className={styles.cardFooter}>

        <div className={styles.status}>
          <span className={styles.statusDot} />

          <span>
            {cert.status || "SENT"}
          </span>
        </div>

        <div className={styles.cardActions}>
          {cert.pdfUrl ? (
            <a
              href={cert.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.viewButton}
            >
              View Certificate
              <span>↗</span>
            </a>
          ) : (
            <span className={styles.noPdf}>
              PDF unavailable
            </span>
          )}

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onDelete}
            disabled={deleting}
            title="Delete certificate"
          >
            {deleting ? "..." : "🗑️ Delete"}
          </button>
        </div>

      </div>
    </article>
  );
};

/* =========================================================
   DATE FORMAT
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

export default Certificates;
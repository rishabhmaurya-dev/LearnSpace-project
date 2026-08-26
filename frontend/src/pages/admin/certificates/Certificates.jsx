import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { fetchCertificates } from "../../../features/admin/certificate/adminCertificateThunks";

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
  } = useSelector((state) => state.adminCertificate);

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

  return (
    <div className={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

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
      ================================================= */}

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
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   CERTIFICATE CARD
========================================================= */

const CertificateCard = ({ cert, index }) => {
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
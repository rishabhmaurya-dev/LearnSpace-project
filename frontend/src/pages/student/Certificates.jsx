import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  fetchMyCertificates,
  downloadCertificatePdf,
} from "../../features/student/studentCertificateThunks";
import { clearStudentCertificateError } from "../../features/student/studentCertificateSlice";

import styles from "./certificates.module.css";

const Certificates = () => {
  const dispatch = useDispatch();

  const { certificates, loading, downloadingId, error } = useSelector(
    (state) => state.studentCertificate,
  );

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(
        () => dispatch(clearStudentCertificateError()),
        4000,
      );
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDownload = async (certificateId) => {
    try {
      const result = await dispatch(
        downloadCertificatePdf(certificateId),
      ).unwrap();

      const blob = new Blob([result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err || "Failed to download certificate");
    }
  };

  const courseCerts = certificates?.courseCompletion || [];

  return (
    <div className={styles.container}>
      {/* PAGE HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.headerBadge}>VERIFIED CREDENTIALS</span>
          <h1>My Certificates</h1>
          <p>
            Official completion certificates earned for courses and evaluated
            projects.
          </p>
        </div>
        <div className={styles.statsCountBadge}>
          <strong>{courseCerts.length}</strong> Earned
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <CertificateSkeleton />
      ) : courseCerts.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>📜</div>
          <h3>No Certificates Earned Yet</h3>
          <p>
            Complete all modular lessons, pass the final quiz, and get your
            capstone project approved to unlock official certificates.
          </p>
        </div>
      ) : (
        <div className={styles.certGrid}>
          {courseCerts.map((cert, idx) => (
            <CertificateCard
              key={cert._id}
              cert={cert}
              index={idx}
              loading={downloadingId === cert._id}
              onDownload={() => handleDownload(cert._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   CERTIFICATE SKELETON
========================================================= */
const CertificateSkeleton = () => {
  return (
    <div className={styles.certGrid}>
      {[1, 2, 3].map((item) => (
        <div key={item} className={`${styles.certCard} ${styles.skeletonCard}`}>
          <div className={styles.certTop}>
            <div className={styles.skeletonBadge} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonSubtitle} />
            </div>
          </div>
          <div className={styles.skeletonTag} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonActions} />
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   CERTIFICATE CARD COMPONENT
========================================================= */
const CertificateCard = ({ cert, index, loading, onDownload }) => {
  const entityName =
    cert.courseId?.title ||
    cert.projectId?.title ||
    cert.metadata?.entityName ||
    "Course Completion";

  const subtitle = cert.metadata?.subtitle || "";

  const viewPdfUrl = `http://localhost:3000/uploads/certificates/${cert.certificateCode}.pdf`;

  return (
    <div className={styles.certCard} style={{ "--card-index": index }}>
      {/* Decorative Ribbon Accent */}
      <div className={styles.cardRibbon} />

      <div className={styles.certTop}>
        <div className={styles.certBadgeWrap}>
          <span className={styles.certBadgeEmoji}>🏅</span>
        </div>

        <div className={styles.certInfo}>
          <strong className={styles.certTitle}>
            {cert.title || "Certificate of Completion"}
          </strong>
          <span className={styles.entityName}>{entityName}</span>
        </div>
      </div>

      {subtitle && (
        <div className={styles.badgeTagWrap}>
          <span>✨ {subtitle}</span>
        </div>
      )}

      <div className={styles.certMeta}>
        <div className={styles.metaRow}>
          <span>Credential ID</span>
          <code>{cert.certificateCode || "—"}</code>
        </div>
        <div className={styles.metaRow}>
          <span>Issued Date</span>
          <strong>{formatDate(cert.issueDate || cert.createdAt)}</strong>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onDownload}
          disabled={loading}
        >
          {loading ? "Preparing PDF..." : "⬇ Download PDF"}
        </button>

        <a
          href={viewPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          👁 View Online
        </a>
      </div>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export default Certificates;

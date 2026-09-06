import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchMyCertificates,
  downloadCertificatePdf,
} from "../../features/student/studentCertificateThunks";
import { clearStudentCertificateError } from "../../features/student/studentCertificateSlice";

import { GradualSpacing } from "../../animation/Text";

import styles from "./certificates.module.css";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || ""
)
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

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
      toast.error(err?.message || err || "Failed to download certificate");
    }
  };

  const courseCerts = certificates?.courseCompletion || [];
  const hasCerts = courseCerts.length > 0;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>VERIFIED CREDENTIALS</span>
          <h1 className={styles.heroTitle}>
            <GradualSpacing text="My Certificates" />
          </h1>
          <p className={styles.heroSubtitle}>
            Official completion certificates earned for courses and evaluated
            projects — downloadable and verifiable anytime with a unique
            credential code.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.statIcon}>📜</span>
            <div className={styles.statMeta}>
              <strong>{courseCerts.length}</strong>
              <span>Total Earned</span>
            </div>
          </div>

          <div className={styles.heroStat}>
            <span
              className={`${styles.statIcon} ${styles.statIconVerified}`}
            >
              ✓
            </span>
            <div className={styles.statMeta}>
              <strong>{courseCerts.length}</strong>
              <span>Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* how it works (static) */}
      <section className={styles.howItWorks}>
        <div className={styles.step}>
          <span className={styles.stepIcon}>🎓</span>
          <div className={styles.stepText}>
            <strong>Complete the Course</strong>
            <p>Finish all lessons and pass each quiz to unlock the final assessment.</p>
          </div>
        </div>

        <div className={styles.step}>
          <span className={styles.stepIcon}>🚀</span>
          <div className={styles.stepText}>
            <strong>Pass the Capstone</strong>
            <p>Submit your project and get it reviewed and approved by the admins.</p>
          </div>
        </div>

        <div className={styles.step}>
          <span className={styles.stepIcon}>🏅</span>
          <div className={styles.stepText}>
            <strong>Earn Your Certificate</strong>
            <p>Receive an official PDF with a unique credential code you can share and verify.</p>
          </div>
        </div>
      </section>

      {/* results bar */}
      {!loading && hasCerts && (
        <div className={styles.resultsBar}>
          <strong>{courseCerts.length}</strong>
          <span>
            {courseCerts.length === 1
              ? "certificate earned"
              : "certificates earned"}
          </span>
        </div>
      )}

      {/* main content */}
      {loading ? (
        <CertificateSkeleton />
      ) : !hasCerts ? (
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

/* certificate skeleton */
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

/* certificate card component */
const CertificateCard = ({ cert, index, loading, onDownload }) => {
  const entityName =
    cert.courseId?.title ||
    cert.projectId?.title ||
    cert.metadata?.entityName ||
    "Course Completion";

  const subtitle = cert.metadata?.subtitle || "";

  const viewPdfUrl = `${API_ORIGIN}/uploads/certificates/${cert.certificateCode}.pdf`;

  return (
    <article className={styles.certCard} style={{ "--card-index": index }}>
      <div className={styles.cardCover}>
        <div className={styles.cardCoverGlow} />
      </div>

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
        <div className={styles.subtitleTagWrap}>
          <span className={styles.subtitleTag}>✨ {subtitle}</span>
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
          {loading ? "Preparing PDF…" : "Download PDF"}
        </button>

        <a
          href={viewPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          View Online
        </a>
      </div>
    </article>
  );
};

/* helpers */
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
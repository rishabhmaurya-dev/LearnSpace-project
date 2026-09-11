import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";

import api from "../../../services/axios";

import {
  fetchCertificates,
  deleteCertificate,
} from "../../../features/admin/certificate/adminCertificateThunks";

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

  const accessToken = useSelector((state) => state.auth.accessToken);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  /* fetch course completion certificates */

  useEffect(() => {
    dispatch(
      fetchCertificates({
        type: "COURSE_COMPLETION",
      }),
    );
  }, [dispatch]);

  /* success */

  useEffect(() => {
    if (!success) return;

    toast.success(message || "Operation successful");

    const timer = setTimeout(() => {
      dispatch(clearCertificateSuccess());
    }, 2500);

    return () => clearTimeout(timer);
  }, [success, message, dispatch]);

  /* error */

  useEffect(() => {
    if (!error) return;

    toast.error(error || "An error occurred");

    const timer = setTimeout(() => {
      dispatch(clearCertificateError());
    }, 3500);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  /* delete handler */

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await dispatch(deleteCertificate(deleteTarget._id));

    if (deleteCertificate.fulfilled.match(result)) {
      toast.success(result.payload.message || "Certificate deleted");
      setDeleteTarget(null);
    } else {
      toast.error(result.payload || "Failed to delete certificate");
    }
  };

  /* view handler: open certificate PDF instantly in a new tab */

  const handleViewPdf = (certificateId) => {
    const baseUrl = api.defaults.baseURL || "";
    const url = `${baseUrl}/admin/certificates/${certificateId}/pdf?inline=1&token=${encodeURIComponent(
      accessToken || "",
    )}`;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueStudents = certificates.filter(
    (cert, idx, arr) =>
      arr.findIndex(
        (c) =>
          (c.studentEmail || c.studentId || c.studentName || "") ===
          (cert.studentEmail || cert.studentId || cert.studentName || ""),
      ) === idx,
  ).length;

  const pdfsReady = certificates.filter((cert) => cert.pdfUrl).length;

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return certificates;

    return certificates.filter((cert) => {
      const studentName = (cert.studentName || "").toLowerCase();
      const courseTitle = (
        cert.courseId?.title ||
        cert.metadata?.entityName ||
        ""
      ).toLowerCase();

      return studentName.includes(query) || courseTitle.includes(query);
    });
  }, [certificates, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className={styles.container}>
      {/* hero header (static) */}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>CERTIFICATE MANAGEMENT</span>

          <h1 className={styles.heroTitle}>
            <GradualSpacing text="Course Certificates" />
          </h1>

          <p className={styles.heroSubtitle}>
            All course completion certificates issued to students — review,
            preview, and manage every credential from one place.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.statIcon}>🏅</span>
            <div className={styles.statMeta}>
              <strong>{certificates.length}</strong>
              <span>Total Issued</span>
            </div>
          </div>

          <div className={styles.heroStat}>
            <span className={styles.statIcon}>🎓</span>
            <div className={styles.statMeta}>
              <strong>{uniqueStudents}</strong>
              <span>Students</span>
            </div>
          </div>

          <div className={styles.heroStat}>
            <span
              className={`${styles.statIcon} ${styles.statIconVerified}`}
            >
              ✓
            </span>
            <div className={styles.statMeta}>
              <strong>{pdfsReady}</strong>
              <span>PDFs Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* how it works (static) */}

      <section className={styles.howItWorks}>
        <div className={styles.step}>
          <span className={styles.stepIcon}>📝</span>
          <div className={styles.stepText}>
            <strong>Approve the Capstone</strong>
            <p>
              Certificate issuance starts the moment a capstone submission is
              approved by an admin.
            </p>
          </div>
        </div>

        <div className={styles.step}>
          <span className={styles.stepIcon}>📜</span>
          <div className={styles.stepText}>
            <strong>Generate the Credential</strong>
            <p>
              An official PDF with a unique credential code is created
              instantly from the platform template.
            </p>
          </div>
        </div>

        <div className={styles.step}>
          <span className={styles.stepIcon}>🛡️</span>
          <div className={styles.stepText}>
            <strong>Manage & Verify</strong>
            <p>
              Preview, share, or revoke any certificate — every credential
              stays verifiable by code.
            </p>
          </div>
        </div>
      </section>

      {/* toolbar (search + result count) */}

      {!loading && certificates.length > 0 && (
        <div className={styles.toolbar}>
          <div className={styles.resultsBar}>
            <strong>{filteredCertificates.length}</strong>
            <span>of {certificates.length} certificates</span>
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search by student name or course..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
              aria-label="Search certificates by student name or course"
            />
            {search && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* content */}

      {loading ? (
        <CertificateSkeleton />
      ) : certificates.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>📜</div>
          <h3>No certificates found</h3>
          <p>
            Course completion certificates issued by you will appear here.
            Approve a student capstone to generate the first credential.
          </p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No matching certificates</h3>
          <p>
            No certificates match your search. Try a different student name
            or course.
          </p>
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearch("")}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className={styles.certGrid}>
          {filteredCertificates.map((cert, index) => (
            <CertificateCard
              key={cert._id}
              cert={cert}
              index={index}
              deleting={deletingId === cert._id}
              onDelete={() => setDeleteTarget(cert)}
              onView={() => handleViewPdf(cert._id)}
            />
          ))}
        </div>
      )}

      {/* delete confirm modal */}

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

/* certificate skeleton */

const CertificateSkeleton = () => {
  return (
    <div className={styles.certGrid}>
      {[1, 2, 3].map((item) => (
        <div key={item} className={`${styles.certCard} ${styles.skeletonCard}`}>
          <div className={styles.certTop}>
            <div className={styles.skeletonBadge} />
            <div className={styles.skeletonStretch} />
          </div>
          <div className={styles.skeletonStudent} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonActions} />
        </div>
      ))}
    </div>
  );
};

/* certificate card */

const CertificateCard = ({
  cert,
  index,
  deleting = false,
  onDelete,
  onView,
}) => {
  const courseTitle =
    cert.courseId?.title ||
    cert.metadata?.entityName ||
    "Course";

  return (
    <article className={styles.certCard} style={{ "--card-index": index }}>
      {/* ACCENT GRADIENT BAND */}
      <div className={styles.cardCover}>
        <div className={styles.cardCoverGlow} />
      </div>

      {/* HEADER */}
      <div className={styles.certTop}>
        <div className={styles.certBadgeWrap}>
          <span className={styles.certBadgeEmoji}>🏅</span>
        </div>

        <div className={styles.typeInfo}>
          <span className={styles.certificateLabel}>
            COURSE COMPLETION
          </span>

          <span className={styles.typeBadge}>
            <span className={styles.statusDot} />
            Verified
          </span>
        </div>
      </div>

      {/* STUDENT */}
      <div className={styles.studentSection}>
        <div className={styles.avatar}>
          {cert.studentName?.charAt(0)?.toUpperCase() || "S"}
        </div>

        <div className={styles.studentInfo}>
          <h3>{cert.studentName || "Unknown Student"}</h3>
          <p>{cert.studentEmail || "No email available"}</p>
        </div>
      </div>

      {/* COURSE */}
      <div className={styles.titleSection}>
        <span>COURSE COMPLETED</span>
        <h2>{courseTitle}</h2>
      </div>

      {/* META */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span>Certificate Code</span>
          <code>{cert.certificateCode || "—"}</code>
        </div>

        <div className={styles.metaItem}>
          <span>Issued Date</span>
          <strong>{formatDate(cert.issueDate)}</strong>
        </div>
      </div>

      {/* FOOTER */}
      <div className={styles.cardFooter}>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          <span>{cert.status || "SENT"}</span>
        </div>

        <div className={styles.cardActions}>
          {cert.pdfUrl ? (
            <button
              type="button"
              className={styles.viewButton}
              onClick={onView}
            >
              View Certificate
              <span>↗</span>
            </button>
          ) : (
            <span className={styles.noPdf}>PDF unavailable</span>
          )}

          <button
            type="button"
            className={styles.cardDeleteBtn}
            onClick={onDelete}
            disabled={deleting}
            title="Delete certificate"
          >
            <span>🗑️</span>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
};

/* date format */

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default Certificates;
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { formatDate } from "../capstones/CapstoneReview";

import {
  fetchStudents,
  updateStudentStatus,
} from "../../../features/admin/student/adminStudentThunks";

import {
  clearStudentError,
  clearStudentSuccess,
} from "../../../features/admin/student/adminStudentSlice";

import styles from "./StudentList.module.css";
import { GradualSpacing } from "../../../animation/Text";
import { CardGridSkeleton } from "../../../components/AppSkeletons";

const StudentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    students = [],
    pagination = {},
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminStudent);

  /* =========================================
      LOCAL STATE
  ========================================= */
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* =========================================
      DEBOUNCE SEARCH
  ========================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================================
      FETCH STUDENTS
  ========================================= */
  useEffect(() => {
    dispatch(
      fetchStudents({
        search: debouncedSearch,
        skill,
        status,
        sortBy: "createdAt",
        order: "desc",
        page,
        limit,
      }),
    );
  }, [dispatch, debouncedSearch, skill, status, page, limit]);

  /* =========================================
      CLEAR MESSAGES
  ========================================= */
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearStudentSuccess()), 2500);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearStudentError()), 3500);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /* =========================================
      HANDLERS
  ========================================= */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSkillChange = (e) => {
    setSkill(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleToggleStatus = (student) => {
    dispatch(
      updateStudentStatus({
        studentId: student._id,
        isActive: !student.isActive,
      }),
    );
  };

  const handleView = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination.totalPages || 1)) return;
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSkill("");
    setStatus("");
    setPage(1);
  };

  const totalPages = pagination.totalPages || 1;
  const activeStudents = students.filter((student) => student.isActive).length;

  return (
    <div className={styles.container}>
      {/* =========================================
          HEADER
      ========================================= */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <span className={styles.eyebrow}>ADMINISTRATION</span>
          <h1 className={styles.title}>
            <GradualSpacing text="Students" />
          </h1>
          <p className={styles.subtitle}>
            Manage student accounts, skills, reputation, and capstone activity.
          </p>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <span className={styles.headerStatIcon}>👨‍🎓</span>
            <div className={styles.statMeta}>
              <strong>{pagination.total || students.length || 0}</strong>
              <span>Total Students</span>
            </div>
          </div>

          <div className={styles.headerStat}>
            <span
              className={`${styles.headerStatIcon} ${styles.activeIndicator}`}
            >
              ●
            </span>
            <div className={styles.statMeta}>
              <strong>{activeStudents}</strong>
              <span>Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
          ALERTS
      ========================================= */}
      {success && (
        <div className={`${styles.alert} ${styles.successAlert}`} role="alert">
          <span className={styles.alertIcon}>✓</span>
          <span className={styles.alertMessage}>{message}</span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.errorAlert}`} role="alert">
          <span className={styles.alertIcon}>!</span>
          <span className={styles.alertMessage}>{error}</span>
        </div>
      )}

      {/* =========================================
          FILTERS
      ========================================= */}
      <section className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div>
            <h3 className={styles.filterTitle}>Student Directory</h3>
            <p className={styles.filterSubtitle}>
              Search and filter registered students
            </p>
          </div>

          {(search || skill || status) && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {search && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.selectGroup}>
            <select
              className={styles.select}
              value={skill}
              onChange={handleSkillChange}
            >
              <option value="">All Skills</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="UI/UX">UI/UX</option>
              <option value="MongoDB">MongoDB</option>
            </select>

            <select
              className={styles.select}
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
      </section>

      {/* =========================================
          RESULTS COUNT / BAR
      ========================================= */}
      {!loading && students.length > 0 && (
        <div className={styles.resultsHeader}>
          <div className={styles.resultsCount}>
            <strong>{pagination.total || students.length}</strong> students
            found
          </div>
          <span className={styles.resultsPage}>
            Page {pagination.page || page} of {totalPages}
          </span>
        </div>
      )}

      {/* =========================================
          STUDENT CARDS GRID
      ========================================= */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : students.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👨‍🎓</div>
          <h3>No Students Found</h3>
          <p>No students match your current search or filters.</p>
          {(search || skill || status) && (
            <button
              type="button"
              className={styles.emptyClearBtn}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {students.map((student, index) => (
            <article
              key={student._id}
              className={styles.studentCard}
              style={{ "--card-index": index }}
            >
              {/* ACCENT GRADIENT BAND */}
              <div className={styles.cardCover} />

              {/* CARD BODY */}
              <div className={styles.cardBody}>
                {/* TOP ROW: AVATAR + DETAILS + STATUS BADGE */}
                <div className={styles.cardTop}>
                  <div className={styles.studentIdentity}>
                    <div className={styles.avatarWrapper}>
                      <div className={styles.avatar}>
                        {student.profile?.avatar ? (
                          <img
                            src={student.profile.avatar}
                            alt={student.name || "Student Avatar"}
                            className={styles.avatarImg}
                          />
                        ) : (
                          <span>
                            {student.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span
                        className={`${styles.onlineDot} ${
                          student.isActive ? styles.online : styles.offline
                        }`}
                        title={
                          student.isActive
                            ? "Active Account"
                            : "Inactive/Blocked"
                        }
                      />
                    </div>

                    <div className={styles.studentName}>
                      <h3 title={student.name}>
                        {student.name || "Unknown Student"}
                      </h3>
                      <p title={student.email}>{student.email || "No email"}</p>
                    </div>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      student.isActive
                        ? styles.statusActive
                        : styles.statusBlocked
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {student.isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                {/* SKILLS SECTION */}
                <div className={styles.skillsSection}>
                  <div className={styles.sectionLabel}>VERIFIED SKILLS</div>
                  <div className={styles.skillTags}>
                    {student.profile?.verifiedSkills?.length ? (
                      <>
                        {student.profile.verifiedSkills
                          .slice(0, 3)
                          .map((skillItem) => (
                            <span key={skillItem} className={styles.skillTag}>
                              {skillItem}
                            </span>
                          ))}
                        {student.profile.verifiedSkills.length > 3 && (
                          <span
                            className={`${styles.skillTag} ${styles.moreSkills}`}
                          >
                            +{student.profile.verifiedSkills.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={styles.muted}>No verified skills</span>
                    )}
                  </div>
                </div>

                {/* KPI STATS SECTION */}
                <div className={styles.studentStats}>
                  <div className={styles.studentStat}>
                    <span className={styles.statIcon}>⭐</span>
                    <div className={styles.statDetails}>
                      <strong>{student.profile?.reputationPoints || 0}</strong>
                      <small>Reputation</small>
                    </div>
                  </div>

                  <div className={styles.studentStat}>
                    <span className={styles.statIcon}>📚</span>
                    <div className={styles.statDetails}>
                      <strong>
                        {student.profile?.completedCoursesCount || 0}
                      </strong>
                      <small>Courses</small>
                    </div>
                  </div>

                  <div className={styles.studentStat}>
                    <span className={styles.statIcon}>🚀</span>
                    <div className={styles.statDetails}>
                      <strong>
                        {student.profile?.completedProjectsCount || 0}
                      </strong>
                      <small>Projects</small>
                    </div>
                  </div>
                </div>

                {/* FOOTER: JOINED DATE & ACTIONS */}
                <div className={styles.cardFooter}>
                  <div className={styles.joinedDate}>
                    <span>Joined</span>
                    <strong>{formatDate(student.createdAt)}</strong>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => handleView(student._id)}
                    >
                      <span>View</span>
                      <span className={styles.arrow}>→</span>
                    </button>

                    <button
                      type="button"
                      className={
                        student.isActive ? styles.blockBtn : styles.activateBtn
                      }
                      disabled={operationLoading}
                      onClick={() => handleToggleStatus(student)}
                    >
                      {operationLoading
                        ? "..."
                        : student.isActive
                          ? "Block"
                          : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================================
          PAGINATION
      ========================================= */}
      {students.length > 0 && !loading && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <span>←</span> Prev
          </button>

          <div className={styles.pageInfo}>
            <span>Page</span>
            <strong>{pagination.page || page}</strong>
            <span>of</span>
            <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentList;

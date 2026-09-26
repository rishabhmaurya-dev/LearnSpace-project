import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Search,
  SlidersHorizontal,
  Star,
  UserCheck,
  Users,
  X,
} from "lucide-react";

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

const SKILL_OPTIONS = [
  "React",
  "Node.js",
  "JavaScript",
  "Python",
  "UI/UX",
  "MongoDB",
];

const StudentList = () => {
  const dispatch = useDispatch();

  const {
    students = [],
    pagination = {},
    loading,
    operationLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminStudent);

  /* local state */
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* debounce search */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* fetch students */
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

  /* clear messages */
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

  /* handlers */
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
  const totalStudents = pagination.total || students.length || 0;
  const activeStudents = students.filter((student) => student.isActive).length;
  const hasFilters = Boolean(search || skill || status);

  return (
    <div className={styles.container}>
      {/* page header */}
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <nav className={styles.breadcrumb}>
            <span>Admin</span>
            <ChevronRight size={13} strokeWidth={2.2} />
            <strong>Students</strong>
          </nav>

          <h1>Students</h1>
          <p>
            Manage student accounts, verified skills, reputation and capstone
            activity across the platform.
          </p>
        </div>

        <div className={styles.headStats}>
          <div className={styles.headStat}>
            <span className={`${styles.headStatIcon} ${styles.toneGreen}`}>
              <Users size={17} strokeWidth={2} />
            </span>
            <div className={styles.headStatBody}>
              <strong>{totalStudents}</strong>
              <span>Total Students</span>
            </div>
          </div>

          <div className={styles.headStat}>
            <span className={`${styles.headStatIcon} ${styles.toneTeal}`}>
              <UserCheck size={17} strokeWidth={2} />
            </span>
            <div className={styles.headStatBody}>
              <strong>{activeStudents}</strong>
              <span>Active on this page</span>
            </div>
          </div>
        </div>
      </header>

      {/* alerts */}
      {success && (
        <div className={`${styles.alert} ${styles.successAlert}`} role="alert">
          <CircleCheck size={16} strokeWidth={2} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className={`${styles.alert} ${styles.errorAlert}`} role="alert">
          <CircleAlert size={16} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* filters */}
      <section className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search students"
          />
          {search && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Clear search"
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className={styles.selectGroup}>
          <SlidersHorizontal
            size={15}
            strokeWidth={2}
            className={styles.filterIcon}
          />

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={skill}
              onChange={handleSkillChange}
              aria-label="Filter by skill"
            >
              <option value="">All Skills</option>
              {SKILL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={2} className={styles.chevron} />
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={status}
              onChange={handleStatusChange}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <ChevronDown size={14} strokeWidth={2} className={styles.chevron} />
          </div>

          {hasFilters && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleClearFilters}
            >
              <X size={14} strokeWidth={2.2} />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* results bar */}
      {!loading && students.length > 0 && (
        <div className={styles.resultsBar}>
          <span>
            <strong>{totalStudents}</strong> students found
          </span>
          <span>
            Page {pagination.page || page} of {totalPages}
          </span>
        </div>
      )}

      {/* directory */}
      {loading ? (
        <ListSkeleton rows={limit} />
      ) : students.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={28} strokeWidth={1.5} />
          <strong>No students found</strong>
          <p>No students match your current search or filters.</p>
          {hasFilters && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.directory}>
          <div className={styles.directoryHead}>
            <span>Student</span>
            <span>Verified Skills</span>
            <span>Reputation</span>
            <span>Courses</span>
            <span>Joined</span>
            <span>Status</span>
            <span className={styles.headActionsLabel}>Actions</span>
          </div>

          {students.map((student) => {
            const skills = student.profile?.verifiedSkills || [];
            const isActive = Boolean(student.isActive);

            return (
              <div className={styles.directoryRow} key={student._id}>
                <div className={styles.identity}>
                  <span className={styles.avatar}>
                    {student.profile?.avatar ? (
                      <img
                        src={student.profile.avatar}
                        alt={student.name || "Student avatar"}
                      />
                    ) : (
                      student.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </span>

                  <div className={styles.identityText}>
                    <strong title={student.name}>
                      {student.name || "Unknown Student"}
                    </strong>
                    <small title={student.email}>
                      {student.email || "No email"}
                    </small>
                  </div>
                </div>

                <div className={styles.skillTags}>
                  {skills.length ? (
                    <>
                      {skills.slice(0, 2).map((skillItem) => (
                        <span className={styles.skillTag} key={skillItem}>
                          {skillItem}
                        </span>
                      ))}
                      {skills.length > 2 && (
                        <span className={styles.skillTag}>
                          +{skills.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={styles.muted}>No verified skills</span>
                  )}
                </div>

                <div className={styles.cellNum}>
                  <span className={styles.cellLabel}>Reputation</span>
                  <Star size={13} strokeWidth={2} />
                  {student.profile?.reputationPoints || 0}
                </div>

                <div className={styles.cellNum}>
                  <span className={styles.cellLabel}>Courses</span>
                  <BookOpen size={13} strokeWidth={2} />
                  {student.profile?.completedCoursesCount || 0}
                </div>

                <div className={styles.cellDate}>
                  <span className={styles.cellLabel}>Joined</span>
                  {formatDate(student.createdAt)}
                </div>

                <div className={styles.statusCell}>
                  <span
                    className={`${styles.statusBadge} ${
                      isActive ? styles.statusActive : styles.statusBlocked
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                <div className={styles.rowActions}>
                  <Link
                    to={`/admin/students/${student._id}`}
                    className={styles.btnMini}
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    className={
                      isActive ? styles.btnDanger : styles.btnSuccess
                    }
                    disabled={operationLoading}
                    onClick={() => handleToggleStatus(student)}
                  >
                    {operationLoading
                      ? "..."
                      : isActive
                        ? "Block"
                        : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* pagination */}
      {students.length > 0 && !loading && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft size={15} strokeWidth={2} />
            Prev
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
            Next
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
};

/* loading placeholder */
const ListSkeleton = ({ rows = 6 }) => (
  <div className={styles.directory}>
    <div className={styles.skeletonHead}>
      {[...Array(7)].map((_, index) => (
        <span key={index} className={styles.skeletonBar} />
      ))}
    </div>

    {[...Array(rows)].map((_, rowIndex) => (
      <div className={styles.skeletonRow} key={rowIndex}>
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
      </div>
    ))}
  </div>
);

export default StudentList;

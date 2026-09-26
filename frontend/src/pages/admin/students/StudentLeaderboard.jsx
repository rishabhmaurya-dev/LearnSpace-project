import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FolderCheck,
  Medal,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { fetchStudentLeaderboard } from "../../../features/admin/student/adminStudentThunks";

import styles from "./StudentLeaderboard.module.css";

const SKILL_OPTIONS = [
  "React",
  "Node.js",
  "JavaScript",
  "Python",
  "UI/UX",
  "MongoDB",
];

const PODIUM_ORDER = [1, 0, 2];

const RANK_LABEL = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const studentPath = (student) =>
  `/admin/students/${student.studentId || student._id}`;

const StudentLeaderboard = () => {
  const dispatch = useDispatch();

  const {
    leaderboard = [],
    leaderboardPagination,
    leaderboardLoading,
    error,
  } = useSelector((state) => state.adminStudent);

  /* local state */
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const hasFilters = Boolean(search || skill);

  /* debounce search */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* fetch leaderboard */
  useEffect(() => {
    dispatch(
      fetchStudentLeaderboard({
        search: debouncedSearch,
        skill,
        page,
        limit,
      }),
    );
  }, [dispatch, debouncedSearch, skill, page, limit]);

  const totalPages = leaderboardPagination?.totalPages || 1;
  const totalStudents = leaderboardPagination?.total || 0;

  /* Quick banner stats derived from loaded data */
  const topScore = leaderboard.reduce(
    (max, student) => Math.max(max, student.reputationPoints || 0),
    0,
  );

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
  };

  /* podium — top 3 (only on first page without filters) */
  const showPodium = !hasFilters && page === 1 && leaderboard.length > 0;
  const podium = leaderboard.slice(0, 3);

  return (
    <div className={styles.container}>
      {/* page header */}
      <header className={styles.pageHead}>
        <div className={styles.pageHeadText}>
          <nav className={styles.breadcrumb}>
            <span>Admin</span>
            <ChevronRight size={13} strokeWidth={2.2} />
            <span>Students</span>
            <ChevronRight size={13} strokeWidth={2.2} />
            <strong>Leaderboard</strong>
          </nav>

          <h1>Student Leaderboard</h1>
          <p>
            Top performing students ranked by reputation points earned across
            courses, projects and verified skills.
          </p>
        </div>

        <div className={styles.headSide}>
          <div className={styles.headStat}>
            <span className={`${styles.headStatIcon} ${styles.toneGreen}`}>
              <Users size={17} strokeWidth={2} />
            </span>
            <div className={styles.headStatBody}>
              <strong>{totalStudents}</strong>
              <span>Ranked Students</span>
            </div>
          </div>

          <div className={styles.headStat}>
            <span className={`${styles.headStatIcon} ${styles.toneAmber}`}>
              <Trophy size={17} strokeWidth={2} />
            </span>
            <div className={styles.headStatBody}>
              <strong>{topScore}</strong>
              <span>Top Score</span>
            </div>
          </div>

          <Link to="/admin/students" className={styles.btnGhost}>
            <ArrowLeft size={15} strokeWidth={2.2} />
            Student Directory
          </Link>
        </div>
      </header>

      {/* filters */}
      <section className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search leaderboard"
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

        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setPage(1);
            }}
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
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Students per page"
          >
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>
          <ChevronDown size={14} strokeWidth={2} className={styles.chevron} />
        </div>
      </section>

      {/* podium — top 3 */}
      {showPodium && (
        <section className={styles.podiumGrid}>
          {PODIUM_ORDER.map((position) => {
            const student = podium[position];

            if (!student) return null;

            return (
              <Link
                key={student.studentId || student._id}
                to={studentPath(student)}
                className={`${styles.podiumCard} ${
                  styles[`podium${position + 1}`]
                }`}
              >
                <span
                  className={`${styles.rankChip} ${
                    styles[`rank${position + 1}`]
                  }`}
                >
                  <Medal size={13} strokeWidth={2.2} />
                  {RANK_LABEL[position + 1]}
                </span>

                <span className={styles.podiumAvatar}>
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name || "Student"} />
                  ) : (
                    student.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </span>

                <strong className={styles.studentName} title={student.name}>
                  {student.name}
                </strong>

                <small className={styles.studentEmail} title={student.email}>
                  {student.email}
                </small>

                <span className={styles.pointsChip}>
                  <Star size={13} strokeWidth={2} />
                  {student.reputationPoints || 0} pts
                </span>
              </Link>
            );
          })}
        </section>
      )}

      {/* leaderboard cards */}
      {leaderboardLoading ? (
        <CardSkeletonGrid count={6} />
      ) : error ? (
        <div className={styles.stateError}>
          <CircleAlert size={16} strokeWidth={2} />
          <span>{error}</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className={styles.stateBox}>
          <Users size={28} strokeWidth={1.5} />
          <strong>No students found</strong>
          <p>No students match your current search or filters.</p>
          {hasFilters && (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => {
                setSearch("");
                setSkill("");
                setPage(1);
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.leaderboardGrid}>
          {leaderboard.map((student) => {
            const skills = student.verifiedSkills || [];
            const isActive = student.isActive !== false;

            return (
              <Link
                key={student.studentId || student._id}
                to={studentPath(student)}
                className={styles.studentCard}
              >
                <div className={styles.cardTop}>
                  <span
                    className={`${styles.rankChip} ${
                      student.rank <= 3
                        ? styles[`rank${student.rank}`]
                        : styles.rankPlain
                    }`}
                  >
                    #{student.rank}
                  </span>

                  <span
                    className={`${styles.statusBadge} ${
                      isActive ? styles.statusActive : styles.statusBlocked
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {isActive ? "Active" : "Blocked"}
                  </span>
                </div>

                <div className={styles.profile}>
                  <span className={styles.avatar}>
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.name || "Student"}
                      />
                    ) : (
                      student.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </span>

                  <div className={styles.identity}>
                    <strong className={styles.studentName} title={student.name}>
                      {student.name}
                    </strong>
                    <small className={styles.studentEmail} title={student.email}>
                      {student.email}
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
                    <span className={styles.muted}>No verified skills yet</span>
                  )}
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.cardStat}>
                    <BookOpen size={14} strokeWidth={2} />
                    <strong>{student.completedCoursesCount || 0}</strong>
                    <span>Courses</span>
                  </div>

                  <div className={styles.cardStat}>
                    <FolderCheck size={14} strokeWidth={2} />
                    <strong>{student.completedProjectsCount || 0}</strong>
                    <span>Projects</span>
                  </div>

                  <div className={styles.cardStat}>
                    <Sparkles size={14} strokeWidth={2} />
                    <strong>{skills.length}</strong>
                    <span>Skills</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.pointsChip}>
                    <Star size={13} strokeWidth={2} />
                    {student.reputationPoints || 0} reputation
                  </span>

                  <span className={styles.viewLink}>
                    View Profile
                    <ChevronRight size={15} strokeWidth={2.2} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* pagination */}
      {leaderboard.length > 0 && !leaderboardLoading && (
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
            <strong>{leaderboardPagination?.page || page}</strong>
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
const CardSkeletonGrid = ({ count = 6 }) => (
  <div className={styles.leaderboardGrid}>
    {[...Array(count)].map((_, index) => (
      <div className={styles.skeletonCard} key={index}>
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
        <span className={styles.skeletonBar} />
      </div>
    ))}
  </div>
);

export default StudentLeaderboard;

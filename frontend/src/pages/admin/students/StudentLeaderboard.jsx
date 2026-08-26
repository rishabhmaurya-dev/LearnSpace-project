import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchStudentLeaderboard } from "../../../features/admin/student/adminStudentThunks";
import { CardGridSkeleton } from "../../../components/AppSkeletons";

import styles from "./StudentLeaderboard.module.css";
import { GradualSpacing } from "../../../animation/Text";

const MEDALS = ["🥇", "🥈", "🥉"];

const StudentLeaderboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { leaderboard, leaderboardPagination, leaderboardLoading, error } =
    useSelector((state) => state.adminStudent);

  /* -----------------------------------------------------
      LOCAL STATE
  ----------------------------------------------------- */
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const hasFilters = Boolean(search || skill);

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
      FETCH LEADERBOARD
  ----------------------------------------------------- */
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

  const openStudent = (student) =>
    navigate(`/admin/students/${student.studentId || student._id}`);

  /* -----------------------------------------------------
      PODIUM — top 3 (only on first page without filters)
  ----------------------------------------------------- */

  const showPodium = !hasFilters && page === 1 && leaderboard.length > 0;
  const podium = leaderboard.slice(0, 3);
  const podiumOrder = [1, 0, 2];

  return (
    <div className={styles.container}>
      {/* =========================================
          HERO BANNER
      ========================================= */}

      <section className={styles.heroBanner}>
        <div className={styles.heroTrophy}>🏆</div>

        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>RANKINGS</span>

          <h1>
            <GradualSpacing text="Leaderboard" className="rgbText" />
          </h1>

          <p>Top performing students ranked by reputation points</p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <strong>{totalStudents}</strong>

            <small>Ranked Students</small>
          </div>

          <div className={styles.heroStat}>
            <strong>{topScore}</strong>

            <small>Top Score</small>
          </div>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/admin/students")}
          >
            ← Student Directory
          </button>
        </div>
      </section>

      {/* =========================================
          FILTERS BAR
      ========================================= */}

      <div className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>

          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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

        <select
          className={styles.select}
          value={skill}
          onChange={(e) => {
            setSkill(e.target.value);
            setPage(1);
          }}
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
          className={`${styles.select} ${styles.limitSelect}`}
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>Show 10</option>
          <option value={20}>Show 20</option>
          <option value={50}>Show 50</option>
        </select>
      </div>

      {/* =========================================
          PODIUM — TOP 3
      ========================================= */}

      {showPodium && (
        <div className={styles.podiumGrid}>
          {podiumOrder.map((position) => {
            const student = podium[position];

            if (!student) return null;

            return (
              <button
                key={student.studentId || student._id}
                type="button"
                className={`${styles.podiumCard} ${
                  styles[`podium${position + 1}`]
                }`}
                onClick={() => openStudent(student)}
              >
                <span className={styles.podiumMedal}>{MEDALS[position]}</span>

                <span className={styles.podiumAvatar}>
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name} />
                  ) : (
                    student.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </span>

                <strong className={styles.podiumName}>{student.name}</strong>

                <small className={styles.podiumEmail}>{student.email}</small>

                <span className={styles.podiumPoints}>
                  ⭐ {student.reputationPoints || 0} pts
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* =========================================
          LEADERBOARD CARDS GRID
      ========================================= */}

      {leaderboardLoading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <div className={styles.stateCardError}>{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className={styles.stateCard}>
          <div className={styles.stateIcon}>🔍</div>

          <h3>No Students Found</h3>

          <p>No students match your current search or filters.</p>

          {hasFilters && (
            <button
              type="button"
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
          {leaderboard.map((student, index) => (
            <article
              key={student.studentId || student._id}
              className={styles.studentCard}
              style={{ "--card-index": index % 12 }}
              onClick={() => openStudent(student)}
            >
              {/* HEADER — rank + points */}

              <div className={styles.cardHeader}>
                <span
                  className={
                    student.rank <= 3
                      ? `${styles.rankBadge} ${styles.medalBadge}`
                      : styles.rankBadge
                  }
                >
                  {student.rank <= 3 && (
                    <span className={styles.medalIcon}>
                      {MEDALS[student.rank - 1]}
                    </span>
                  )}
                  Rank #{student.rank}
                </span>

                <span className={styles.reputationBadge}>
                  ⭐ {student.reputationPoints || 0}
                </span>
              </div>

              {/* IDENTITY */}

              <div className={styles.profileSection}>
                <div className={styles.avatarWrapper}>
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}

                  <span
                    className={`${styles.statusDot} ${
                      student.isActive !== false
                        ? styles.statusOnline
                        : styles.statusBlockedDot
                    }`}
                    title={student.isActive !== false ? "Active" : "Blocked"}
                  />
                </div>

                <div className={styles.identityDetails}>
                  <h3 className={styles.studentName}>{student.name}</h3>

                  <p className={styles.studentEmail}>{student.email}</p>
                </div>
              </div>

              {/* STATS — courses / projects / skills */}

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <strong>{student.completedCoursesCount || 0}</strong>

                  <span>Courses</span>
                </div>

                <div className={styles.statBox}>
                  <strong>{student.completedProjectsCount || 0}</strong>

                  <span>Projects</span>
                </div>

                <div className={styles.statBox}>
                  <strong>{student.verifiedSkills?.length || 0}</strong>

                  <span>Skills</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================================
          PAGINATION
      ========================================= */}

      {leaderboard.length > 0 && !leaderboardLoading && (
        <div className={styles.paginationCard}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            ← Prev
          </button>

          <div className={styles.pageIndicator}>
            Page <strong>{leaderboardPagination?.page || page}</strong> of{" "}
            <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboard;

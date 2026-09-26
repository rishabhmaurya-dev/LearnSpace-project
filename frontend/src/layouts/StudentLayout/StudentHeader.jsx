import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, ChevronDown, LogOut, User } from "lucide-react";

import { logoutUser } from "../../features/auth/authThunks";

import styles from "./StudentHeader.module.css";

const PAGE_META = [
  { match: /^\/student\/dashboard$/, title: "Dashboard" },
  { match: /^\/student\/courses\/[^/]+\/learn\/[^/]+$/, title: "Lesson" },
  { match: /^\/student\/courses\/[^/]+\/learn$/, title: "Course Learning" },
  { match: /^\/student\/courses\/[^/]+\/final$/, title: "Final Assessment" },
  { match: /^\/student\/courses$/, title: "My Courses" },
  { match: /^\/student\/catalog$/, title: "Course Catalog" },
  { match: /^\/student\/certificates$/, title: "Certificates" },
  { match: /^\/student\/profile$/, title: "My Profile" },
  { match: /^\/ai$/, title: "AI Mentor" },
];

const getPageTitle = (pathname) => {
  const hit = PAGE_META.find((item) => item.match.test(pathname));
  return hit ? hit.title : "Student Workspace";
};

const StudentHeader = ({ onToggleSidebar, isOpen = false }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.studentProfile.profile);

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = profile?.avatar || user?.avatar || null;
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "S";
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(logoutUser());
  };

  return (
    <header className={styles.header}>
      {/* left: menu toggle + page context */}
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onToggleSidebar}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={19} strokeWidth={2} />
          ) : (
            <Menu size={19} strokeWidth={2} />
          )}
        </button>

        <div className={styles.pageContext}>
          <h1>{pageTitle}</h1>
          <span>Student Workspace</span>
        </div>
      </div>

      {/* right: quick action + account */}
      <div className={styles.right}>
        <Link to="/ai" className={styles.aiBtn}>
          <Sparkles size={15} strokeWidth={2} />
          <span>Ask AI Mentor</span>
        </Link>

        <div className={styles.account} ref={menuRef}>
          <button
            type="button"
            className={styles.accountBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatar}>{firstLetter}</span>
            )}

            <span className={styles.accountMeta}>
              <strong>{user?.name || "Student"}</strong>
              <small>Student</small>
            </span>

            <ChevronDown
              size={15}
              strokeWidth={2.1}
              className={`${styles.chevron} ${menuOpen ? styles.flip : ""}`}
            />
          </button>

          {menuOpen && (
            <div className={styles.menu} role="menu">
              <div className={styles.menuHead}>
                <strong>{user?.name || "Student"}</strong>
                <span>{user?.email || ""}</span>
              </div>

              <div className={styles.menuDivider} />

              <Link
                to="/student/profile"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} strokeWidth={1.9} />
                My Profile
              </Link>

              <button
                type="button"
                className={`${styles.menuItem} ${styles.menuDanger}`}
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} strokeWidth={1.9} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;

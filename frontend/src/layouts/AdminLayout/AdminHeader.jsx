import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, Plus, ChevronDown, LogOut, User } from "lucide-react";

import { logoutUser } from "../../features/auth/authThunks";
import styles from "./AdminHeader.module.css";

const PAGE_META = [
  { match: /^\/admin\/dashboard$/, title: "Dashboard" },
  { match: /^\/admin\/students$/, title: "Students" },
  { match: /^\/admin\/students\/leaderboard$/, title: "Leaderboard" },
  { match: /^\/admin\/students\/[^/]+$/, title: "Student Details" },
  { match: /^\/admin\/courses$/, title: "Courses" },
  { match: /^\/admin\/courses\/new$/, title: "Create Course" },
  { match: /^\/admin\/courses\/[^/]+\/edit$/, title: "Edit Course" },
  { match: /^\/admin\/courses\/[^/]+$/, title: "Course Details" },
  { match: /^\/admin\/capstones$/, title: "Capstone Reviews" },
  { match: /^\/admin\/certificates$/, title: "Certificates" },
];

const getPageTitle = (pathname) => {
  const hit = PAGE_META.find((item) => item.match.test(pathname));
  return hit ? hit.title : "Admin Studio";
};

const AdminHeader = ({ onToggleSidebar, isOpen = false }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = user?.avatar || null;
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "A";
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
          <span>Admin Studio</span>
        </div>
      </div>

      <div className={styles.right}>
        <Link to="/admin/courses/new" className={styles.createBtn}>
          <Plus size={15} strokeWidth={2.4} />
          <span>New Course</span>
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
              <strong>{user?.name || "Administrator"}</strong>
              <small>Administrator</small>
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
                <strong>{user?.name || "Administrator"}</strong>
                <span>{user?.email || ""}</span>
              </div>

              <div className={styles.menuDivider} />

              <Link
                to="/admin/dashboard"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} strokeWidth={1.9} />
                Admin Dashboard
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

export default AdminHeader;

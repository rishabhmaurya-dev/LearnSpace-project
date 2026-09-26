import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Trophy,
  BookOpen,
  Target,
  Award,
  LogOut,
  X,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";

import { logoutUser } from "../../features/auth/authThunks";
import styles from "./AdminSidebar.module.css";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Students", path: "/admin/students", icon: Users },
      {
        label: "Leaderboard",
        path: "/admin/students/leaderboard",
        icon: Trophy,
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Courses", path: "/admin/courses", icon: BookOpen },
      { label: "Capstones", path: "/admin/capstones", icon: Target },
      { label: "Certificates", path: "/admin/certificates", icon: Award },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const avatarUrl = user?.avatar || null;
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "A";

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
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* brand */}
        <div className={styles.brand}>
          <div className={styles.brandLink}>
            <img
              src="/logo-128.jpg"
              alt=""
              width="30"
              height="30"
              className={styles.brandMark}
            />
            <span className={styles.brandText}>
              Learn<span>Space</span>
            </span>
            <span className={styles.roleTag}>
              <ShieldCheck size={11} strokeWidth={2.4} />
              Admin
            </span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={17} strokeWidth={2.1} />
          </button>
        </div>

        {/* navigation */}
        <nav className={styles.nav} aria-label="Admin navigation">
          {NAV_GROUPS.map((group) => (
            <div className={styles.group} key={group.label}>
              <span className={styles.groupLabel}>{group.label}</span>

              <div className={styles.groupItems}>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ""}`
                      }
                    >
                      <Icon
                        className={styles.navIcon}
                        size={17}
                        strokeWidth={1.9}
                      />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* account footer */}
        <div className={styles.footer} ref={menuRef}>
          <button
            type="button"
            className={styles.userBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className={styles.userAvatarImg} />
            ) : (
              <span className={styles.userAvatar}>{firstLetter}</span>
            )}

            <span className={styles.userMeta}>
              <strong>{user?.name || "Administrator"}</strong>
              <small>{user?.email || "Admin account"}</small>
            </span>

            <ChevronUp
              size={15}
              strokeWidth={2.1}
              className={`${styles.userChevron} ${menuOpen ? styles.flip : ""}`}
            />
          </button>

          {menuOpen && (
            <div className={styles.userMenu} role="menu">
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
      </aside>
    </>
  );
};

export default AdminSidebar;

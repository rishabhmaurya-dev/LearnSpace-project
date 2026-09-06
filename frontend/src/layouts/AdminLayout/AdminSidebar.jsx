import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authThunks";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "⌂" },
    { label: "Students", path: "/admin/students", icon: "👨‍🎓" },
    { label: "Leaderboard", path: "/admin/students/leaderboard", icon: "🏆" },
    { label: "Courses", path: "/admin/courses", icon: "📚" },
    { label: "Capstones", path: "/admin/capstones", icon: "🎯" },
    { label: "Certificates", path: "/admin/certificates", icon: "🏅" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      {/* Sidebar Drawer */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <div className={styles.logoBrand}>
            <img src="/learnspace-logo-1024x1024.png" alt="LearnSpace" className={styles.logoMark} />
            <span className={styles.logoText}>LearnSpace</span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className={styles.sectionTitle}>ADMIN PANEL</div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

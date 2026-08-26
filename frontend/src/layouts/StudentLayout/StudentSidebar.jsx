import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  LayoutDashboard,
  BookOpen,
  Search,
  Award,
  User,
  Bot,
  LogOut,
} from "lucide-react";

import { logoutUser } from "../../features/auth/authThunks";

import styles from "./StudentSidebar.module.css";

const StudentSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Courses",
      path: "/student/courses",
      icon: BookOpen,
    },
    {
      label: "Course Catalog",
      path: "/student/catalog",
      icon: Search,
    },
    {
      label: "Certificates",
      path: "/student/certificates",
      icon: Award,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: User,
    },
    {
      label: "AI Assistant",
      path: "/ai",
      icon: Bot,
    },
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
          <NavLink to="/student/dashboard" className={styles.logoBrand} onClick={onClose}>
            <span className={styles.logoMark}>LS</span>
            <span className={styles.logoText}>
              LEARN<strong>SPACE</strong>
            </span>
          </NavLink>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className={styles.sectionTitle}>STUDENT PORTAL</div>

        <nav className={styles.nav} aria-label="Student navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <Icon className={styles.icon} size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>LOG OUT</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;

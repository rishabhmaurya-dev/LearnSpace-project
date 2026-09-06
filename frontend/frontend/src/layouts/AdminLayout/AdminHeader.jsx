import { useSelector } from "react-redux";
import styles from "./AdminHeader.module.css";

const AdminHeader = ({ onToggleSidebar }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className={styles.header}>
      <div className={styles.leftContainer}>
        {/* Hamburger button */}
        <button
          type="button"
          className={styles.menuToggleBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div>
          <h2 className={styles.title}>Admin Dashboard</h2>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className={styles.userInfo}>
          <strong>{user?.name || "Admin"}</strong>
          <span>{user?.email || ""}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

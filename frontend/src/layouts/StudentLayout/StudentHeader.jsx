import { useSelector } from "react-redux";

import styles from "./StudentHeader.module.css";

const StudentHeader = ({ onToggleSidebar }) => {
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.studentProfile.profile);

  const avatarUrl = profile?.avatar || null;
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "S";

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
          <h2 className={styles.title}>Student Panel</h2>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || "Student"}
          </p>
        </div>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className={styles.avatarImage} />
          ) : (
            firstLetter
          )}
        </div>
        <div className={styles.userInfo}>
          <strong>{user?.name || "Student"}</strong>
          <span>{user?.email || ""}</span>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;

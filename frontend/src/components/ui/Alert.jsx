import styles from "./Alert.module.css";

const Alert = ({ type = "info", children, onClose }) => {
  if (!children) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      {type === "success" && <span className={styles.icon}>✓</span>}
      {type === "error" && <span className={styles.icon}>✕</span>}
      {type === "warning" && <span className={styles.icon}>!</span>}
      {type === "info" && <span className={styles.icon}>ℹ</span>}

      <div className={styles.content}>{children}</div>

      {onClose && (
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;

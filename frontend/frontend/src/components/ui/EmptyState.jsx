import styles from "./EmptyState.module.css";

const EmptyState = ({ icon = "📭", message, action }) => {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>{icon}</span>
      <p>{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;

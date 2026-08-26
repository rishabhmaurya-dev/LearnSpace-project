import styles from "./StatusBadge.module.css";

const StatusBadge = ({ tone = "neutral", children }) => {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
};

export default StatusBadge;

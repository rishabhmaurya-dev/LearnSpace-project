import styles from "./Spinner.module.css";

const Spinner = ({ size = 16, light = false }) => {
  return (
    <span
      className={`${styles.spinner} ${light ? styles.light : ""}`}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
};

export default Spinner;

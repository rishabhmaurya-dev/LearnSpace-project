import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className={styles.loaderWrapper}>
        <span className={styles.loaderLetter}>L</span>
        <span className={styles.loaderLetter}>o</span>
        <span className={styles.loaderLetter}>a</span>
        <span className={styles.loaderLetter}>d</span>
        <span className={styles.loaderLetter}>i</span>
        <span className={styles.loaderLetter}>n</span>
        <span className={styles.loaderLetter}>g </span>
        <span className={styles.loaderLetter}>&nbsp;c</span>
        <span className={styles.loaderLetter}>o</span>
        <span className={styles.loaderLetter}>u</span>
        <span className={styles.loaderLetter}>r</span>
        <span className={styles.loaderLetter}>s</span>
        <span className={styles.loaderLetter}>e</span>
        <span className={styles.loaderLetter}>s</span>
        <span className={styles.loaderLetter}>.</span>
        <span className={styles.loaderLetter}>.</span>
        <span className={styles.loaderLetter}>.</span>
        <div className={styles.loader} />
      </div>
    </div>
  );
};

export default Loader;

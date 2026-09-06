import { Link } from "react-router-dom";
import ScrollReveal from "../../animation/Scroll";

import styles from "./errors.module.css";

const Unauthorized = () => {
  return (
    <ScrollReveal>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.code}>403</div>

          <h1>Access Denied</h1>

          <p>
            You don't have permission to access this page. Please contact your
            administrator if you believe this is a mistake.
          </p>

          <Link to="/" className={styles.btn}>
            ← Go Back Home
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default Unauthorized;

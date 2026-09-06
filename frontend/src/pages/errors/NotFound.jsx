import { useNavigate } from "react-router-dom";
import ScrollReveal from "../../animation/Scroll";
import styles from "./errors.module.css";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <ScrollReveal>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.code}>404</div>

          <h1>Page Not Found</h1>

          <p>The page you are looking for doesn't exist or has been moved.</p>

          <button className={styles.btn} onClick={()=> navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default NotFound;

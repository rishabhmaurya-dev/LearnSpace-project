import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { forgotPassword } from "../../features/auth/authThunks";

import ScrollReveal from "../../animation/Scroll";

import {
  clearAuthError,
  clearAuthSuccess,
} from "../../features/auth/authSlice";

import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const dispatch = useDispatch();

  const { loading, error, success, message } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    await dispatch(forgotPassword(email.trim()));
  };

  return (
    <ScrollReveal>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Forgot Password?</h1>

            <p>
              Enter your registered email and we'll send you a password reset
              link.
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {success && <div className={styles.success}>{message}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your registered email address"
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link to="/login" className={styles.backLink}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default ForgotPassword;

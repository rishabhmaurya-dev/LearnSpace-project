import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import ScrollReveal from "../../animation/Scroll";

import { resetPassword } from "../../features/auth/authThunks";

import {
  clearAuthError,
  clearAuthSuccess,
} from "../../features/auth/authSlice";

import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const { token } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { loading, error, success, message } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");

    if (error) {
      dispatch(clearAuthError());
    }

    if (success) {
      dispatch(clearAuthSuccess());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationError("");

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters.");

      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");

      return;
    }

    const result = await dispatch(
      resetPassword({
        token,
        newPassword: formData.password,
      }),
    );

    if (resetPassword.fulfilled.match(result)) {
      setFormData({
        password: "",
        confirmPassword: "",
      });
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <ScrollReveal>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Reset Password</h1>

            <p>Create a new secure password for your account.</p>
          </div>

          {validationError && (
            <div className={styles.error}>{validationError}</div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {success ? (
            <div className={styles.successBox}>
              <div className={styles.success}>{message}</div>

              <p>Redirecting you to login...</p>

              <Link to="/login">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="password">New Password</label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirm Password</label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>

              <div className={styles.passwordHint}>
                Password must contain at least 6 characters.
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {!success && (
            <Link to="/login" className={styles.backLink}>
              ← Back to Login
            </Link>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
};

export default ResetPassword;

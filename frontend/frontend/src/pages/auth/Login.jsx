import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ScrollReveal from "../../animation/Scroll";

import {
  clearAuthError,
  clearAuthSuccess,
} from "../../features/auth/authSlice";

import { loginUser } from "../../features/auth/authThunks";

import styles from "./Login.module.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;

      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "COMPANY") {
        navigate("/company/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    }
  };

  return (
    <ScrollReveal>
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>L</div>

            <div>
              <span className={styles.brandName}>Learn</span>
              <span className={styles.brandAccent}>Space</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.header}>
              <h1>Welcome Back</h1>

              <p>Continue your learning journey</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>

                <div className={styles.inputWrapper}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.forgot}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span />
              <small>New to LearnSpace?</small>
              <span />
            </div>

            <div className={styles.footer}>
              <span>Don't have an account?</span>

              <Link to="/register">Create Account</Link>
            </div>
          </div>

          <p className={styles.bottomText}>
            Learn skills. Build projects. Grow your career.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default Login;

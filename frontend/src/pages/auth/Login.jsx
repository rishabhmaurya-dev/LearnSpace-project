import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

  const [showPassword, setShowPassword] = useState(false);

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
      <main className={styles.page}>
        <div className={styles.backdrop} aria-hidden="true">
          <span className={styles.orbTop} />
          <span className={styles.orbBottom} />
          <span className={styles.gridLines} />
          <span className={styles.ring} />
        </div>

        <div className={styles.shell}>
          <Link to="/" className={styles.brand}>
            <img
              src="/logo-128.jpg"
              alt="LearnSpace"
              width="38"
              height="38"
              className={styles.brandIcon}
            />

            <span className={styles.brandText}>
              <span className={styles.brandName}>Learn</span>
              <span className={styles.brandAccent}>Space</span>
            </span>
          </Link>

          <div className={styles.card}>
            <div className={styles.header}>
              <h1>Welcome Back</h1>

              <p>Continue your learning journey</p>
            </div>

            {error && <div className={styles.alert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>

                <input
                  className={styles.input}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.passwordWrap}>
                  <input
                    className={styles.input}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
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
                    <span aria-hidden="true">&rarr;</span>
                  </>
                )}
              </button>
            </form>

            <p className={styles.footer}>
              New to LearnSpace? <Link to="/register">Create Account</Link>
            </p>
          </div>

          <p className={styles.bottomText}>
            Learn skills. Build projects. Grow your career.
          </p>
        </div>
      </main>
    </ScrollReveal>
  );
};

export default Login;

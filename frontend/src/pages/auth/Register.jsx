import { useState, useEffect } from "react";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import ScrollReveal from "../../animation/Scroll";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { registerUser, loginUser } from "../../features/auth/authThunks";

import {
  clearAuthError,
  clearAuthSuccess,
} from "../../features/auth/authSlice";

import styles from "./Register.module.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, message } = useSelector(
    (state) => state.auth,
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
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

    const registerResult = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(registerResult)) {
      const loginResult = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        }),
      );

      if (loginUser.fulfilled.match(loginResult)) {
        const role = loginResult.payload.user.role;

        if (role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "COMPANY") {
          navigate("/company/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
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
              <h1>Create Account</h1>

              <p>Start learning, building and growing today.</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {success && <div className={styles.success}>{message}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>

                <input
                  className={styles.input}
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
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

              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span aria-hidden="true">&rarr;</span>
                  </>
                )}
              </button>
            </form>

            <p className={styles.footer}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          <p className={styles.bottomText}>
            Learn skills. Build projects. Shape your future.
          </p>
        </div>
      </main>
    </ScrollReveal>
  );
};

export default Register;

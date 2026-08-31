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
      <div className={styles.page}>
        <div className={styles.content}>
          {/* BRAND */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>L</div>

            <div>
              <span className={styles.brandName}>Learn</span>
              <span className={styles.brandAccent}>Space</span>
            </div>
          </div>

          {/* REGISTER CARD */}
          <div className={styles.card}>
            <div className={styles.header}>
              <h1>Create Account</h1>

              <p>Start learning, building and growing today.</p>
            </div>

            {error && (
              <div className={styles.error}>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* NAME */}
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>

                <div className={styles.inputWrapper}>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
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

              {/* PASSWORD */}
              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
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
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span />
              <small>Already a member?</small>
              <span />
            </div>

            <div className={styles.footer}>
              <span>Already have an account?</span>

              <Link to="/login">Login</Link>
            </div>
          </div>

          <p className={styles.bottomText}>
            Learn skills. Build projects. Shape your future.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default Register;

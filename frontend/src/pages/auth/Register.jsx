import { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { registerUser,loginUser } from "../../features/auth/authThunks";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

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
  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
  }, [dispatch]);
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Create Account</h1>

          <p>Join our platform</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {success && <div className={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Register As</label>

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="STUDENT">Student</option>

              <option value="COMPANY">Company</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

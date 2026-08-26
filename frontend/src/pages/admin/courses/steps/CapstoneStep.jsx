import { useState, useEffect } from "react";

import styles from "./steps.module.css";

import { useDispatch } from "react-redux";

import toast from "react-hot-toast";

const CapstoneStep = ({
  course,
  onSave,
  saving,
  saveError,
  success,
  error,
  message,
}) => {
  const capstone = course?.capstoneProject || {};

  const [form, setForm] = useState({
    capstoneTitle: capstone.title || "",
    capstoneDescription: capstone.description || "",
    submissionRequirements:
      capstone.submissionRequirements ||
      "Submit GitHub Repository URL & Live Demo Link",
  });
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.capstoneTitle.trim())
      next.capstoneTitle = "Capstone title is required";

    if (!form.capstoneDescription.trim())
      next.capstoneDescription = "Capstone description is required";

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  useEffect(() => {
    if (success) {
      toast.success(message);
      const timer = setTimeout(() => dispatch(clearCourseSuccess()), 2500);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => dispatch(clearCourseError()), 3500);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      capstoneTitle: form.capstoneTitle.trim(),
      capstoneDescription: form.capstoneDescription.trim(),
      submissionRequirements: form.submissionRequirements.trim(),
    });
  };

  return (
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>Capstone Project</h2>

      <p className={styles.stepSubtitle}>
        Define the final capstone project students must complete to earn the
        course certification.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              Capstone Title <span>*</span>
            </label>

            <input
              className={`${styles.input} ${errors.capstoneTitle ? styles.inputError : ""}`}
              type="text"
              name="capstoneTitle"
              placeholder="e.g. Build a Full Stack E-Commerce App"
              value={form.capstoneTitle}
              onChange={handleChange}
            />

            {errors.capstoneTitle && (
              <span className={styles.fieldError}>{errors.capstoneTitle}</span>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>
              Description <span>*</span>
            </label>

            <textarea
              className={`${styles.textarea} ${errors.capstoneDescription ? styles.inputError : ""}`}
              name="capstoneDescription"
              rows="5"
              placeholder="Describe the project requirements in detail..."
              value={form.capstoneDescription}
              onChange={handleChange}
            />

            {errors.capstoneDescription && (
              <span className={styles.fieldError}>
                {errors.capstoneDescription}
              </span>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Submission Requirements</label>

            <textarea
              className={styles.textarea}
              name="submissionRequirements"
              rows="3"
              placeholder="e.g. Submit GitHub Repository URL & Live Demo Link"
              value={form.submissionRequirements}
              onChange={handleChange}
            />

            <span className={styles.hint}>
              Optional. Defaults to "Submit GitHub Repository URL & Live Demo
              Link".
            </span>
          </div>
        </div>

        <div className={styles.wizardNav}>
          <div></div>

          <div className={styles.wizardNavRight}>
            <button
              className={styles.primaryBtn}
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.spinner}></span>
                  Saving...
                </>
              ) : (
                "Save Capstone →"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CapstoneStep;

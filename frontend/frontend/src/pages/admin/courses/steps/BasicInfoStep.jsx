import { useMemo, useRef, useState } from "react";
import styles from "./steps.module.css";

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  passingPercentage: 70,
  quizTimeLimitMinutes: 45,
  lessonQuizPassingPercentage: 70,
};

const BasicInfoStep = ({
  initialCourse,
  onSave,
  saving,
  saveError,
  isEdit,
}) => {
  const [form, setForm] = useState(() => {
    if (!initialCourse) return EMPTY_FORM;

    return {
      title: initialCourse.title || "",
      category: initialCourse.category || "",
      description: initialCourse.description || "",
      passingPercentage: initialCourse.passingPercentage ?? 70,
      quizTimeLimitMinutes: initialCourse.quizTimeLimitMinutes ?? 45,
      lessonQuizPassingPercentage:
        initialCourse.lessonQuizPassingPercentage ?? 70,
    };
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});

  const thumbnailRef = useRef(null);

  const thumbnailPreview = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile);
    return initialCourse?.thumbnailUrl || "";
  }, [thumbnailFile, initialCourse]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  };

  const validate = () => {
    const next = {};

    if (!form.title.trim()) next.title = "Course title is required";
    else if (form.title.trim().length < 3)
      next.title = "Title must be at least 3 characters";

    if (!form.category.trim()) next.category = "Category is required";

    if (!form.description.trim()) next.description = "Description is required";

    if (!thumbnailFile && !initialCourse?.thumbnailUrl)
      next.thumbnail = "Course thumbnail is required";

    const pass = Number(form.passingPercentage);
    if (!pass || pass < 1 || pass > 100)
      next.passingPercentage = "Must be between 1 and 100";

    const time = Number(form.quizTimeLimitMinutes);
    if (!time || time < 1)
      next.quizTimeLimitMinutes = "Must be at least 1 minute";

    const lessonPass = Number(form.lessonQuizPassingPercentage);
    if (!lessonPass || lessonPass < 1 || lessonPass > 100)
      next.lessonQuizPassingPercentage = "Must be between 1 and 100";

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();

    formData.append("title", form.title.trim());
    formData.append("category", form.category.trim());
    formData.append("description", form.description.trim());
    formData.append("passingPercentage", form.passingPercentage);
    formData.append("quizTimeLimitMinutes", form.quizTimeLimitMinutes);
    formData.append(
      "lessonQuizPassingPercentage",
      form.lessonQuizPassingPercentage,
    );

    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    onSave(formData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. HEADER TITLE CARD */}
      <div className={styles.card}>
        <h2 className={styles.stepTitle}>Basic Course Info</h2>
        <p className={styles.stepSubtitle} style={{ marginTop: 4 }}>
          {isEdit
            ? "Update the course details and images below."
            : "Fill in the core details for your course. You can edit these later."}
        </p>
      </div>

      {/* ALERT ERROR CARD */}
      {saveError && (
        <div className={`${styles.card} ${styles.alertError}`}>{saveError}</div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* 2. CORE DETAILS CARD (4 INPUT FIELDS) */}
        <div className={styles.card}>
          <h4 style={{ marginBottom: 16 }}>General Details</h4>

          <div className={styles.formGrid}>
            {/* Title Field */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Course Title <span>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                type="text"
                name="title"
                placeholder="e.g. React Mastery: From Basics to Advanced"
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && (
                <span className={styles.fieldError}>{errors.title}</span>
              )}
            </div>

            {/* Category Field */}
            <div className={styles.formGroup}>
              <label>
                Category <span>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.category ? styles.inputError : ""}`}
                type="text"
                name="category"
                placeholder="e.g. Frontend, Backend, Full Stack"
                value={form.category}
                onChange={handleChange}
              />
              {errors.category && (
                <span className={styles.fieldError}>{errors.category}</span>
              )}
            </div>

            {/* Description Field */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>
                Description <span>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                name="description"
                rows="4"
                placeholder="Describe what students will learn in this course..."
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && (
                <span className={styles.fieldError}>{errors.description}</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. MEDIA UPLOADS CARD (THUMBNAIL) */}
        <div className={styles.card}>
          <h4 style={{ marginBottom: 16 }}>Course Media & Assets</h4>

          <div className={`${styles.imageUploadRow} ${styles.fullWidth}`}>
            {/* Thumbnail Upload */}
            <div className={styles.imagePreviewBox}>
              <label>Course Thumbnail *</label>

              <div className={styles.imagePreview}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Course thumbnail" />
                ) : (
                  "🖼"
                )}
              </div>

              <div
                className={styles.fileDrop}
                onClick={() => thumbnailRef.current?.click()}
              >
                <span className={styles.fileDropIcon}>📁</span>
                <strong>
                  {thumbnailFile || initialCourse?.thumbnailUrl
                    ? "Change Thumbnail"
                    : "Upload Thumbnail"}
                </strong>
                <span>JPG, PNG or WEBP · Max 5MB</span>

                <input
                  ref={thumbnailRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleThumbnailChange}
                />
              </div>

              {thumbnailFile && (
                <div className={styles.fileName}>
                  <span>{thumbnailFile.name}</span>
                  <button type="button" onClick={() => setThumbnailFile(null)}>
                    ✕
                  </button>
                </div>
              )}

              {errors.thumbnail && (
                <span className={styles.fieldError}>{errors.thumbnail}</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. QUIZ SETTINGS CARD (3 CONFIG FIELDS) */}
        <div className={styles.card}>
          <h4 style={{ marginBottom: 16 }}>Assessment Settings</h4>

          <div className={styles.formGrid}>
            {/* Final Quiz Passing % */}
            <div className={styles.formGroup}>
              <label>Final Quiz Passing %</label>
              <input
                className={`${styles.input} ${errors.passingPercentage ? styles.inputError : ""}`}
                type="number"
                name="passingPercentage"
                min="1"
                max="100"
                value={form.passingPercentage}
                onChange={handleChange}
              />
              {errors.passingPercentage && (
                <span className={styles.fieldError}>
                  {errors.passingPercentage}
                </span>
              )}
            </div>

            {/* Quiz Time Limit */}
            <div className={styles.formGroup}>
              <label>Quiz Time Limit (minutes)</label>
              <input
                className={`${styles.input} ${errors.quizTimeLimitMinutes ? styles.inputError : ""}`}
                type="number"
                name="quizTimeLimitMinutes"
                min="1"
                value={form.quizTimeLimitMinutes}
                onChange={handleChange}
              />
              {errors.quizTimeLimitMinutes && (
                <span className={styles.fieldError}>
                  {errors.quizTimeLimitMinutes}
                </span>
              )}
            </div>

            {/* Lesson Quiz Passing % */}
            <div className={styles.formGroup}>
              <label>Lesson Quiz Passing %</label>
              <input
                className={`${styles.input} ${errors.lessonQuizPassingPercentage ? styles.inputError : ""}`}
                type="number"
                name="lessonQuizPassingPercentage"
                min="1"
                max="100"
                value={form.lessonQuizPassingPercentage}
                onChange={handleChange}
              />
              {errors.lessonQuizPassingPercentage && (
                <span className={styles.fieldError}>
                  {errors.lessonQuizPassingPercentage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 5. ACTIONS CARD */}
        <div className={styles.card}>
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
                  "Save & Continue →"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoStep;

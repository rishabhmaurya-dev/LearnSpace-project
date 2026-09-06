import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import {
  createAdminCourse,
  updateAdminCourse,
  updateCourseCapstone,
  fetchAdminCourseDetails,
  fetchCourseLessons,
  uploadLessonMarkdown,
  uploadMultipleLessons,
  deleteLesson,
  uploadLessonMcqCsv,
  deleteLessonMcqs,
  uploadFinalQuizCsv,
  publishAdminCourse,
} from "../../../features/courses/courseThunks";

import {
  clearCourseError,
  clearCourseSuccess,
} from "../../../features/courses/courseSlice";

import BasicInfoStep from "./steps/BasicInfoStep";
import LessonsStep from "./steps/LessonsStep";
import QuizStep from "./steps/QuizStep";
import CapstoneStep from "./steps/CapstoneStep";
import ReviewStep from "./steps/ReviewStep";
import CreateStep from "./steps/CreateStep";

import styles from "./CourseWizard.module.css";

const STEPS = [
  { label: "Basic Info", icon: "📋" },
  { label: "Lessons", icon: "📖" },
  { label: "Quiz", icon: "📝" },
  { label: "Capstone", icon: "🎯" },
  { label: "Review", icon: "🔍" },
  { label: "Create", icon: "🚀" },
];

const CourseWizard = ({ mode, courseId }) => {
  const dispatch = useDispatch();

  // 1. setSearchParams destructure kiya
  const [searchParams, setSearchParams] = useSearchParams();

  const isEdit = mode === "edit";

  const initialStep = (() => {
    const raw = Number(searchParams.get("step"));
    return Number.isInteger(raw) && raw >= 0 && raw < STEPS.length ? raw : 0;
  })();

  const [activeStep, setActiveStep] = useState(initialStep);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [localError, setLocalError] = useState(null);

  const {
    selectedCourse: storedCourse,
    lessons,
    lessonsLoading,
    operationLoading,
    uploadLoading,
    error,
    success,
    message,
  } = useSelector((state) => state.adminCourse);

  const course = storedCourse || createdCourse;

  /* -----------------------------------------------------
     CLEANUP
  ----------------------------------------------------- */

  useEffect(() => {
    return () => {
      dispatch(clearCourseError());
      dispatch(clearCourseSuccess());
    };
  }, [dispatch]);

  /* -----------------------------------------------------
     STEP HELPERS — URL Sync Added
  ----------------------------------------------------- */

  // 2. goToStep me URL search params set kar diye
  const goToStep = useCallback(
    (step) => {
      if (step < 0 || step >= STEPS.length) return;
      setLocalError(null);
      setActiveStep(step);
      // Step number URL me preserve rahega (?step=2)
      setSearchParams({ step: step.toString() }, { replace: true });
    },
    [setSearchParams],
  );

  const handleNext = () => goToStep(activeStep + 1);
  const handleBack = () => goToStep(activeStep - 1);

  /* -----------------------------------------------------
     STEP 1 - BASIC INFO
  ----------------------------------------------------- */

  const handleSaveBasic = (formData) => {
    if (isEdit && courseId) {
      dispatch(updateAdminCourse({ courseId, formData })).then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          goToStep(1);
        }
      });
    } else {
      dispatch(createAdminCourse(formData)).then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          setCreatedCourse(action.payload.course);
          goToStep(1);
        }
      });
    }
  };

  /* -----------------------------------------------------
     STEP 2 - LESSONS
  ----------------------------------------------------- */

  const handleFetchLessons = (id) => {
    dispatch(fetchCourseLessons(id));
  };

  const handleUploadSingle = (id, file) => {
    return dispatch(uploadLessonMarkdown({ courseId: id, file }));
  };

  const handleUploadMultiple = (id, files) => {
    return dispatch(uploadMultipleLessons({ courseId: id, files }));
  };

  const handleDeleteLesson = (lessonId, cId) => {
    if (!window.confirm("Delete this lesson and its MCQs?")) return;
    dispatch(deleteLesson({ lessonId, courseId: cId })).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(fetchCourseLessons(cId));
      }
    });
  };

  const handleUploadMcq = (lessonId, file) => {
    const cId = course?._id;
    return dispatch(uploadLessonMcqCsv({ lessonId, file })).then((action) => {
      if (action.meta.requestStatus === "fulfilled" && cId) {
        dispatch(fetchCourseLessons(cId));
      }
    });
  };

  const handleDeleteMcqs = (lessonId, cId) => {
    if (!window.confirm("Delete all MCQs for this lesson?")) return;
    dispatch(deleteLessonMcqs({ lessonId, courseId: cId })).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(fetchCourseLessons(cId));
      }
    });
  };

  /* -----------------------------------------------------
     STEP 3 - QUIZ
  ----------------------------------------------------- */

  const handleUploadQuiz = (id, file) => {
    return dispatch(uploadFinalQuizCsv({ courseId: id, file })).then(
      (action) => {
        if (action.meta.requestStatus === "fulfilled") {
          dispatch(fetchAdminCourseDetails(id));
        }
      },
    );
  };

  /* -----------------------------------------------------
     STEP 4 - CAPSTONE
  ----------------------------------------------------- */

  const handleSaveCapstone = (payload) => {
    const id = courseId || course?._id;
    if (!id) return;
    return dispatch(updateCourseCapstone({ courseId: id, payload }));
  };

  /* -----------------------------------------------------
     STEP 6 - PUBLISH
  ----------------------------------------------------- */

  const handlePublish = (id) => {
    if (!id) return;
    return dispatch(publishAdminCourse(id)).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(fetchAdminCourseDetails(id));
      }
    });
  };

  /* -----------------------------------------------------
     AUTO-FETCH LESSONS WHEN COURSE IS AVAILABLE
  ----------------------------------------------------- */

  useEffect(() => {
    if (course?._id && activeStep >= 1) {
      dispatch(fetchCourseLessons(course._id));
    }
  }, [course?._id, activeStep, dispatch]);

  /* -----------------------------------------------------
     NAVIGATE TO NEXT AFTER CREATE
  ----------------------------------------------------- */

  useEffect(() => {
    if (
      !isEdit &&
      success &&
      message?.includes("created") &&
      activeStep === 0
    ) {
      goToStep(1);
    }
  }, [success, message, isEdit, activeStep, goToStep]);

  /* =========================================================
     RENDER STEP CONTENT
  ========================================================= */

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoStep
            initialCourse={course}
            onSave={handleSaveBasic}
            saving={operationLoading}
            saveError={error || localError}
            isEdit={isEdit}
          />
        );

      case 1:
        return (
          <LessonsStep
            course={course}
            lessons={lessons}
            loading={lessonsLoading}
            uploading={uploadLoading}
            error={error}
            success={success}
            message={message}
            onFetchLessons={handleFetchLessons}
            onUploadSingle={handleUploadSingle}
            onUploadMultiple={handleUploadMultiple}
            onDeleteLesson={handleDeleteLesson}
            onUploadMcq={handleUploadMcq}
            onDeleteMcqs={handleDeleteMcqs}
          />
        );

      case 2:
        return (
          <QuizStep
            course={course}
            uploading={uploadLoading}
            error={error}
            success={success}
            message={message}
            onUploadQuiz={handleUploadQuiz}
          />
        );

      case 3:
        return (
          <CapstoneStep
            course={course}
            onSave={handleSaveCapstone}
            saving={operationLoading}
            saveError={error || localError}
            success={success}
            message={message}
          />
        );

      case 4:
        return (
          <ReviewStep course={course} lessons={lessons} onNext={handleNext} />
        );

      case 5:
        return (
          <CreateStep
            course={course}
            lessons={lessons}
            publishing={operationLoading}
            onPublish={handlePublish}
            error={error}
            success={success}
            message={message}
          />
        );

      default:
        return null;
    }
  };

  const showBack = activeStep > 0;
  const showNext = [1, 2, 3].includes(activeStep);

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.wizardHeader}>
        <div>
          <h1>{isEdit ? "Edit Course" : "Create New Course"}</h1>
          <p>
            {isEdit
              ? "Update your course step by step."
              : "Build your course step by step — you can skip ahead and fill fields later."}
          </p>
        </div>

        <Link to="/admin/courses" className={styles.ghostBtn}>
          ← Cancel
        </Link>
      </div>

      <div className={styles.stepper}>
        {STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;

          return (
            <div
              key={step.label}
              role="button"
              tabIndex={0}
              className={`${styles.stepItem} ${
                isActive ? styles.stepActive : ""
              } ${isDone ? styles.stepDone : ""}`}
              onClick={() => goToStep(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToStep(index);
              }}
              title={`Go to ${step.label}`}
            >
              <div className={styles.stepCircle}>
                {isDone ? "✓" : step.icon}
              </div>

              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.wizardBody}>
        {renderStep()}

        {showBack && (
          <div className={styles.wizardNav}>
            <button className={styles.secondaryBtn} onClick={handleBack}>
              ← Back
            </button>

            {showNext && (
              <button className={styles.primaryBtn} onClick={handleNext}>
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseWizard;

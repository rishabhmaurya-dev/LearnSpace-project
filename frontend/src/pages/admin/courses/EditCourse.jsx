import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import { fetchAdminCourseDetails } from "../../../features/courses/courseThunks";

import { clearCourseError } from "../../../features/courses/courseSlice";

import CourseWizard from "./CourseWizard";

import styles from "./EditCourse.module.css";

const EditCourse = () => {
  const dispatch = useDispatch();

  const { courseId } = useParams();

  const { selectedCourse, detailsLoading, error } = useSelector(
    (state) => state.adminCourse,
  );

  useEffect(() => {
    if (courseId) {
      dispatch(fetchAdminCourseDetails(courseId));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    return () => {
      dispatch(clearCourseError());
    };
  }, [dispatch]);

  if (detailsLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}>Loading course...</div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className={styles.container}>
        <div className={styles.stateBox}>
          {error || "Course not found"}
        </div>
      </div>
    );
  }

  return <CourseWizard mode="edit" courseId={courseId} />;
};

export default EditCourse;

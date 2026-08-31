import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { resetCourseEditor } from "../../../features/courses/courseSlice";

import CourseWizard from "./CourseWizard";

import styles from "./CreateCourse.module.css";

const CreateCourse = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetCourseEditor());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <CourseWizard mode="create" />
    </div>
  );
};

export default CreateCourse;

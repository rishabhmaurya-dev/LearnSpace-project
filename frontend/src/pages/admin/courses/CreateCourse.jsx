import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { resetCourseEditor } from "../../../features/courses/courseSlice";

import CourseWizard from "./CourseWizard";

const CreateCourse = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetCourseEditor());
  }, [dispatch]);

  return <CourseWizard mode="create" />;
};

export default CreateCourse;

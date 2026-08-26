import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";

import adminDashboardReducer from "../features/admin/dashboard/adminDashboardSlice";
import adminStudentReducer from "../features/admin/student/adminStudentSlice";
import adminCapstoneReducer from "../features/admin/capstone/adminCapstoneSlice";
import adminCourseReducer from "../features/courses/courseSlice";
import adminCertificateReducer from "../features/admin/certificate/adminCertificateSlice";

/* Student feature reducers */
import studentProfileReducer from "../features/student/studentProfileSlice";
import studentCourseReducer from "../features/student/studentCourseSlice";
import studentCertificateReducer from "../features/student/studentCertificateSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminDashboard: adminDashboardReducer,
    adminStudent: adminStudentReducer,
    adminCapstone: adminCapstoneReducer,

    adminCourse: adminCourseReducer,
    adminCertificate: adminCertificateReducer,

    /* Student panel */
    studentProfile: studentProfileReducer,
    studentCourse: studentCourseReducer,
    studentCertificate: studentCertificateReducer,
  },
});

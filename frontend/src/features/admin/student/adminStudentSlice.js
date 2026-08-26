import { createSlice } from "@reduxjs/toolkit";

import {
  fetchStudents,
  fetchStudentDetails,
  updateStudentStatus,
  updateStudentReputation,
  fetchStudentLeaderboard,
  fetchStudentCourseProgress,
  fetchStudentQuizHistory,
} from "./adminStudentThunks";

const initialState = {
  /* =====================================================
     STUDENTS LIST
     ===================================================== */

  students: [],

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  /* =====================================================
     SELECTED STUDENT
     ===================================================== */

  selectedStudent: null,

  summary: null,

  courseProgress: [],
  quizAttempts: [],
  capstoneSubmissions: [],
  projectEnrollments: [],

  /* =====================================================
     LEADERBOARD
     ===================================================== */

  leaderboard: [],

  leaderboardPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  /* =====================================================
     EXTRA DETAILS
     ===================================================== */

  studentCourseProgress: [],
  studentQuizHistory: [],
  studentProjectHistory: [],

  /* =====================================================
     LOADING STATES
     ===================================================== */

  loading: false,

  detailsLoading: false,

  leaderboardLoading: false,

  courseProgressLoading: false,

  quizHistoryLoading: false,

  projectHistoryLoading: false,

  operationLoading: false,

  /* =====================================================
     ERROR
     ===================================================== */

  error: null,

  /* =====================================================
     SUCCESS
     ===================================================== */

  success: false,

  message: "",
};

const studentSlice = createSlice({
  name: "student",

  initialState,

  reducers: {
    clearStudentError: (state) => {
      state.error = null;
    },

    clearStudentSuccess: (state) => {
      state.success = false;
      state.message = "";
    },

    clearStudentDetails: (state) => {
      state.selectedStudent = null;
      state.summary = null;
      state.courseProgress = [];
      state.quizAttempts = [];
      state.capstoneSubmissions = [];
      state.projectEnrollments = [];
    },

    clearStudentState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH STUDENTS
       ===================================================== */

    builder

      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;

        state.students = action.payload.students || [];

        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };

        state.error = null;
      })

      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;

        state.students = [];

        state.error = action.payload || "Failed to fetch students";
      });

    /* =====================================================
       FETCH STUDENT DETAILS
       ===================================================== */

    builder

      .addCase(fetchStudentDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })

      .addCase(fetchStudentDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;

        const data = action.payload;

        state.selectedStudent = data.student || null;

        state.summary = data.summary || null;

        state.courseProgress = data.courseProgress || [];

        state.quizAttempts = data.quizAttempts || [];

        state.capstoneSubmissions = data.capstoneSubmissions || [];

        state.error = null;
      })

      .addCase(fetchStudentDetails.rejected, (state, action) => {
        state.detailsLoading = false;

        state.error = action.payload || "Failed to fetch student details";
      });

    /* =====================================================
       UPDATE STATUS
       ===================================================== */

    builder

      .addCase(updateStudentStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.success = true;

        state.message =
          action.payload.message || "Student status updated successfully";

        const updatedStudent = action.payload.student;

        /* Update list */

        const index = state.students.findIndex(
          (student) => student._id === updatedStudent._id,
        );

        if (index !== -1) {
          state.students[index].isActive = updatedStudent.isActive;
        }

        /* Update selected student */

        if (state.selectedStudent?._id === updatedStudent._id) {
          state.selectedStudent.isActive = updatedStudent.isActive;
        }
      })

      .addCase(updateStudentStatus.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to update student status";
      });

    /* =====================================================
       UPDATE REPUTATION
       ===================================================== */

    builder

      .addCase(updateStudentReputation.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateStudentReputation.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.success = true;

        state.message =
          action.payload.message || "Reputation updated successfully";

        const reputation = action.payload.reputation;

        if (state.selectedStudent?.profile) {
          state.selectedStudent.profile.reputationPoints = reputation.newPoints;
        }

        const studentId = state.selectedStudent?._id;

        if (studentId) {
          const student = state.students.find((item) => item._id === studentId);

          if (student?.profile) {
            student.profile.reputationPoints = reputation.newPoints;
          }
        }
      })

      .addCase(updateStudentReputation.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to update reputation";
      });

    /* Badge handling removed */

    /* =====================================================
       LEADERBOARD
       ===================================================== */

    builder

      .addCase(fetchStudentLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;
        state.error = null;
      })

      .addCase(fetchStudentLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;

        state.leaderboard = action.payload.leaderboard || [];

        state.leaderboardPagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
      })

      .addCase(fetchStudentLeaderboard.rejected, (state, action) => {
        state.leaderboardLoading = false;

        state.leaderboard = [];

        state.error = action.payload || "Failed to fetch leaderboard";
      });

    /* =====================================================
       COURSE PROGRESS
       ===================================================== */

    builder

      .addCase(fetchStudentCourseProgress.pending, (state) => {
        state.courseProgressLoading = true;
        state.error = null;
      })

      .addCase(fetchStudentCourseProgress.fulfilled, (state, action) => {
        state.courseProgressLoading = false;

        state.studentCourseProgress = action.payload.progress || [];
      })

      .addCase(fetchStudentCourseProgress.rejected, (state, action) => {
        state.courseProgressLoading = false;

        state.studentCourseProgress = [];

        state.error = action.payload || "Failed to fetch course progress";
      });

    /* =====================================================
       QUIZ HISTORY
       ===================================================== */

    builder

      .addCase(fetchStudentQuizHistory.pending, (state) => {
        state.quizHistoryLoading = true;
        state.error = null;
      })

      .addCase(fetchStudentQuizHistory.fulfilled, (state, action) => {
        state.quizHistoryLoading = false;

        state.studentQuizHistory = action.payload.attempts || [];
      })

      .addCase(fetchStudentQuizHistory.rejected, (state, action) => {
        state.quizHistoryLoading = false;

        state.studentQuizHistory = [];

        state.error = action.payload || "Failed to fetch quiz history";
      });
  },
});

export const {
  clearStudentError,
  clearStudentSuccess,
  clearStudentDetails,
  clearStudentState,
} = studentSlice.actions;

export default studentSlice.reducer;

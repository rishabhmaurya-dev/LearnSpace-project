import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPublishedCourses,
  fetchMyEnrolledCourses,
  enrollInCourse,
  fetchCourseLearningData,
  fetchLessonQuiz,
  submitLessonQuiz,
  fetchFinalQuiz,
  submitFinalQuiz,
  fetchMyCapstoneSubmission,
  submitCapstone,
} from "./studentCourseThunks";

const initialState = {
  catalog: [],
  enrolledCourses: [],
  learningData: null,
  lessonQuiz: null,
  lessonQuizResult: null,
  finalQuiz: null,
  finalQuizResult: null,
  capstoneSubmission: null,
  loading: false,
  learningLoading: false,
  quizLoading: false,
  submitting: false,
  enrollLoading: false,
  error: null,
  success: false,
  message: "",
};

const studentCourseSlice = createSlice({
  name: "studentCourse",
  initialState,
  reducers: {
    clearStudentCourseError: (state) => {
      state.error = null;
    },
    clearStudentCourseSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    clearLessonQuiz: (state) => {
      state.lessonQuiz = null;
      state.lessonQuizResult = null;
    },
    clearFinalQuiz: (state) => {
      state.finalQuiz = null;
      state.finalQuizResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload.courses || [];
        state.error = null;
      })
      .addCase(fetchPublishedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch courses";
      });

    builder
      .addCase(fetchMyEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload.courses || [];
        state.error = null;
      })
      .addCase(fetchMyEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch enrolled courses";
      });

    builder
      .addCase(enrollInCourse.pending, (state) => {
        state.enrollLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollLoading = false;
        state.success = true;
        state.message = action.payload.message || "Enrolled successfully";
        state.error = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.enrollLoading = false;
        state.success = false;
        state.error = action.payload || "Failed to enroll";
      });

    builder
      .addCase(fetchCourseLearningData.pending, (state) => {
        state.learningLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseLearningData.fulfilled, (state, action) => {
        state.learningLoading = false;
        state.learningData = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseLearningData.rejected, (state, action) => {
        state.learningLoading = false;
        state.error = action.payload || "Failed to fetch course data";
      });

    builder
      .addCase(fetchLessonQuiz.pending, (state) => {
        state.quizLoading = true;
        state.error = null;
      })
      .addCase(fetchLessonQuiz.fulfilled, (state, action) => {
        state.quizLoading = false;
        state.lessonQuiz = action.payload;
        state.lessonQuizResult = null;
        state.error = null;
      })
      .addCase(fetchLessonQuiz.rejected, (state, action) => {
        state.quizLoading = false;
        state.error = action.payload || "Failed to fetch lesson quiz";
      });

    builder
      .addCase(submitLessonQuiz.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitLessonQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.lessonQuizResult = action.payload;
        state.success = true;
        state.message = action.payload.message || "Lesson quiz submitted";
        state.error = null;

        // Update learningData in place so the UI unlocks without a refresh
        const ld = state.learningData;
        const payload = action.payload;
        if (ld && payload) {
          if (payload.progress) {
            ld.progress.progressPercentage =
              payload.progress.progressPercentage ??
              ld.progress.progressPercentage;
            ld.progress.completedLessons =
              payload.progress.completedLessons ?? ld.progress.completedLessons;
          }

          // Mark the submitted lesson as passed/completed and unlock the next one
          const lessonId = action.meta.arg?.lessonId;
          if (lessonId && Array.isArray(ld.lessons)) {
            const idx = ld.lessons.findIndex((l) => l._id === lessonId);
            if (idx !== -1) {
              const passed = !!payload.result?.passed;
              ld.lessons[idx].isQuizPassed = passed;
              ld.lessons[idx].quizScore = payload.result?.percentage ?? 0;
              if (passed) {
                ld.lessons[idx].isCompleted = true;
                // Unlock the immediate next lesson
                const next = ld.lessons[idx + 1];
                if (next) next.isUnlocked = true;
              }
            }
          }
        }
      })
      .addCase(submitLessonQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload || "Failed to submit lesson quiz";
      });

    builder
      .addCase(fetchFinalQuiz.pending, (state) => {
        state.quizLoading = true;
        state.error = null;
      })
      .addCase(fetchFinalQuiz.fulfilled, (state, action) => {
        state.quizLoading = false;
        state.finalQuiz = action.payload;
        state.finalQuizResult = null;
        state.error = null;
      })
      .addCase(fetchFinalQuiz.rejected, (state, action) => {
        state.quizLoading = false;
        state.error = action.payload || "Failed to fetch final quiz";
      });

    builder
      .addCase(submitFinalQuiz.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitFinalQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.finalQuizResult = action.payload;
        state.success = true;
        state.message = action.payload.message || "Final quiz submitted";
        state.error = null;

        // Update learningData in place so the capstone unlocks without a refresh
        const ld = state.learningData;
        const payload = action.payload;
        if (ld && payload) {
          if (payload.isCapstoneUnlocked !== undefined) {
            ld.progress.isCapstoneUnlocked = payload.isCapstoneUnlocked;
          }
          if (payload.result) {
            ld.progress.isQuizPassed = !!payload.result.passed;
            ld.progress.quizScore = payload.result.percentage ?? 0;
          }
        }
      })
      .addCase(submitFinalQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload || "Failed to submit final quiz";
      });

    builder
      .addCase(fetchMyCapstoneSubmission.fulfilled, (state, action) => {
        state.capstoneSubmission = action.payload.submission || null;
        state.error = null;
      })
      .addCase(fetchMyCapstoneSubmission.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch capstone submission";
      });

    builder
      .addCase(submitCapstone.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitCapstone.fulfilled, (state, action) => {
        state.submitting = false;
        state.capstoneSubmission = action.payload.submission || null;
        state.success = true;
        state.message = action.payload.message || "Capstone submitted";
        state.error = null;
      })
      .addCase(submitCapstone.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload || "Failed to submit capstone";
      });
  },
});

export const {
  clearStudentCourseError,
  clearStudentCourseSuccess,
  clearLessonQuiz,
  clearFinalQuiz,
} = studentCourseSlice.actions;

export default studentCourseSlice.reducer;

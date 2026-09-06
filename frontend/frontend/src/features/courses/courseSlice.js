import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAdminCourses,
  fetchAdminCourseDetails,
  createAdminCourse,
  updateAdminCourse,
  updateCourseCapstone,
  deleteAdminCourse,
  publishAdminCourse,
  unpublishAdminCourse,
  fetchCourseLessons,
  uploadLessonMarkdown,
  uploadLessonWithMcq,
  uploadMultipleLessons,
  deleteLesson,
  uploadLessonMcqCsv,
  fetchLessonMcqs,
  deleteLessonMcqs,
  uploadFinalQuizCsv,
} from "./courseThunks";

const initialState = {
  /* =====================================================
     DATA
     ===================================================== */

  courses: [],

  selectedCourse: null,

  lessons: [],

  selectedLessonMcqs: [],

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  /* =====================================================
     LOADING STATES
     ===================================================== */

  loading: false,

  detailsLoading: false,

  lessonsLoading: false,

  operationLoading: false,

  uploadLoading: false,

  /* =====================================================
     ERROR / SUCCESS
     ===================================================== */

  error: null,

  success: false,

  message: "",
};

const courseSlice = createSlice({
  name: "adminCourse",

  initialState,

  reducers: {
    clearCourseError: (state) => {
      state.error = null;
    },

    clearCourseSuccess: (state) => {
      state.success = false;

      state.message = "";
    },

    resetCourseState: () => initialState,

    resetCourseEditor: (state) => {
      state.selectedCourse = null;

      state.lessons = [];

      state.selectedLessonMcqs = [];

      state.detailsLoading = false;

      state.lessonsLoading = false;

      state.operationLoading = false;

      state.uploadLoading = false;

      state.error = null;

      state.success = false;

      state.message = "";
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL COURSES
       ===================================================== */

    builder
      .addCase(fetchAdminCourses.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchAdminCourses.fulfilled, (state, action) => {
        state.loading = false;

        state.courses = action.payload.courses || [];

        state.pagination = action.payload.pagination || initialState.pagination;
      })

      .addCase(fetchAdminCourses.rejected, (state, action) => {
        state.loading = false;

        state.courses = [];

        state.error = action.payload || "Failed to fetch courses";
      });

    /* =====================================================
       FETCH COURSE DETAILS
       ===================================================== */

    builder
      .addCase(fetchAdminCourseDetails.pending, (state) => {
        state.detailsLoading = true;

        state.error = null;
      })

      .addCase(fetchAdminCourseDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;

        state.selectedCourse = action.payload.course || null;

        state.lessons = action.payload.lessons || [];
      })

      .addCase(fetchAdminCourseDetails.rejected, (state, action) => {
        state.detailsLoading = false;

        state.selectedCourse = null;

        state.lessons = [];

        state.error = action.payload || "Failed to fetch course details";
      });

    /* =====================================================
       CREATE COURSE
       ===================================================== */

    builder
      .addCase(createAdminCourse.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(createAdminCourse.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.selectedCourse = action.payload.course || null;

        state.success = true;

        state.message = action.payload.message || "Course created successfully";
      })

      .addCase(createAdminCourse.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to create course";
      });

    /* =====================================================
       UPDATE COURSE
       ===================================================== */

    builder
      .addCase(updateAdminCourse.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(updateAdminCourse.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.selectedCourse = action.payload.course || state.selectedCourse;

        state.success = true;

        state.message = action.payload.message || "Course updated successfully";
      })

      .addCase(updateAdminCourse.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to update course";
      });

    /* =====================================================
       UPDATE CAPSTONE
       ===================================================== */

    builder
      .addCase(updateCourseCapstone.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(updateCourseCapstone.fulfilled, (state, action) => {
        state.operationLoading = false;

        if (state.selectedCourse) {
          state.selectedCourse.capstoneProject = action.payload.capstoneProject;
        }

        state.success = true;

        state.message =
          action.payload.message || "Capstone details updated successfully";
      })

      .addCase(updateCourseCapstone.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to update capstone";
      });

    /* =====================================================
       DELETE COURSE
       ===================================================== */

    builder
      .addCase(deleteAdminCourse.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(deleteAdminCourse.fulfilled, (state, action) => {
        state.operationLoading = false;

        state.success = true;

        state.message = action.payload.message || "Course deleted successfully";
      })

      .addCase(deleteAdminCourse.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to delete course";
      });

    /* =====================================================
       PUBLISH COURSE
       ===================================================== */

    builder
      .addCase(publishAdminCourse.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(publishAdminCourse.fulfilled, (state, action) => {
        state.operationLoading = false;

        const course = action.payload.course;

        if (course) {
          state.selectedCourse = course;

          state.courses = state.courses.map((c) =>
            c._id === course._id ? course : c,
          );
        }

        state.success = true;

        state.message =
          action.payload.message || "Course published successfully";
      })

      .addCase(publishAdminCourse.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to publish course";
      });

    /* =====================================================
       UNPUBLISH COURSE
       ===================================================== */

    builder
      .addCase(unpublishAdminCourse.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(unpublishAdminCourse.fulfilled, (state, action) => {
        state.operationLoading = false;

        const course = action.payload.course;

        if (course) {
          state.selectedCourse = course;

          state.courses = state.courses.map((c) =>
            c._id === course._id ? course : c,
          );
        }

        state.success = true;

        state.message =
          action.payload.message || "Course unpublished successfully";
      })

      .addCase(unpublishAdminCourse.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to unpublish course";
      });

    /* =====================================================
       FETCH LESSONS
       ===================================================== */

    builder
      .addCase(fetchCourseLessons.pending, (state) => {
        state.lessonsLoading = true;

        state.error = null;
      })

      .addCase(fetchCourseLessons.fulfilled, (state, action) => {
        state.lessonsLoading = false;

        state.lessons = action.payload.lessons || [];
      })

      .addCase(fetchCourseLessons.rejected, (state, action) => {
        state.lessonsLoading = false;

        state.lessons = [];

        state.error = action.payload || "Failed to fetch lessons";
      });

    /* =====================================================
       UPLOAD SINGLE LESSON MARKDOWN
       ===================================================== */

    builder
      .addCase(uploadLessonMarkdown.pending, (state) => {
        state.uploadLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(uploadLessonMarkdown.fulfilled, (state, action) => {
        state.uploadLoading = false;

        state.lessons = [...state.lessons, action.payload.lesson].sort(
          (a, b) => a.lessonNumber - b.lessonNumber,
        );

        state.success = true;

        state.message =
          action.payload.message || "Lesson uploaded successfully";
      })

      .addCase(uploadLessonMarkdown.rejected, (state, action) => {
        state.uploadLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to upload lesson";
      });

    /* =====================================================
       UPLOAD LESSON MARKDOWN + MCQ CSV (combined)
       ===================================================== */

    builder
      .addCase(uploadLessonWithMcq.pending, (state) => {
        state.uploadLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(uploadLessonWithMcq.fulfilled, (state, action) => {
        state.uploadLoading = false;

        const lesson = action.payload.lesson;

        state.lessons = [
          ...state.lessons.filter((l) => l._id !== lesson._id),
          { ...lesson, mcqCount: action.payload.mcqCount || 0 },
        ].sort((a, b) => a.lessonNumber - b.lessonNumber);

        state.success = true;

        state.message =
          action.payload.message || "Lesson uploaded successfully";
      })

      .addCase(uploadLessonWithMcq.rejected, (state, action) => {
        state.uploadLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to upload lesson with MCQs";
      });

    /* =====================================================
       UPLOAD MULTIPLE LESSON MARKDOWN FILES
       ===================================================== */

    builder
      .addCase(uploadMultipleLessons.pending, (state) => {
        state.uploadLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(uploadMultipleLessons.fulfilled, (state, action) => {
        state.uploadLoading = false;

        const uploaded = action.payload.lessons || [];

        state.lessons = [...state.lessons, ...uploaded].sort(
          (a, b) => a.lessonNumber - b.lessonNumber,
        );

        state.success = true;

        state.message =
          action.payload.message || "Lessons uploaded successfully";
      })

      .addCase(uploadMultipleLessons.rejected, (state, action) => {
        state.uploadLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to upload lessons";
      });

    /* =====================================================
       DELETE LESSON
       ===================================================== */

    builder
      .addCase(deleteLesson.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.operationLoading = false;

        const deletedId = action.meta.arg.lessonId;

        state.lessons = state.lessons.filter(
          (lesson) => lesson._id !== deletedId,
        );

        state.success = true;

        state.message =
          action.payload.result?.message || "Lesson deleted successfully";
      })

      .addCase(deleteLesson.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to delete lesson";
      });

    /* =====================================================
       UPLOAD LESSON MCQ CSV
       ===================================================== */

    builder
      .addCase(uploadLessonMcqCsv.pending, (state) => {
        state.uploadLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(uploadLessonMcqCsv.fulfilled, (state, action) => {
        state.uploadLoading = false;

        const lessonId = action.meta.arg.lessonId;

        state.lessons = state.lessons.map((lesson) =>
          lesson._id === lessonId
            ? { ...lesson, mcqCount: action.payload.count }
            : lesson,
        );

        state.success = true;

        state.message =
          action.payload.message || "Lesson MCQs uploaded successfully";
      })

      .addCase(uploadLessonMcqCsv.rejected, (state, action) => {
        state.uploadLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to upload lesson MCQs";
      });

    /* =====================================================
       FETCH LESSON MCQs
       ===================================================== */

    builder
      .addCase(fetchLessonMcqs.pending, (state) => {
        state.lessonsLoading = true;

        state.error = null;
      })

      .addCase(fetchLessonMcqs.fulfilled, (state, action) => {
        state.lessonsLoading = false;

        state.selectedLessonMcqs = action.payload.questions || [];
      })

      .addCase(fetchLessonMcqs.rejected, (state, action) => {
        state.lessonsLoading = false;

        state.selectedLessonMcqs = [];

        state.error = action.payload || "Failed to fetch lesson MCQs";
      });

    /* =====================================================
       DELETE LESSON MCQs
       ===================================================== */

    builder
      .addCase(deleteLessonMcqs.pending, (state) => {
        state.operationLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(deleteLessonMcqs.fulfilled, (state, action) => {
        state.operationLoading = false;

        const lessonId = action.meta.arg.lessonId;

        state.lessons = state.lessons.map((lesson) =>
          lesson._id === lessonId ? { ...lesson, mcqCount: 0 } : lesson,
        );

        state.selectedLessonMcqs = [];

        state.success = true;

        state.message =
          action.payload.result?.message || "Lesson MCQs deleted successfully";
      })

      .addCase(deleteLessonMcqs.rejected, (state, action) => {
        state.operationLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to delete lesson MCQs";
      });

    /* =====================================================
       UPLOAD FINAL QUIZ CSV
       ===================================================== */

    builder
      .addCase(uploadFinalQuizCsv.pending, (state) => {
        state.uploadLoading = true;

        state.success = false;

        state.error = null;
      })

      .addCase(uploadFinalQuizCsv.fulfilled, (state, action) => {
        state.uploadLoading = false;

        state.success = true;

        state.message =
          action.payload.message || "Final quiz uploaded successfully";
      })

      .addCase(uploadFinalQuizCsv.rejected, (state, action) => {
        state.uploadLoading = false;

        state.success = false;

        state.error = action.payload || "Failed to upload final quiz";
      });
  },
});

export const {
  clearCourseError,
  clearCourseSuccess,
  resetCourseState,
  resetCourseEditor,
} = courseSlice.actions;

export default courseSlice.reducer;

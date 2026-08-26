import mongoose from "mongoose";
import { Course } from "../../models/Course.model.js";
import { Lesson } from "../../models/Lesson.model.js";
import { LessonQuizQuestion } from "../../models/LessonQuizQuestion.model.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

/* =========================================================
   CREATE COURSE - STEP 1
   ADMIN ONLY
========================================================= */

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      passingPercentage,
      quizTimeLimitMinutes,
      lessonQuizPassingPercentage,
    } = req.body;

    if (
      !cleanString(title) ||
      !cleanString(category) ||
      !cleanString(description)
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, category and description are required",
      });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail is required",
      });
    }

    const cleanTitle = cleanString(title);

    const existingCourse = await Course.findOne({
      title: cleanTitle,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course with this title already exists",
      });
    }

    const thumbnailUpload = await uploadToCloudinary(
      thumbnailFile.buffer,
      "skillforge/courses/thumbnails",
      "image",
    );

    const course = await Course.create({
      title: cleanTitle,

      category: cleanString(category),

      description: cleanString(description),

      thumbnailUrl: thumbnailUpload.secure_url,

      // skill badges removed

      passingPercentage:
        passingPercentage !== undefined ? Number(passingPercentage) : 70,

      quizTimeLimitMinutes:
        quizTimeLimitMinutes !== undefined ? Number(quizTimeLimitMinutes) : 45,

      lessonQuizPassingPercentage:
        lessonQuizPassingPercentage !== undefined
          ? Number(lessonQuizPassingPercentage)
          : 70,

      createdBy: req.user._id,

      isPublished: false,

      publishedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully as draft",
      course,
    });
  } catch (error) {
    console.error("createCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating course",
      error: error.message,
    });
  }
};

/* =========================================================
   GET ALL COURSES
========================================================= */

export const getAdminCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category, status } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const filter = {};

    if (search.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (status === "PUBLISHED") {
      filter.isPublished = true;
    }

    if (status === "DRAFT") {
      filter.isPublished = false;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Course.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      courses,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getAdminCourses:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
      error: error.message,
    });
  }
};

/* =========================================================
   GET COURSE DETAILS
========================================================= */

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId)
      .populate("createdBy", "name email role")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lessons = await Lesson.find({
      courseId,
    })
      .sort({ lessonNumber: 1 })
      .lean();

    const lessonIds = lessons.map((lesson) => lesson._id);

    const mcqCounts = await LessonQuizQuestion.aggregate([
      {
        $match: {
          lessonId: {
            $in: lessonIds,
          },
        },
      },
      {
        $group: {
          _id: "$lessonId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map(
      mcqCounts.map((item) => [item._id.toString(), item.count]),
    );

    const lessonsWithCounts = lessons.map((lesson) => ({
      ...lesson,
      mcqCount: countMap.get(lesson._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      course,
      lessons: lessonsWithCounts,
    });
  } catch (error) {
    console.error("getCourseById:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching course",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE COURSE DETAILS
   STEP 1 EDIT
========================================================= */

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const {
      title,
      category,
      description,
      passingPercentage,
      quizTimeLimitMinutes,
      lessonQuizPassingPercentage,
    } = req.body;

    if (title !== undefined) {
      const cleanTitle = cleanString(title);

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Course title cannot be empty",
        });
      }

      const duplicate = await Course.findOne({
        title: cleanTitle,
        _id: {
          $ne: courseId,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another course already exists with this title",
        });
      }

      course.title = cleanTitle;
    }

    if (category !== undefined) {
      course.category = cleanString(category);
    }

    if (description !== undefined) {
      course.description = cleanString(description);
    }

    // skillBadge fields removed

    if (passingPercentage !== undefined) {
      const value = Number(passingPercentage);

      if (value < 1 || value > 100) {
        return res.status(400).json({
          success: false,
          message: "Passing percentage must be between 1 and 100",
        });
      }

      course.passingPercentage = value;
    }

    if (quizTimeLimitMinutes !== undefined) {
      const value = Number(quizTimeLimitMinutes);

      if (value < 1) {
        return res.status(400).json({
          success: false,
          message: "Quiz time must be at least 1 minute",
        });
      }

      course.quizTimeLimitMinutes = value;
    }

    if (lessonQuizPassingPercentage !== undefined) {
      const value = Number(lessonQuizPassingPercentage);

      if (value < 1 || value > 100) {
        return res.status(400).json({
          success: false,
          message: "Lesson quiz passing percentage must be between 1 and 100",
        });
      }

      course.lessonQuizPassingPercentage = value;
    }

    const thumbnailFile = req.files?.thumbnail?.[0];

    if (thumbnailFile) {
      const upload = await uploadToCloudinary(
        thumbnailFile.buffer,
        "skillforge/courses/thumbnails",
        "image",
      );

      course.thumbnailUrl = upload.secure_url;
    }

    // skillBadge icon handling removed

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("updateCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating course",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE CAPSTONE
   STEP 4
========================================================= */

export const updateCapstone = async (req, res) => {
  try {
    const { courseId } = req.params;

    const { capstoneTitle, capstoneDescription, submissionRequirements } =
      req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    if (!cleanString(capstoneTitle) || !cleanString(capstoneDescription)) {
      return res.status(400).json({
        success: false,
        message: "Capstone title and description are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.capstoneProject = {
      title: cleanString(capstoneTitle),
      description: cleanString(capstoneDescription),
      submissionRequirements:
        cleanString(submissionRequirements) ||
        "Submit GitHub Repository URL & Live Demo Link",
    };

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Capstone details updated successfully",
      capstoneProject: course.capstoneProject,
    });
  } catch (error) {
    console.error("updateCapstone:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating capstone",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE COURSE
========================================================= */

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Published course cannot be deleted. Unpublish it first.",
      });
    }

    await Lesson.deleteMany({
      courseId: course._id,
    });

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course and related lessons deleted successfully",
    });
  } catch (error) {
    console.error("deleteCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting course",
      error: error.message,
    });
  }
};

/* =========================================================
   PUBLISH COURSE
========================================================= */

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is already published",
      });
    }

    const lessonCount = await Lesson.countDocuments({
      courseId: course._id,
    });

    if (lessonCount === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one lesson is required before publishing",
      });
    }

    /* -----------------------------
       CHECK EACH LESSON MCQ
    ----------------------------- */

    const lessons = await Lesson.find({
      courseId: course._id,
    }).select("_id lessonNumber title");

    const lessonIds = lessons.map((lesson) => lesson._id);

    const mcqStats = await LessonQuizQuestion.aggregate([
      {
        $match: {
          lessonId: {
            $in: lessonIds,
          },
        },
      },
      {
        $group: {
          _id: "$lessonId",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const mcqMap = new Map(
      mcqStats.map((item) => [item._id.toString(), item.count]),
    );

    const lessonsWithoutMcq = lessons.filter(
      (lesson) =>
        !mcqMap.has(lesson._id.toString()) ||
        mcqMap.get(lesson._id.toString()) === 0,
    );

    if (lessonsWithoutMcq.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Every lesson must contain at least one MCQ before publishing",
        lessons: lessonsWithoutMcq,
      });
    }

    /* -----------------------------
       FINAL QUIZ
    ----------------------------- */

    const quizCount = course.quiz.length;

    if (quizCount < 10 || quizCount > 50) {
      return res.status(400).json({
        success: false,
        message: "Final course quiz must contain between 10 and 50 MCQs",
      });
    }

    /* -----------------------------
       CAPSTONE
    ----------------------------- */

    if (
      !course.capstoneProject?.title ||
      !course.capstoneProject?.description
    ) {
      return res.status(400).json({
        success: false,
        message: "Capstone project details are incomplete",
      });
    }

    course.isPublished = true;
    course.publishedAt = new Date();

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      course,
    });
  } catch (error) {
    console.error("publishCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while publishing course",
      error: error.message,
    });
  }
};

/* =========================================================
   UNPUBLISH COURSE
========================================================= */

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is already unpublished",
      });
    }

    course.isPublished = false;
    course.publishedAt = null;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course unpublished successfully",
      course,
    });
  } catch (error) {
    console.error("unpublishCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while unpublishing course",
      error: error.message,
    });
  }
};

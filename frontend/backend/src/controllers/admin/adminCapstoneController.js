import mongoose from "mongoose";

import { CapstoneSubmission } from "../../models/CapstoneSubmission.model.js";
import { Course } from "../../models/Course.model.js";
import { User } from "../../models/User.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";
import { CourseProgress } from "../../models/CourseProgress.model.js";
import { reconcileCertificateIssuedStates } from "../../utils/certificateSync.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// GET ALL CAPSTONE SUBMISSIONS
// Search + Status + Pagination
// ============================================================

export const getCapstoneSubmissions = async (req, res) => {
  try {
    // Sync certificate state so manual DB changes are reflected in the UI.
    await reconcileCertificateIssuedStates();

    const { search = "", status, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    const filter = {};

    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    if (status) {
      const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

      const normalizedStatus = status.toUpperCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid capstone status",
        });
      }

      filter.status = normalizedStatus;
    }

    // --------------------------------------------------------
    // SEARCH
    // Search is performed through aggregation because
    // student/course information is stored as references.
    // --------------------------------------------------------

    const pipeline = [
      {
        $match: filter,
      },

      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },

      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },

      {
        $unwind: {
          path: "$course",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      pipeline.push({
        $match: {
          $or: [
            { "student.name": searchRegex },
            { "student.email": searchRegex },
            { "course.title": searchRegex },
          ],
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: perPage,
            },
          ],

          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    );

    const result = await CapstoneSubmission.aggregate(pipeline);

    const submissions = result[0]?.data || [];
    const total = result[0]?.total?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      submissions,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / perPage),
        totalSubmissions: total,
        perPage,
      },
    });
  } catch (error) {
    console.error("getCapstoneSubmissions:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching capstone submissions",
      error: error.message,
    });
  }
};

// ============================================================
// GET PENDING CAPSTONE SUBMISSIONS
// ============================================================

export const getPendingCapstones = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    const [submissions, total] = await Promise.all([
      CapstoneSubmission.find({
        status: "PENDING",
      })
        .populate("studentId", "name email")
        .populate("courseId", "title category")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      CapstoneSubmission.countDocuments({
        status: "PENDING",
      }),
    ]);

    return res.status(200).json({
      success: true,
      submissions,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / perPage),
        totalSubmissions: total,
        perPage,
      },
    });
  } catch (error) {
    console.error("getPendingCapstones:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending capstones",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE CAPSTONE DETAILS
// ============================================================

export const getCapstoneDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!isValidObjectId(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const submission = await CapstoneSubmission.findById(submissionId)
      .populate("studentId", "name email role isActive createdAt")
      .populate("courseId", "title category description passingPercentage")
      .populate("reviewedBy", "name email");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Capstone submission not found",
      });
    }

    // --------------------------------------------------------
    // STUDENT PROFILE
    // --------------------------------------------------------

    const studentProfile = await StudentProfile.findOne({
      userId: submission.studentId._id,
    }).lean();

    // --------------------------------------------------------
    // COURSE PROGRESS
    // --------------------------------------------------------

    const courseProgress = await CourseProgress.findOne({
      studentId: submission.studentId._id,
      courseId: submission.courseId._id,
    })
      .select(
        "progressPercentage quizScore isQuizPassed isCapstoneUnlocked isCompleted completedLessons lessonProgress",
      )
      .lean();

    return res.status(200).json({
      success: true,
      submission,
      studentProfile,
      courseProgress,
    });
  } catch (error) {
    console.error("getCapstoneDetails:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching capstone details",
      error: error.message,
    });
  }
};

// ============================================================
// APPROVE CAPSTONE
// ============================================================

export const approveCapstone = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback = "" } = req.body;

    if (!isValidObjectId(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const submission = await CapstoneSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Capstone submission not found",
      });
    }

    if (submission.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Capstone is already approved",
      });
    }

    // --------------------------------------------------------
    // VERIFY STUDENT
    // --------------------------------------------------------

    const student = await User.findOne({
      _id: submission.studentId,
      role: "STUDENT",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    // --------------------------------------------------------
    // VERIFY COURSE PROGRESS
    // --------------------------------------------------------

    const progress = await CourseProgress.findOne({
      studentId: submission.studentId,
      courseId: submission.courseId,
    });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: "Course progress record not found",
      });
    }

    if (!progress.isCapstoneUnlocked) {
      return res.status(400).json({
        success: false,
        message: "Capstone is not unlocked for this student yet",
      });
    }

    // --------------------------------------------------------
    // UPDATE CAPSTONE
    // --------------------------------------------------------

    submission.status = "APPROVED";
    submission.adminFeedback = feedback.trim();
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await submission.save();

    // --------------------------------------------------------
    // COMPLETE COURSE
    // --------------------------------------------------------

    progress.isCompleted = true;
    progress.courseCompletedAt = new Date();

    await progress.save();

    // --------------------------------------------------------
    // GET COURSE BADGE INFORMATION
    // --------------------------------------------------------

    const course = await Course.findById(submission.courseId)
      .select("title")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // --------------------------------------------------------
    // UPDATE STUDENT PROFILE
    // --------------------------------------------------------

    const studentProfile = await StudentProfile.findOne({
      userId: submission.studentId,
    });

    if (studentProfile) {
      // COMPLETED COURSE COUNT
      studentProfile.completedCoursesCount += 1;

      await studentProfile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Capstone approved successfully",
      submission,
    });
  } catch (error) {
    console.error("approveCapstone:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while approving capstone",
      error: error.message,
    });
  }
};

// ============================================================
// REJECT CAPSTONE
// ============================================================

export const rejectCapstone = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback } = req.body;

    if (!isValidObjectId(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection feedback is required",
      });
    }

    if (feedback.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Feedback cannot exceed 2000 characters",
      });
    }

    const submission = await CapstoneSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Capstone submission not found",
      });
    }

    if (submission.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Approved capstone cannot be rejected",
      });
    }

    submission.status = "REJECTED";
    submission.adminFeedback = feedback.trim();
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Capstone rejected successfully",
      submission,
    });
  } catch (error) {
    console.error("rejectCapstone:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting capstone",
      error: error.message,
    });
  }
};

// ============================================================
// GET CAPSTONE STATISTICS
// ============================================================

export const getCapstoneStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      CapstoneSubmission.countDocuments(),

      CapstoneSubmission.countDocuments({
        status: "PENDING",
      }),

      CapstoneSubmission.countDocuments({
        status: "APPROVED",
      }),

      CapstoneSubmission.countDocuments({
        status: "REJECTED",
      }),
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        total,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    console.error("getCapstoneStats:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching capstone statistics",
      error: error.message,
    });
  }
};

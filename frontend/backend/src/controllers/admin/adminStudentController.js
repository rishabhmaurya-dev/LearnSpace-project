import mongoose from "mongoose";

import { User } from "../../models/User.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";
import { CourseProgress } from "../../models/CourseProgress.model.js";
import { QuizAttempt } from "../../models/QuizAttempt.model.js";
import { CapstoneSubmission } from "../../models/CapstoneSubmission.model.js";

import { createOrGetStudentProfile } from "../studentController.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   1. GET ALL STUDENTS
   ========================================================= */

export const getStudents = async (req, res) => {
  try {
    const {
      search = "",
      skill = "",
      status = "",
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * perPage;

    /* -----------------------------------------------------
       USER FILTER
    ----------------------------------------------------- */

    const userFilter = {
      role: "STUDENT",
    };

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      userFilter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (status === "ACTIVE") {
      userFilter.isActive = true;
    }

    if (status === "BLOCKED") {
      userFilter.isActive = false;
    }

    /* -----------------------------------------------------
       GET STUDENT USERS
    ----------------------------------------------------- */

    const students = await User.find(userFilter)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({
        [sortBy]: order === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean();

    const studentIds = students.map((student) => student._id);

    /* -----------------------------------------------------
       STUDENT PROFILES
    ----------------------------------------------------- */

    const profileFilter = {
      userId: { $in: studentIds },
    };

    if (skill.trim()) {
      profileFilter.verifiedSkills = {
        $regex: new RegExp(`^${skill.trim()}$`, "i"),
      };
    }

    const profiles = await StudentProfile.find(profileFilter).lean();

    const profileMap = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    /* -----------------------------------------------------
       IF SKILL FILTER IS USED
       ----------------------------------------------------- */

    let filteredStudents = students;

    if (skill.trim()) {
      filteredStudents = students.filter((student) =>
        profileMap.has(student._id.toString()),
      );
    }

    /* -----------------------------------------------------
       TOTAL
    ----------------------------------------------------- */

    const totalStudents = await User.countDocuments(userFilter);

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    const data = filteredStudents.map((student) => {
      const profile = profileMap.get(student._id.toString());

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isActive: student.isActive,
        createdAt: student.createdAt,

        profile: {
          avatar: profile?.avatar || "",
          verifiedSkills: profile?.verifiedSkills || [],
          reputationPoints: profile?.reputationPoints || 0,
          completedCoursesCount: profile?.completedCoursesCount || 0,
          completedProjectsCount: profile?.completedProjectsCount || 0,
        },
      };
    });

    return res.status(200).json({
      success: true,

      students: data,

      pagination: {
        page: currentPage,
        limit: perPage,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / perPage),
      },
    });
  } catch (error) {
    console.error("getStudents:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching students",
      error: error.message,
    });
  }
};

/* =========================================================
   2. GET STUDENT DETAILS
   ========================================================= */

export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    /* -----------------------------------------------------
       USER
    ----------------------------------------------------- */

    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    /* -----------------------------------------------------
       PROFILE
    ----------------------------------------------------- */

    const profile = await StudentProfile.findOne({
      userId: studentId,
    }).lean();

    /* -----------------------------------------------------
       COURSE PROGRESS
    ----------------------------------------------------- */

    const courseProgress = await CourseProgress.find({
      studentId,
    })
      .populate({
        path: "courseId",
        select: "title category thumbnailUrl passingPercentage",
      })
      .populate({
        path: "lastAccessedLessonId",
        select: "lessonNumber title",
      })
      .sort({ updatedAt: -1 })
      .lean();

    /* -----------------------------------------------------
       QUIZ ATTEMPTS
    ----------------------------------------------------- */

    const quizAttempts = await QuizAttempt.find({
      studentId,
    })
      .populate({
        path: "courseId",
        select: "title",
      })
      .populate({
        path: "lessonId",
        select: "lessonNumber title",
      })
      .sort({ submittedAt: -1 })
      .lean();

    /* -----------------------------------------------------
       CAPSTONE SUBMISSIONS
    ----------------------------------------------------- */

    const capstoneSubmissions = await CapstoneSubmission.find({
      studentId,
    })
      .populate({
        path: "courseId",
        select: "title category",
      })
      .populate({
        path: "reviewedBy",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .lean();

    /* -----------------------------------------------------
       LEADERBOARD RANK
    ----------------------------------------------------- */

    let leaderboardRank = null;

    if (profile) {
      leaderboardRank =
        (await StudentProfile.countDocuments({
          reputationPoints: {
            $gt: profile.reputationPoints,
          },
        })) + 1;
    }

    /* -----------------------------------------------------
       SUMMARY
    ----------------------------------------------------- */

    const summary = {
      totalCourses: courseProgress.length,

      completedCourses: courseProgress.filter((course) => course.isCompleted)
        .length,

      totalQuizAttempts: quizAttempts.length,

      passedQuizzes: quizAttempts.filter((quiz) => quiz.passed).length,

      totalCapstoneSubmissions: capstoneSubmissions.length,

      pendingCapstones: capstoneSubmissions.filter(
        (submission) => submission.status === "PENDING",
      ).length,

      approvedCapstones: capstoneSubmissions.filter(
        (submission) => submission.status === "APPROVED",
      ).length,

      rejectedCapstones: capstoneSubmissions.filter(
        (submission) => submission.status === "REJECTED",
      ).length,
    };

    return res.status(200).json({
      success: true,

      student: {
        ...student,

        profile: profile || {
          verifiedSkills: [],
          reputationPoints: 0,
          completedCoursesCount: 0,
          completedProjectsCount: 0,
        },

        leaderboardRank,
      },

      summary,

      courseProgress,

      quizAttempts,

      capstoneSubmissions,
    });
  } catch (error) {
    console.error("getStudentDetails:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching student details",
      error: error.message,
    });
  }
};

/* =========================================================
   3. UPDATE STUDENT STATUS
   ========================================================= */

export const updateStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.isActive = isActive;

    await student.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Student account activated successfully"
        : "Student account blocked successfully",

      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        isActive: student.isActive,
      },
    });
  } catch (error) {
    console.error("updateStudentStatus:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating student status",
      error: error.message,
    });
  }
};

/* =========================================================
   4. UPDATE REPUTATION POINTS
   ========================================================= */

export const updateStudentReputation = async (req, res) => {
  try {
    const { studentId } = req.params;

    const { points, operation, reason = "" } = req.body;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const numericPoints = Number(points);

    if (
      !Number.isFinite(numericPoints) ||
      !Number.isInteger(numericPoints) ||
      numericPoints <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Points must be a positive integer",
      });
    }

    if (!["ADD", "SUBTRACT", "SET"].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: "Operation must be ADD, SUBTRACT or SET",
      });
    }

    if (reason.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Reason cannot exceed 500 characters",
      });
    }

    const profile = await createOrGetStudentProfile(studentId);

    const oldPoints = profile.reputationPoints;

    if (operation === "ADD") {
      profile.reputationPoints += numericPoints;
    }

    if (operation === "SUBTRACT") {
      profile.reputationPoints = Math.max(
        0,
        profile.reputationPoints - numericPoints,
      );
    }

    if (operation === "SET") {
      profile.reputationPoints = numericPoints;
    }

    await profile.save();

    return res.status(200).json({
      success: true,

      message: "Student reputation updated successfully",

      reason: reason.trim(),

      reputation: {
        oldPoints,
        newPoints: profile.reputationPoints,
        operation,
      },
    });
  } catch (error) {
    console.error("updateStudentReputation:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating student reputation",
      error: error.message,
    });
  }
};

/* Badge-related endpoints removed */

/* =========================================================
   7. GET STUDENT LEADERBOARD
   ========================================================= */

export const getStudentLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", skill = "" } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (currentPage - 1) * perPage;

    /* -----------------------------------------------------
       SEARCH USER IDs
    ----------------------------------------------------- */

    let userIds = null;

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const users = await User.find({
        role: "STUDENT",
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select("_id");

      userIds = users.map((user) => user._id);
    }

    /* -----------------------------------------------------
       PROFILE FILTER
    ----------------------------------------------------- */

    const filter = {};

    if (userIds) {
      filter.userId = {
        $in: userIds,
      };
    }

    if (skill.trim()) {
      filter.verifiedSkills = {
        $regex: new RegExp(`^${skill.trim()}$`, "i"),
      };
    }

    /* -----------------------------------------------------
       LEADERBOARD
    ----------------------------------------------------- */

    const profiles = await StudentProfile.find(filter)
      .populate({
        path: "userId",
        select: "name email isActive createdAt",
        match: {
          role: "STUDENT",
        },
      })
      .sort({
        reputationPoints: -1,
        completedCoursesCount: -1,
        completedProjectsCount: -1,
        createdAt: 1,
      })
      .skip(skip)
      .limit(perPage)
      .lean();

    const validProfiles = profiles.filter((profile) => profile.userId);

    const total = await StudentProfile.countDocuments(filter);

    /* -----------------------------------------------------
       RANK
    ----------------------------------------------------- */

    const leaderboard = validProfiles.map((profile, index) => ({
      rank: skip + index + 1,

      studentId: profile.userId._id,

      name: profile.userId.name,

      email: profile.userId.email,

      isActive: profile.userId.isActive,

      avatar: profile.avatar,

      verifiedSkills: profile.verifiedSkills,

      reputationPoints: profile.reputationPoints,

      completedCoursesCount: profile.completedCoursesCount,

      completedProjectsCount: profile.completedProjectsCount,
    }));

    return res.status(200).json({
      success: true,

      leaderboard,

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("getStudentLeaderboard:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leaderboard",
      error: error.message,
    });
  }
};

/* =========================================================
   8. GET STUDENT COURSE PROGRESS
   ========================================================= */

export const getStudentCourseProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    }).select("_id name email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const progress = await CourseProgress.find({
      studentId,
    })
      .populate({
        path: "courseId",
        select: "title category thumbnailUrl passingPercentage",
      })
      .populate({
        path: "lastAccessedLessonId",
        select: "lessonNumber title topicHeading",
      })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,

      student,

      progress,
    });
  } catch (error) {
    console.error("getStudentCourseProgress:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching course progress",
      error: error.message,
    });
  }
};

/* =========================================================
   9. GET STUDENT QUIZ HISTORY
   ========================================================= */

export const getStudentQuizHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    }).select("_id name email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attempts = await QuizAttempt.find({
      studentId,
    })
      .populate({
        path: "courseId",
        select: "title",
      })
      .populate({
        path: "lessonId",
        select: "lessonNumber title topicHeading",
      })
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,

      student,

      attempts,
    });
  } catch (error) {
    console.error("getStudentQuizHistory:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz history",
      error: error.message,
    });
  }
};

import { User } from "../../models/User.model.js";
import { Course } from "../../models/Course.model.js";
import { Lesson } from "../../models/Lesson.model.js";
import { Certificate } from "../../models/Certificate.model.js";
import { CapstoneSubmission } from "../../models/CapstoneSubmission.model.js";
import { StudentProfile } from "../../models/StudentProfile.model.js";

// ============================================================
// HELPERS — monthly buckets for growth trends
// ============================================================

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const buildMonthBuckets = (months = 6) => {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - index),
      1,
    );

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `${MONTH_LABELS[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`,
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    };
  });
};

const buildMonthlySeries = (buckets, docs) => {
  const counts = new Map();

  for (const doc of docs) {
    const created = doc.createdAt ? new Date(doc.createdAt) : null;

    if (!created) continue;

    const key = `${created.getFullYear()}-${created.getMonth()}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    count: counts.get(bucket.key) || 0,
  }));
};

// ============================================================
// ADMIN DASHBOARD OVERVIEW
// Counters + growth trends + category distribution
// ============================================================

export const getAdminDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const buckets = buildMonthBuckets(6);
    const trendStart = buckets[0].start;

    const [
      totalStudents,
      newStudentsWeek,
      newStudentsMonth,
      totalCourses,
      activeCourses,
      draftCourses,
      newCoursesMonth,
      totalLessons,
      publishedLessons,
      pendingCapstones,
      approvedCapstones,
      rejectedCapstones,
      totalCertificates,
      newCertificatesMonth,
      revokedCertificates,
      studentTrendDocs,
      courseTrendDocs,
      certificateTrendDocs,
      categories,
    ] = await Promise.all([
      User.countDocuments({ role: "STUDENT" }),
      User.countDocuments({
        role: "STUDENT",
        createdAt: { $gte: startOfWeek },
      }),
      User.countDocuments({
        role: "STUDENT",
        createdAt: { $gte: startOfMonth },
      }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Course.countDocuments({ isPublished: false }),
      Course.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Lesson.countDocuments(),
      Lesson.countDocuments({ isPublished: true }),
      CapstoneSubmission.countDocuments({ status: "PENDING" }),
      CapstoneSubmission.countDocuments({ status: "APPROVED" }),
      CapstoneSubmission.countDocuments({ status: "REJECTED" }),
      Certificate.countDocuments(),
      Certificate.countDocuments({ issueDate: { $gte: startOfMonth } }),
      Certificate.countDocuments({ status: "REVOKED" }),
      User.find({ role: "STUDENT", createdAt: { $gte: trendStart } })
        .select("createdAt")
        .lean(),
      Course.find({ createdAt: { $gte: trendStart } })
        .select("createdAt")
        .lean(),
      Certificate.find({ issueDate: { $gte: trendStart } })
        .select("issueDate")
        .lean()
        .then((docs) =>
          docs.map((doc) => ({ createdAt: doc.issueDate || doc.createdAt })),
        ),
      Course.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 6 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        students: {
          total: totalStudents,
          newThisWeek: newStudentsWeek,
          newThisMonth: newStudentsMonth,
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          draft: draftCourses,
          newThisMonth: newCoursesMonth,
        },
        lessons: {
          total: totalLessons,
          published: publishedLessons,
        },
        capstones: {
          pending: pendingCapstones,
          approved: approvedCapstones,
          rejected: rejectedCapstones,
        },
        certificates: {
          total: totalCertificates,
          newThisMonth: newCertificatesMonth,
          revoked: revokedCertificates,
        },
      },

      /* 6-month growth series for the line chart */
      growth: {
        students: buildMonthlySeries(buckets, studentTrendDocs),
        courses: buildMonthlySeries(buckets, courseTrendDocs),
        certificates: buildMonthlySeries(buckets, certificateTrendDocs),
      },

      /* top course categories for the doughnut chart */
      categories: categories.map((category) => ({
        name: category._id || "Uncategorised",
        count: category.count,
      })),
    });
  } catch (error) {
    console.error("getAdminDashboardStats:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN DASHBOARD - PENDING ITEMS
// ============================================================

export const getAdminPendingItems = async (req, res) => {
  try {
    const pendingCapstones = await CapstoneSubmission.find({
      status: "PENDING",
    })
      .populate("studentId", "name email")
      .populate("courseId", "title category")
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      pendingCapstones,
    });
  } catch (error) {
    console.error("getAdminPendingItems:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching pending items",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN DASHBOARD - RECENT ACTIVITY FEED
// Merged timeline of courses / certificates / capstones
// ============================================================

export const getAdminActivity = async (req, res) => {
  try {
    const limitPerSource = 6;

    const [recentCourses, recentCertificates, recentSubmissions] =
      await Promise.all([
        Course.find()
          .sort({ createdAt: -1 })
          .limit(limitPerSource)
          .select("title category isPublished createdAt")
          .lean(),

        Certificate.find()
          .sort({ issueDate: -1 })
          .limit(limitPerSource)
          .select("studentName title courseId issueDate")
          .populate("courseId", "title")
          .lean(),

        CapstoneSubmission.find()
          .sort({ createdAt: -1 })
          .limit(limitPerSource)
          .populate("studentId", "name email")
          .populate("courseId", "title")
          .lean(),
      ]);

    const activity = [
      ...recentCourses.map((course) => ({
        _id: `course-${course._id}`,
        type: "COURSE_CREATED",
        title: course.title,
        subtitle: course.category || "",
        date: course.createdAt,
        linkId: course._id,
      })),

      ...recentCertificates.map((certificate) => ({
        _id: `certificate-${certificate._id}`,
        type: "CERTIFICATE_ISSUED",
        title: certificate.studentName,
        subtitle:
          certificate.courseId?.title || certificate.title || "Certificate",
        date: certificate.issueDate || certificate.createdAt,
        linkId: certificate._id,
      })),

      ...recentSubmissions.map((submission) => ({
        _id: `capstone-${submission._id}`,
        type:
          submission.status === "APPROVED"
            ? "CAPSTONE_APPROVED"
            : submission.status === "REJECTED"
              ? "CAPSTONE_REJECTED"
              : "CAPSTONE_SUBMITTED",
        title: submission.studentId?.name || "Unknown Student",
        subtitle: submission.courseId?.title || "",
        date: submission.reviewedAt || submission.createdAt,
        linkId: submission._id,
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("getAdminActivity:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching recent activity",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN LEADERBOARD
// Reputation + Completed Courses + Completed Projects
// ============================================================

export const getAdminLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const leaderboard = await StudentProfile.aggregate([
      {
        $sort: {
          reputationPoints: -1,
          completedCoursesCount: -1,
          completedProjectsCount: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          studentId: "$userId",
          name: "$student.name",
          email: "$student.email",
          avatar: 1,
          reputationPoints: 1,
          completedCoursesCount: 1,
          completedProjectsCount: 1,
          /* skillBadges removed */
          verifiedSkills: 1,
        },
      },
    ]);

    const rankedLeaderboard = leaderboard.map((student, index) => ({
      rank: index + 1,
      ...student,
    }));

    return res.status(200).json({
      success: true,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    console.error("getAdminLeaderboard:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leaderboard",
      error: error.message,
    });
  }
};

// ============================================================
// COURSE OVERVIEW
// ============================================================

export const getCourseOverview = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("title category thumbnailUrl isPublished publishedAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const courseOverview = await Promise.all(
      courses.map(async (course) => {
        const [lessonCount, publishedLessonCount, capstoneCount] =
          await Promise.all([
            Lesson.countDocuments({ courseId: course._id }),
            Lesson.countDocuments({ courseId: course._id, isPublished: true }),
            CapstoneSubmission.countDocuments({ courseId: course._id }),
          ]);

        return {
          ...course,
          statistics: {
            totalLessons: lessonCount,
            publishedLessons: publishedLessonCount,
            capstoneSubmissions: capstoneCount,
          },
        };
      }),
    );

    return res.status(200).json({
      success: true,
      courses: courseOverview,
    });
  } catch (error) {
    console.error("getCourseOverview:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching course overview",
      error: error.message,
    });
  }
};

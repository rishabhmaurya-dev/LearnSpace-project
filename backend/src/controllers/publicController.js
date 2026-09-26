import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";
import { CourseProgress } from "../models/CourseProgress.model.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * GET /api/public/courses
 * Unauthenticated endpoint used by the marketing landing page.
 * Returns published courses only — no viewer specific fields.
 */
export const getPublicCourses = async (req, res) => {
  try {
    const { category, search, limit } = req.query;

    const filter = { isPublished: true };

    if (category && category !== "ALL") {
      filter.category = category;
    }

    if (search) {
      const rx = new RegExp(escapeRegex(String(search).trim()), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }

    let query = Course.find(filter).sort({ publishedAt: -1 }).lean();

    if (limit) {
      query = query.limit(Math.min(Math.max(Number(limit) || 1, 1), 50));
    }

    const courses = await query;

    const courseIds = courses.map((c) => c._id);

    const [lessonCounts, enrolledCounts, categoryRows, total] = await Promise.all([
      Lesson.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
      ]),
      CourseProgress.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
      ]),
      Course.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Course.countDocuments({ isPublished: true }),
    ]);

    const lessonMap = new Map(lessonCounts.map((r) => [r._id.toString(), r.count]));
    const enrolledMap = new Map(enrolledCounts.map((r) => [r._id.toString(), r.count]));

    const enriched = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      category: course.category,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      lessonCount: lessonMap.get(course._id.toString()) || 0,
      quizCount: (course.quiz || []).length,
      hasCapstone: !!course.capstoneProject?.title,
      enrolledCount: enrolledMap.get(course._id.toString()) || 0,
      publishedAt: course.publishedAt,
    }));

    return res.status(200).json({
      success: true,
      courses: enriched,
      categories: categoryRows.map((row) => ({
        name: row._id,
        count: row.count,
      })),
      total,
    });
  } catch (error) {
    console.error("getPublicCourses:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
      error: error.message,
    });
  }
};

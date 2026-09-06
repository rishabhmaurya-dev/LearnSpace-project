import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import { Certificate } from "../models/Certificate.model.js";

export async function getAdminPlatformStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    activeStudents,
    totalCourses,
    publishedCourses,
    totalLessons,
    pendingCapstones,
    approvedCapstones,
    totalCertificates,
    certificatesThisMonth,
  ] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "STUDENT", isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Lesson.countDocuments(),
    CapstoneSubmission.countDocuments({ status: "PENDING" }),
    CapstoneSubmission.countDocuments({ status: "APPROVED" }),
    Certificate.countDocuments(),
    Certificate.countDocuments({ issueDate: { $gte: startOfMonth } }),
  ]);

  return {
    totalStudents,
    activeStudents,
    totalCourses,
    publishedCourses,
    totalLessons,
    pendingCapstones,
    approvedCapstones,
    totalCertificates,
    certificatesThisMonth,
  };
}

export function formatAdminStats(stats) {
  if (!stats) return "";
  const n = (v) => (v == null ? "unknown" : v);
  return `
LIVE PLATFORM STATS (right now, from the database):

- Total students: ${n(stats.totalStudents)}
- Active students: ${n(stats.activeStudents)}
- Total courses: ${n(stats.totalCourses)}
- Published courses: ${n(stats.publishedCourses)}
- Total lessons: ${n(stats.totalLessons)}
- Pending capstone reviews: ${n(stats.pendingCapstones)}
- Approved capstones: ${n(stats.approvedCapstones)}
- Total certificates issued: ${n(stats.totalCertificates)}
- Certificates issued this month: ${n(stats.certificatesThisMonth)}

Use these EXACT numbers when the user asks for platform/aggregate counts.
Only the current logged-in admin is allowed to see these. Do not reveal any
individual student's personal data.`;
}

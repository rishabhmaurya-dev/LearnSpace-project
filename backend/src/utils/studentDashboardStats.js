import { CourseProgress } from "../models/CourseProgress.model.js";
import { Certificate } from "../models/Certificate.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import { StudentProfile } from "../models/StudentProfile.model.js";

export async function getStudentDashboardStats(studentId) {
  const [progresses, certificates, capstones, profile] = await Promise.all([
    CourseProgress.find({ studentId }).lean(),
    Certificate.find({ studentId, status: { $ne: "REVOKED" } }).lean(),
    CapstoneSubmission.find({ studentId }).lean(),
    StudentProfile.findOne({ userId: studentId }).lean(),
  ]);

  const progressByStatus = progresses.reduce(
    (acc, p) => {
      if (p.isCompleted) acc.completed += 1;
      else acc.inProgress += 1;
      return acc;
    },
    { completed: 0, inProgress: 0 },
  );

  const capstoneByStatus = capstones.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const totalProgress = progresses.reduce(
    (sum, p) => sum + (p.progressPercentage || 0),
    0,
  );
  const overallProgress =
    progresses.length > 0 ? Math.round(totalProgress / progresses.length) : 0;

  return {
    enrolledCourses: progresses.length,
    completedCourses: progressByStatus.completed,
    inProgressCourses: progressByStatus.inProgress,
    overallProgress,
    certificates: certificates.length,
    capstoneSubmissions: capstones.length,
    pendingCapstones: capstoneByStatus["PENDING"] || 0,
    approvedCapstones: capstoneByStatus["APPROVED"] || 0,
    rejectedCapstones: capstoneByStatus["REJECTED"] || 0,
    reputation: profile?.reputationPoints ?? null,
    completedCoursesCount: profile?.completedCoursesCount ?? null,
    completedProjectsCount: profile?.completedProjectsCount ?? null,
  };
}

export function formatStudentStats(stats) {
  if (!stats) return "";
  const n = (v) => (v == null ? "not available" : v);
  return `
YOUR LIVE DASHBOARD STATS (for the currently logged-in student, right now):

- Courses you are enrolled in: ${n(stats.enrolledCourses)}
- Courses completed: ${n(stats.completedCourses)}
- Courses in progress: ${n(stats.inProgressCourses)}
- Your overall course progress: ${n(stats.overallProgress)}%
- Certificates earned: ${n(stats.certificates)}
- Capstone submissions: ${n(stats.capstoneSubmissions)}
- Pending capstones: ${n(stats.pendingCapstones)}
- Approved capstones: ${n(stats.approvedCapstones)}
- Rejected capstones: ${n(stats.rejectedCapstones)}
- Reputation points: ${n(stats.reputation)}
- Completed courses count (profile): ${n(stats.completedCoursesCount)}
- Completed projects count (profile): ${n(stats.completedProjectsCount)}

Use these EXACT numbers to answer questions about the current student's OWN
data (their dashboard, their enrolled/completed courses, their certificates,
their capstones). NEVER reveal or guess any OTHER student's data — these
numbers are only for the currently logged-in student.`;
}

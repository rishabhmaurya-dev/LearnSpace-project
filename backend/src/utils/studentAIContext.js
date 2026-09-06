import { CourseProgress } from "../models/CourseProgress.model.js";
import { Certificate } from "../models/Certificate.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import { StudentProfile } from "../models/StudentProfile.model.js";
import { QuizAttempt } from "../models/QuizAttempt.model.js";

// Rich student context — data-minimized, scoped to the authenticated student.
// Only selection-needed fields are queried, never sensitive fields.

// Collect the current authenticated student's relevant LearnSpace data.
export async function getStudentContext(studentId) {
  const [progresses, certificates, capstones, profile, recentQuizAttempts] =
    await Promise.all([
      // 1. Enrolled courses + progress
      CourseProgress.find({ studentId })
        .populate("courseId", "title category description")
        .select(
          "courseId progressPercentage quizScore isQuizPassed isCapstoneUnlocked isCompleted completedLessons lessonProgress finalQuizAttempts enrolledAt updatedAt",
        )
        .sort({ updatedAt: -1 })
        .lean(),

      // 2. Certificates (non-revoked only)
      Certificate.find({ studentId, status: { $ne: "REVOKED" } })
        .select("title certificateCode issueDate courseId")
        .sort({ issueDate: -1 })
        .lean(),

      // 3. Capstone submissions
      CapstoneSubmission.find({ studentId })
        .populate("courseId", "title")
        .select("courseId status githubRepoUrl liveDemoUrl submissionVersion reviewedAt createdAt")
        .sort({ createdAt: -1 })
        .lean(),

      // 4. Student profile (safe fields only)
      StudentProfile.findOne({ userId: studentId })
        .select("bio githubProfile linkedinProfile verifiedSkills reputationPoints completedCoursesCount completedProjectsCount")
        .lean(),

      // 5. Recent quiz attempts (last 10)
      QuizAttempt.find({ studentId })
        .populate("courseId", "title")
        .populate({
          path: "lessonId",
          model: "Lesson",
          select: "title lessonNumber",
        })
        .select("courseId lessonId quizType percentage passed submittedAt")
        .sort({ submittedAt: -1 })
        .limit(10)
        .lean(),
    ]);

  // --- Compute summary stats ---

  const enrolledCourses = progresses.length;
  const completedCourses = progresses.filter((p) => p.isCompleted).length;
  const inProgressCourses = enrolledCourses - completedCourses;

  const totalProgress = progresses.reduce(
    (sum, p) => sum + (p.progressPercentage || 0),
    0,
  );
  const overallProgress =
    enrolledCourses > 0 ? Math.round(totalProgress / enrolledCourses) : 0;

  const totalLessonsCompleted = progresses.reduce(
    (sum, p) => sum + (p.completedLessons?.length || 0),
    0,
  );

  const passedQuizScores = progresses
    .filter((p) => p.isQuizPassed && Number(p.quizScore) > 0)
    .map((p) => Number(p.quizScore));

  const avgQuizScore =
    passedQuizScores.length > 0
      ? Math.round(
          passedQuizScores.reduce((sum, score) => sum + score, 0) /
            passedQuizScores.length,
        )
      : 0;

  const capstoneByStatus = capstones.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // --- Build per-course detail ---

  const coursesDetail = progresses.map((p) => {
    const totalLessons = p.lessonProgress?.length || 0;
    const completedLessonCount = p.completedLessons?.length || 0;

    // Find incomplete lessons from lessonProgress
    const incompleteLessons = (p.lessonProgress || [])
      .filter((lp) => !lp.isCompleted)
      .map((lp) => ({
        lessonId: lp.lessonId,
        quizScore: lp.quizScore || 0,
        isQuizPassed: lp.isQuizPassed || false,
      }));

    return {
      courseTitle: p.courseId?.title || "Unknown course",
      courseCategory: p.courseId?.category || "",
      progressPercentage: p.progressPercentage || 0,
      isCompleted: !!p.isCompleted,
      isQuizPassed: !!p.isQuizPassed,
      finalQuizScore: p.quizScore || 0,
      finalQuizAttempts: p.finalQuizAttempts || 0,
      isCapstoneUnlocked: !!p.isCapstoneUnlocked,
      totalLessons,
      completedLessons: completedLessonCount,
      incompleteLessons: incompleteLessons.slice(0, 5),
      enrolledAt: p.enrolledAt,
    };
  });

  // --- Certificates detail ---

  const certificatesDetail = certificates.map((c) => ({
    courseTitle: c.courseId || "",
    certificateTitle: c.title || "",
    certificateCode: c.certificateCode || "",
    issuedAt: c.issueDate,
  }));

  // --- Capstone detail ---

  const capstonesDetail = capstones.map((c) => ({
    courseTitle: c.courseId?.title || "Unknown course",
    status: c.status,
    submissionVersion: c.submissionVersion,
    reviewedAt: c.reviewedAt,
    submittedAt: c.createdAt,
  }));

  // --- Quiz attempts detail ---

  const quizAttemptsDetail = recentQuizAttempts.map((q) => ({
    courseTitle: q.courseId?.title || "Unknown course",
    lessonTitle: q.lessonId?.title || null,
    lessonNumber: q.lessonId?.lessonNumber || null,
    quizType: q.quizType,
    percentage: q.percentage,
    passed: q.passed,
    submittedAt: q.submittedAt,
  }));

  return {
    // Summary
    enrolledCourses,
    completedCourses,
    inProgressCourses,
    overallProgress,
    totalLessonsCompleted,
    avgQuizScore,
    certificatesCount: certificates.length,
    capstoneSubmissions: capstones.length,
    pendingCapstones: capstoneByStatus["PENDING"] || 0,
    approvedCapstones: capstoneByStatus["APPROVED"] || 0,
    rejectedCapstones: capstoneByStatus["REJECTED"] || 0,

    // Profile (safe fields)
    profile: profile
      ? {
          bio: profile.bio || "",
          githubProfile: profile.githubProfile || "",
          linkedinProfile: profile.linkedinProfile || "",
          verifiedSkills: profile.verifiedSkills || [],
          reputationPoints: profile.reputationPoints || 0,
          completedCoursesCount: profile.completedCoursesCount || 0,
          completedProjectsCount: profile.completedProjectsCount || 0,
        }
      : null,

    // Per-course detail
    coursesDetail,

    // Certificates detail
    certificatesDetail,

    // Capstone detail
    capstonesDetail,

    // Quiz attempts detail
    quizAttemptsDetail,
  };
}

// Format the student context into an LLM-readable string.
export function formatStudentContext(ctx, studentName) {
  if (!ctx) return "";

  const lines = [];

  lines.push(
    `THE CURRENT STUDENT'S LIVE LEARNSPACE DATA (from the database, right now):`,
  );
  lines.push(`Student name: ${studentName}`);
  lines.push("");

  // Summary
  lines.push("--- SUMMARY ---");
  lines.push(`Enrolled courses: ${ctx.enrolledCourses}`);
  lines.push(`Completed courses: ${ctx.completedCourses}`);
  lines.push(`Courses in progress: ${ctx.inProgressCourses}`);
  lines.push(`Overall progress: ${ctx.overallProgress}%`);
  lines.push(`Total lessons completed: ${ctx.totalLessonsCompleted}`);
  lines.push(`Average quiz score: ${ctx.avgQuizScore}%`);
  lines.push(`Certificates earned: ${ctx.certificatesCount}`);
  lines.push(`Capstone submissions: ${ctx.capstoneSubmissions}`);
  lines.push(
    `Capstones — pending: ${ctx.pendingCapstones}, approved: ${ctx.approvedCapstones}, rejected: ${ctx.rejectedCapstones}`,
  );
  lines.push("");

  // Profile
  if (ctx.profile) {
    lines.push("--- PROFILE ---");
    if (ctx.profile.bio) lines.push(`Bio: ${ctx.profile.bio}`);
    if (ctx.profile.githubProfile)
      lines.push(`GitHub: ${ctx.profile.githubProfile}`);
    if (ctx.profile.linkedinProfile)
      lines.push(`LinkedIn: ${ctx.profile.linkedinProfile}`);
    if (ctx.profile.verifiedSkills.length > 0)
      lines.push(`Verified skills: ${ctx.profile.verifiedSkills.join(", ")}`);
    lines.push(`Reputation points: ${ctx.profile.reputationPoints}`);
    lines.push(
      `Completed courses (profile): ${ctx.profile.completedCoursesCount}`,
    );
    lines.push(
      `Completed projects (profile): ${ctx.profile.completedProjectsCount}`,
    );
    lines.push("");
  }

  // Per-course detail
  if (ctx.coursesDetail.length > 0) {
    lines.push("--- ENROLLED COURSES (per-course detail) ---");
    ctx.coursesDetail.forEach((c) => {
      lines.push(
        `Course: "${c.courseTitle}" | Category: ${c.courseCategory || "N/A"} | Progress: ${c.progressPercentage}% | Lessons: ${c.completedLessons}/${c.totalLessons} completed`,
      );
      lines.push(
        `  Final quiz passed: ${c.isQuizPassed ? "Yes" : "No"} | Final quiz score: ${c.finalQuizScore}% | Attempts: ${c.finalQuizAttempts} | Capstone unlocked: ${c.isCapstoneUnlocked ? "Yes" : "No"} | Completed: ${c.isCompleted ? "Yes" : "No"}`,
      );
      if (c.incompleteLessons.length > 0) {
        lines.push(
          `  Incomplete lessons: ${c.incompleteLessons.map((il) => `lesson ${il.lessonId} (quiz score: ${il.quizScore}%, passed: ${il.isQuizPassed})`).join("; ")}`,
        );
      }
    });
    lines.push("");
  }

  // Certificates
  if (ctx.certificatesDetail.length > 0) {
    lines.push("--- CERTIFICATES ---");
    ctx.certificatesDetail.forEach((c) => {
      lines.push(
        `Certificate: "${c.certificateTitle || c.courseTitle}" | Code: ${c.certificateCode} | Issued: ${c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : "N/A"}`,
      );
    });
    lines.push("");
  }

  // Capstones
  if (ctx.capstonesDetail.length > 0) {
    lines.push("--- CAPSTONE SUBMISSIONS ---");
    ctx.capstonesDetail.forEach((c) => {
      lines.push(
        `Course: "${c.courseTitle}" | Status: ${c.status} | Version: ${c.submissionVersion} | Submitted: ${c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "N/A"}`,
      );
    });
    lines.push("");
  }

  // Quiz attempts
  if (ctx.quizAttemptsDetail.length > 0) {
    lines.push("--- RECENT QUIZ ATTEMPTS ---");
    ctx.quizAttemptsDetail.forEach((q) => {
      const lessonPart = q.lessonTitle
        ? ` | Lesson: "${q.lessonTitle}" (#${q.lessonNumber})`
        : "";
      lines.push(
        `Course: "${q.courseTitle}"${lessonPart} | Type: ${q.quizType} | Score: ${q.percentage}% | Passed: ${q.passed ? "Yes" : "No"} | Date: ${q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : "N/A"}`,
      );
    });
    lines.push("");
  }

  lines.push(
    "Use these EXACT numbers/details to answer questions about THIS student's OWN LearnSpace data.",
  );
  lines.push(
    "NEVER reveal or guess ANY OTHER student's data. These records belong solely to the currently authenticated student.",
  );

  return lines.join("\n");
}

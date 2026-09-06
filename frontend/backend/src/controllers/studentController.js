import mongoose from "mongoose";
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";
import { LessonQuizQuestion } from "../models/LessonQuizQuestion.model.js";
import { StudentProfile } from "../models/StudentProfile.model.js";
import { CourseProgress } from "../models/CourseProgress.model.js";
import { QuizAttempt } from "../models/QuizAttempt.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import { Certificate } from "../models/Certificate.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =========================================================
   PROFILE HELPERS
========================================================= */

export const createOrGetStudentProfile = async (studentId) => {
  let profile = await StudentProfile.findOne({
    userId: studentId,
  });

  if (profile) {
    return profile;
  }

  profile = await StudentProfile.create({
    userId: studentId,
  });

  return profile;
};

/* =========================================================
   1. GET MY STUDENT PROFILE
========================================================= */

export const getMyStudentProfile = async (req, res) => {
  try {
    const profile = await createOrGetStudentProfile(req.user._id);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("getMyStudentProfile:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};

/* =========================================================
   2. UPDATE MY STUDENT PROFILE
========================================================= */

export const updateMyStudentProfile = async (req, res) => {
  try {
    const { bio, githubProfile, linkedinProfile } = req.body;

    const profile = await createOrGetStudentProfile(req.user._id);

    if (bio !== undefined) profile.bio = bio.trim();
    if (githubProfile !== undefined)
      profile.githubProfile = githubProfile.trim();
    if (linkedinProfile !== undefined)
      profile.linkedinProfile = linkedinProfile.trim();

    // Upload avatar if provided
    if (req.files?.avatar) {
      const avatarResult = await uploadToCloudinary(
        req.files.avatar[0].buffer,
        "student-avatars",
      );
      profile.avatar = avatarResult.secure_url;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("updateMyStudentProfile:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

/* =========================================================
   3. GET DASHBOARD OVERVIEW
========================================================= */

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const profile = await createOrGetStudentProfile(studentId);

    const [progresses, certificates, capstoneCounts] = await Promise.all([
      CourseProgress.find({ studentId })
        .populate("courseId", "title category thumbnailUrl")
        .lean(),

      Certificate.find({ studentId, status: { $ne: "REVOKED" } })
        .select("title metadata issueDate certificateCode")
        .sort({ issueDate: -1 })
        .lean(),

      CapstoneSubmission.aggregate([
        { $match: { studentId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    /* ---------------- CORE STATS ---------------- */

    const enrolledCourses = progresses.length;

    const completedCourses = progresses.filter((p) => p.isCompleted).length;

    const totalProgress = progresses.reduce(
      (sum, p) => sum + (p.progressPercentage || 0),
      0,
    );

    const overallProgress =
      progresses.length > 0 ? Math.round(totalProgress / progresses.length) : 0;

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

    const capstoneSummary = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

    capstoneCounts.forEach((entry) => {
      if (entry?._id && entry._id in capstoneSummary) {
        capstoneSummary[entry._id] = entry.count;
      }
    });

    /* ---------------- RECENT COURSES (ENRICHED) ---------------- */

    const recentCourses = [...progresses]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6)
      .map((p) => ({
        courseId: p.courseId?._id || null,

        title: p.courseId?.title || "Unknown course",

        category: p.courseId?.category || "",

        thumbnailUrl: p.courseId?.thumbnailUrl || "",

        progressPercentage: p.progressPercentage || 0,

        isCompleted: !!p.isCompleted,

        lastAccessedAt: p.updatedAt,
      }));

    /* ---------------- PROGRESS DISTRIBUTION (DOUGHNUT) ---------------- */

    const buckets = [
      { label: "Not Started", min: 0, max: 0 },

      { label: "1–25%", min: 1, max: 25 },

      { label: "26–50%", min: 26, max: 50 },

      { label: "51–75%", min: 51, max: 75 },

      { label: "76–99%", min: 76, max: 99 },

      { label: "Completed", min: 100, max: 100 },
    ];

    const progressDistribution = buckets.map((bucket) => ({
      label: bucket.label,

      count: progresses.filter((p) => {
        const pct = Number(p.progressPercentage || 0);

        return pct >= bucket.min && pct <= bucket.max;
      }).length,
    }));

    /* ---------------- LEARNING ACTIVITY (LAST 6 MONTHS LINE) ---------------- */

    const now = new Date();

    const monthBuckets = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      monthBuckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,

        month: date.toLocaleString("en-US", { month: "short" }),

        lessons: 0,
      });
    }

    const monthMap = new Map(monthBuckets.map((m) => [m.key, m]));

    progresses.forEach((progress) => {
      (progress.lessonProgress || []).forEach((lesson) => {
        if (!lesson.isCompleted || !lesson.completedAt) return;

        const date = new Date(lesson.completedAt);

        const bucket = monthMap.get(`${date.getFullYear()}-${date.getMonth()}`);

        if (bucket) {
          bucket.lessons += 1;
        }
      });
    });

    const learningActivity = monthBuckets.map(({ month, lessons }) => ({
      month,

      lessons,
    }));

    /* ---------------- RECENT CERTIFICATES ---------------- */

    const recentCertificates = certificates.slice(0, 4).map((certificate) => ({
      title: certificate.metadata?.entityName || certificate.title,

      subtitle: certificate.metadata?.subtitle || "",

      code: certificate.certificateCode,

      issuedAt: certificate.issueDate || certificate.createdAt,
    }));

    return res.status(200).json({
      success: true,
      dashboard: {
        profile,
        stats: {
          enrolledCourses,
          overallProgress,
          completedCourses,
          certificatesCount: certificates.length,
          totalLessonsCompleted,
          avgQuizScore,
          reputationPoints: profile.reputationPoints || 0,
          verifiedSkillsCount: profile.verifiedSkills?.length || 0,
          capstoneSummary,
        },
        recentCourses,
        progressDistribution,
        learningActivity,
        recentCertificates,
      },
    });
  } catch (error) {
    console.error("getStudentDashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard",
      error: error.message,
    });
  }
};

/* =========================================================
   4. GET PUBLISHED COURSES (CATALOG)
========================================================= */

export const getPublishedCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    const courses = await Course.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();

    const enrolled = await CourseProgress.find({ studentId })
      .select("courseId")
      .lean();

    const enrolledIds = new Set(enrolled.map((e) => e.courseId.toString()));

    const enriched = await Promise.all(
      courses.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({
          courseId: course._id,
        });

        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl,
          lessonCount,
          isEnrolled: enrolledIds.has(course._id.toString()),
          publishedAt: course.publishedAt,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      courses: enriched,
    });
  } catch (error) {
    console.error("getPublishedCourses:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
      error: error.message,
    });
  }
};

/* =========================================================
   5. ENROLL IN COURSE
========================================================= */

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findOne({ _id: courseId, isPublished: true });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Published course not found" });
    }

    const existing = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled in this course",
        progress: existing,
      });
    }

    const progress = await CourseProgress.create({
      studentId: req.user._id,
      courseId,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      progress,
    });
  } catch (error) {
    console.error("enrollInCourse:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while enrolling in course",
      error: error.message,
    });
  }
};

/* =========================================================
   6. GET MY ENROLLED COURSES
========================================================= */

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    const progresses = await CourseProgress.find({ studentId })
      .populate("courseId", "title thumbnailUrl category description")
      .sort({ enrolledAt: -1 })
      .lean();

    const courses = progresses.map((p) => ({
      progress: p,
      course: p.courseId,
    }));

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("getMyEnrolledCourses:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching enrolled courses",
      error: error.message,
    });
  }
};

/* =========================================================
   7. GET COURSE LEARNING DATA (WITH LOCK STATE)
========================================================= */

export const getCourseLearningData = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).lean();

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Published course not found" });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course first",
      });
    }

    // A published, enrolled course is already the gate for this endpoint, so
    // return ALL lessons regardless of the lesson-level isPublished flag.
    const lessons = await Lesson.find({ courseId })
      .sort({ lessonNumber: 1 })
      .lean();

    const lessonIds = lessons.map((l) => l._id);

    const mcqCounts = await LessonQuizQuestion.aggregate([
      { $match: { lessonId: { $in: lessonIds } } },
      { $group: { _id: "$lessonId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(mcqCounts.map((m) => [m._id.toString(), m.count]));

    const completedSet = new Set(
      progress.completedLessons?.map((id) => id.toString()) || [],
    );

    const progressedMap = new Map(
      (progress.lessonProgress || []).map((lp) => [lp.lessonId.toString(), lp]),
    );

    let unlockedNumber = 1;
    for (const lesson of lessons) {
      if (!completedSet.has(lesson._id.toString())) {
        unlockedNumber = lesson.lessonNumber;
        break;
      }
      unlockedNumber = lesson.lessonNumber + 1;
    }

    const lessonsWithState = lessons.map((lesson) => {
      const lp = progressedMap.get(lesson._id.toString());
      const isCompleted = completedSet.has(lesson._id.toString());
      const isUnlocked =
        lesson.lessonNumber === 1 || lesson.lessonNumber <= unlockedNumber;

      return {
        _id: lesson._id,
        lessonNumber: lesson.lessonNumber,
        title: lesson.title,
        topicHeading: lesson.topicHeading,
        definition: lesson.definition,
        detailedMeaning: lesson.detailedMeaning,
        example: lesson.example,
        codeExample: lesson.codeExample,
        codeExampleExplanation: lesson.codeExampleExplanation,
        videoUrl: lesson.videoUrl,
        notesPdfUrl: lesson.notesPdfUrl,
        mcqCount: countMap.get(lesson._id.toString()) || 0,
        isUnlocked,
        isCompleted,
        isQuizPassed: lp?.isQuizPassed || false,
        quizScore: lp?.quizScore || 0,
        quizAttempts: lp?.quizAttempts || 0,
      };
    });

    return res.status(200).json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        category: course.category,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        passingPercentage: course.passingPercentage,
        lessonQuizPassingPercentage: course.lessonQuizPassingPercentage,
        quizTimeLimitMinutes: course.quizTimeLimitMinutes,
        capstoneProject: course.capstoneProject,
      },
      progress: {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons?.length || 0,
        totalLessons: lessons.length,
        isQuizPassed: progress.isQuizPassed,
        quizScore: progress.quizScore,
        isCapstoneUnlocked: progress.isCapstoneUnlocked,
        isCompleted: progress.isCompleted,
        lastAccessedLessonId: progress.lastAccessedLessonId,
      },
      lessons: lessonsWithState,
    });
  } catch (error) {
    console.error("getCourseLearningData:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching course data",
      error: error.message,
    });
  }
};

/* =========================================================
   8. GET LESSON QUIZ QUESTIONS
========================================================= */

export const getLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID" });
    }

    const lesson = await Lesson.findById(lessonId).lean();

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId,
    });

    if (!progress) {
      return res
        .status(403)
        .json({ success: false, message: "Enroll in course first" });
    }

    // Only unlocked lessons can have quiz attempted
    const questions = await LessonQuizQuestion.find({ lessonId })
      .select("question options questionNumber")
      .sort({ questionNumber: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        lessonNumber: lesson.lessonNumber,
      },
      questions,
    });
  } catch (error) {
    console.error("getLessonQuiz:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lesson quiz",
      error: error.message,
    });
  }
};

/* =========================================================
   9. SUBMIT LESSON QUIZ
========================================================= */

export const submitLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(lessonId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID" });
    }

    if (!Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: "Answers are required" });
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    const course = await Course.findById(lesson.courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId,
    });

    if (!progress) {
      return res
        .status(403)
        .json({ success: false, message: "Enroll in course first" });
    }

    const questions = await LessonQuizQuestion.find({ lessonId }).lean();

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No quiz questions available for this lesson yet",
      });
    }

    // Grade
    let correctAnswers = 0;

    for (const q of questions) {
      const studentAnswer = answers.find(
        (a) => a.questionId === q._id.toString(),
      );

      if (
        studentAnswer &&
        studentAnswer.selectedIndex !== undefined &&
        Number(studentAnswer.selectedIndex) === q.correctOptionIndex
      ) {
        correctAnswers += 1;
      }
    }

    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passingPercentage = course.lessonQuizPassingPercentage || 70;
    const passed = percentage >= passingPercentage;

    // Record quiz attempt
    await QuizAttempt.create({
      studentId: req.user._id,
      courseId: lesson.courseId,
      lessonId,
      quizType: "LESSON",
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
      passingPercentage,
      passed,
      startedAt: new Date(Date.now() - 1000),
      submittedAt: new Date(),
      timeTakenSeconds: 0,
    });

    // Update lesson progress
    let lp = progress.lessonProgress.find(
      (x) => x.lessonId.toString() === lessonId,
    );

    if (!lp) {
      progress.lessonProgress.push({
        lessonId,
        quizScore: percentage,
        quizAttempts: 1,
        isQuizPassed: passed,
      });
    } else {
      lp.quizScore = percentage;
      lp.quizAttempts = (lp.quizAttempts || 0) + 1;
      lp.isQuizPassed = passed;
      if (passed) lp.isCompleted = true;
      lp.lastAccessedAt = new Date();
    }

    // If passed, mark lesson complete and update progress
    if (passed) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      const totalLessons = await Lesson.countDocuments({
        courseId: lesson.courseId,
      });

      progress.progressPercentage = Math.round(
        (progress.completedLessons.length / totalLessons) * 100,
      );
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: passed
        ? "Lesson quiz passed! Next lesson unlocked."
        : "Lesson quiz not passed. Please try again.",
      result: {
        correctAnswers,
        totalQuestions,
        percentage,
        passingPercentage,
        passed,
      },
      progress: {
        progressPercentage: progress.progressPercentage,
        completedLessons: progress.completedLessons.length,
      },
    });
  } catch (error) {
    console.error("submitLessonQuiz:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting lesson quiz",
      error: error.message,
    });
  }
};

/* =========================================================
   10. GET FINAL COURSE QUIZ
========================================================= */

export const getFinalQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      return res
        .status(403)
        .json({ success: false, message: "Enroll in course first" });
    }

    if (progress.progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: "Complete all lessons before taking the final quiz",
      });
    }

    const questions = course.quiz.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    return res.status(200).json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        quizTimeLimitMinutes: course.quizTimeLimitMinutes,
      },
      questions,
      passingPercentage: course.passingPercentage,
    });
  } catch (error) {
    console.error("getFinalQuiz:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching final quiz",
      error: error.message,
    });
  }
};

/* =========================================================
   11. SUBMIT FINAL COURSE QUIZ
========================================================= */

export const submitFinalQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    if (!Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: "Answers are required" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      return res
        .status(403)
        .json({ success: false, message: "Enroll in course first" });
    }

    if (progress.progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: "Complete all lessons before taking the final quiz",
      });
    }

    if (course.quiz.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No final quiz questions available for this course yet",
      });
    }

    // Grade
    let correctAnswers = 0;

    for (const q of course.quiz) {
      const studentAnswer = answers.find(
        (a) => a.questionId === q._id.toString(),
      );

      if (
        studentAnswer &&
        studentAnswer.selectedIndex !== undefined &&
        Number(studentAnswer.selectedIndex) === q.correctOptionIndex
      ) {
        correctAnswers += 1;
      }
    }

    const totalQuestions = course.quiz.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passingPercentage = course.passingPercentage || 70;
    const passed = percentage >= passingPercentage;

    // Record quiz attempt
    await QuizAttempt.create({
      studentId: req.user._id,
      courseId,
      quizType: "FINAL_COURSE",
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
      passingPercentage,
      passed,
      startedAt: new Date(Date.now() - 1000),
      submittedAt: new Date(),
      timeTakenSeconds: 0,
    });

    progress.finalQuizAttempts = (progress.finalQuizAttempts || 0) + 1;
    progress.quizScore = percentage;
    progress.isQuizPassed = passed;

    if (passed) {
      progress.isCapstoneUnlocked = true;
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: passed
        ? "Final quiz passed! Capstone project unlocked."
        : "Final quiz not passed. Please try again.",
      result: {
        correctAnswers,
        totalQuestions,
        percentage,
        passingPercentage,
        passed,
      },
      isCapstoneUnlocked: progress.isCapstoneUnlocked,
    });
  } catch (error) {
    console.error("submitFinalQuiz:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting final quiz",
      error: error.message,
    });
  }
};

/* =========================================================
   12. SUBMIT CAPSTONE PROJECT
========================================================= */

export const submitCapstone = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { githubRepoUrl, liveDemoUrl } = req.body;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    if (
      !githubRepoUrl ||
      !githubRepoUrl.trim() ||
      !liveDemoUrl ||
      !liveDemoUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "GitHub repo URL and live demo URL are required",
      });
    }

    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      return res
        .status(403)
        .json({ success: false, message: "Enroll in course first" });
    }

    if (!progress.isCapstoneUnlocked) {
      return res.status(400).json({
        success: false,
        message: "Capstone is not unlocked yet. Pass the final quiz first.",
      });
    }

    let submission = await CapstoneSubmission.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (submission) {
      if (submission.status === "APPROVED") {
        return res.status(400).json({
          success: false,
          message: "Capstone already approved. You cannot resubmit.",
        });
      }

      submission.githubRepoUrl = githubRepoUrl.trim();
      submission.liveDemoUrl = liveDemoUrl.trim();
      submission.status = "PENDING";
      submission.adminFeedback = "";
      submission.reviewedBy = null;
      submission.reviewedAt = null;
      submission.submissionVersion += 1;
    } else {
      submission = await CapstoneSubmission.create({
        studentId: req.user._id,
        courseId,
        githubRepoUrl: githubRepoUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        status: "PENDING",
      });
    }

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Capstone project submitted for review",
      submission,
    });
  } catch (error) {
    console.error("submitCapstone:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting capstone",
      error: error.message,
    });
  }
};

/* =========================================================
   13. GET MY CAPSTONE SUBMISSION FOR A COURSE
========================================================= */

export const getMyCapstoneSubmission = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID" });
    }

    const submission = await CapstoneSubmission.findOne({
      studentId: req.user._id,
      courseId,
    }).lean();

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("getMyCapstoneSubmission:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching capstone submission",
      error: error.message,
    });
  }
};

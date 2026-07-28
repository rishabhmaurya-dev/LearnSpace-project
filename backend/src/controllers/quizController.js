import fs from "fs";
import Quiz from "../models/CourseQuiz.js";
import StudentProfile from "../models/StudentProfile.js";

// =============================================================================
// 1. UPLOAD QUIZ FROM JSON FILE (Admin Only)
// =============================================================================
export const uploadQuizJsonFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a JSON file." });
    }

    // Read and parse JSON file uploaded via Multer
    const rawData = fs.readFileSync(req.file.path, "utf-8");
    const quizData = JSON.parse(rawData);

    // Basic Validation
    if (
      !quizData.courseId ||
      !quizData.title ||
      !quizData.badgeName ||
      !Array.isArray(quizData.questions)
    ) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message:
          "Invalid JSON format. Require courseId, title, badgeName, and questions array.",
      });
    }

    const newQuiz = await Quiz.create({
      course: quizData.courseId,
      title: quizData.title,
      badgeName: quizData.badgeName,
      timeLimitInMinutes: quizData.timeLimitInMinutes || 15,
      passingPercentage: quizData.passingPercentage || 70,
      questions: quizData.questions,
    });

    // Delete temp file after successful insertion
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: "Quiz uploaded and saved successfully!",
      quiz: newQuiz,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res
      .status(500)
      .json({ message: "Error uploading quiz", error: error.message });
  }
};

// =============================================================================
// 2. GET QUIZ BY COURSE ID (For Student Attempt - Options Only, No Answers)
// =============================================================================
export const getQuizByCourse = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId }).select(
      "-questions.correctOptionIndex -questions.explanation",
    );
    if (!quiz) {
      return res
        .status(404)
        .json({ message: "No quiz found for this course." });
    }
    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching quiz", error: error.message });
  }
};

// =============================================================================
// 3. SUBMIT QUIZ & AUTO-INJECT VERIFIED BADGE
// =============================================================================
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    // Fetch Course details to extract skill name (e.g., "React")
    const course = await Course.findById(quiz.course);
    const skillName = course ? course.skillBadge : quiz.badgeName;

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAns = answers?.find(
        (a) => a.questionId.toString() === question._id.toString(),
      );
      if (
        userAns &&
        Number(userAns.selectedOptionIndex) === question.correctOptionIndex
      ) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= quiz.passingPercentage;

    let badgeAdded = false;
    let skillAdded = false;

    // 🚀 AUTO-UPDATE STUDENT PROFILE UPON PASSING
    if (passed) {
      const studentProfile = await StudentProfile.findOne({
        user: req.user._id,
      });

      if (studentProfile) {
        // 1. Check & Add Verified Skill Badge
        const alreadyHasBadge = studentProfile.verifiedSkillBadges.some(
          (b) => b.badgeName === quiz.badgeName,
        );

        if (!alreadyHasBadge) {
          studentProfile.verifiedSkillBadges.push({
            badgeName: quiz.badgeName,
            courseId: quiz.course,
            score: scorePercentage,
            earnedAt: new Date(),
          });
          studentProfile.reputationPoints += 50; // XP Reward
          badgeAdded = true;
        }

        // 2. ⚡ AUTO-ADD TO SELF-DECLARED SKILLS (Duplicate Check)
        // Ensure array exists
        if (!studentProfile.selfDeclaredSkills) {
          studentProfile.selfDeclaredSkills = [];
        }

        // Skill case-insensitive check (e.g. "React" or "react")
        const skillExists = studentProfile.selfDeclaredSkills.some(
          (s) => s.toLowerCase() === skillName.toLowerCase(),
        );

        if (!skillExists) {
          studentProfile.selfDeclaredSkills.push(skillName);
          skillAdded = true;
        }

        await studentProfile.save();
      }
    }

    return res.status(200).json({
      success: true,
      scorePercentage,
      passed,
      badgeAdded,
      skillAdded,
      addedSkillName: skillAdded ? skillName : null,
      message: passed
        ? `Congratulations! You passed with ${scorePercentage}%. Verified Badge & "${skillName}" skill added to your profile!`
        : `You scored ${scorePercentage}%. Passing score is ${quiz.passingPercentage}%. Try again!`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting quiz",
      error: error.message,
    });
  }
};
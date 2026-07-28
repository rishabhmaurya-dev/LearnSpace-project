import StudentProfile from "../models/StudentProfile.js";
import Course from "../models/Course.js";

// =============================================================================
// SUBMIT / ADD CAPSTONE PROJECT TO STUDENT PROFILE (liveDemoUrl Optional)
// =============================================================================
export const submitCapstoneProject = async (req, res) => {
  try {
    const { courseId, projectTitle, githubRepoUrl, liveDemoUrl } = req.body;

    // 1. Mandatory Validations (Sirf Course ID, Title aur GitHub Link compulsory hain)
    if (!courseId || !projectTitle || !githubRepoUrl) {
      return res.status(400).json({
        message: "Course ID, project title, and GitHub repo URL are required.",
      });
    }

    // 2. URL Format Validations
    const urlPattern =
      /^(https?:\/\/)?([\w\d.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (!urlPattern.test(githubRepoUrl)) {
      return res.status(400).json({
        message: "Please provide a valid GitHub repository URL.",
      });
    }

    // Live demo tabhi validate karega agar user ne value di ho
    if (liveDemoUrl && !urlPattern.test(liveDemoUrl)) {
      return res.status(400).json({
        message: "Please provide a valid Live Demo URL.",
      });
    }

    // 3. Verify Course Exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Associated course not found." });
    }

    // 4. Fetch Logged-in Student's Profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    // 5. Check Duplicate Submission for the Same Course
    const alreadySubmitted = studentProfile.capstoneProjects.some(
      (proj) => proj.course.toString() === courseId.toString(),
    );

    if (alreadySubmitted) {
      return res.status(400).json({
        message:
          "You have already submitted a Capstone Project for this course.",
      });
    }

    // 6. Push Capstone Project (liveDemoUrl optional / empty string fallback)
    studentProfile.capstoneProjects.push({
      course: courseId,
      projectTitle: projectTitle.trim(),
      githubRepoUrl: githubRepoUrl.trim(),
      liveDemoUrl: liveDemoUrl ? liveDemoUrl.trim() : "",
      completedAt: new Date(),
    });

    // 🎁 Auto-Reward: +100 XP
    studentProfile.reputationPoints =
      (studentProfile.reputationPoints || 0) + 100;

    await studentProfile.save();

    const updatedProfile = await StudentProfile.findById(
      studentProfile._id,
    ).populate("capstoneProjects.course", "title category skillBadge");

    return res.status(200).json({
      success: true,
      message: "Capstone project submitted successfully! (+100 XP Earned)",
      studentProfile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting capstone project",
      error: error.message,
    });
  }
};

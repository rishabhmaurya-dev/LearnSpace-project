import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";
import { CompanyProfile } from "../models/CompanyProfile.model.js";
import { StudentProfile } from "../models/StudentProfile.model.js";
import { Course } from "../models/Course.model.js";
import { Lesson } from "../models/Lesson.model.js";
import { CapstoneSubmission } from "../models/CapstoneSubmission.model.js";
import { Certificate } from "../models/Certificate.model.js";

// ==========================================
// 📊 1. ADMIN DASHBOARD STATS & SIDEBAR METRICS
// ==========================================
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCompanies,
      pendingCompanies,
      totalCourses,
      publishedCourses,
      pendingCapstones,
      totalCertificates,
      recentSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: "STUDENT" }),
      CompanyProfile.countDocuments({ status: "APPROVED" }),
      CompanyProfile.countDocuments({ status: "PENDING" }),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      CapstoneSubmission.countDocuments({ status: "PENDING" }),
      Certificate.countDocuments(),
      CapstoneSubmission.find()
        .populate("studentId", "name email")
        .populate("courseId", "title")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCompanies,
          pendingCompanyVerifications: pendingCompanies,
          totalCourses,
          publishedCourses,
          pendingCapstoneReviews: pendingCapstones,
          totalCertificatesIssued: totalCertificates,
        },
        recentSubmissions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🏢 2. COMPANY VERIFICATION & MANAGEMENT
// ==========================================
export const getAllCompanies = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status.toUpperCase();
    if (search) {
      query.companyName = { $regex: search, $options: "i" };
    }

    const companies = await CompanyProfile.find(query)
      .populate("userId", "name email isActive createdAt")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const { companyProfileId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED", "BLOCKED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    if ((status === "REJECTED" || status === "BLOCKED") && !rejectionReason) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reason is required for rejection/blocking",
        });
    }

    const company = await CompanyProfile.findById(companyProfileId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    company.status = status;
    company.rejectionReason =
      status === "APPROVED" ? "" : rejectionReason || "";
    await company.save();

    return res.status(200).json({
      success: true,
      message: `Company status updated to ${status} successfully`,
      data: company,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🎓 3. CAPSTONE REVIEW & BADGE / CERTIFICATE ISSUANCE
// ==========================================
export const getAllCapstones = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status.toUpperCase();

    const capstones = await CapstoneSubmission.find(query)
      .populate("studentId", "name email")
      .populate(
        "courseId",
        "title skillBadgeName skillBadgeIcon capstoneProject",
      )
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: capstones.length, data: capstones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewCapstoneSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, adminFeedback } = req.body; // status: "APPROVED" | "REJECTED"

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Status must be APPROVED or REJECTED",
        });
    }

    const submission =
      await CapstoneSubmission.findById(submissionId).populate("courseId");
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    if (submission.status !== "PENDING") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Submission is already ${submission.status}`,
        });
    }

    submission.status = status;
    submission.adminFeedback = adminFeedback || "";
    submission.reviewedBy = req.user._id;
    await submission.save();

    // Agar APPROVED hua hai toh Certificate & Badge Issue karenge
    if (status === "APPROVED") {
      const course = submission.courseId;
      const studentId = submission.studentId;

      // 1. Generate Unique Certificate Code
      const certCode = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      // 2. Create Certificate Record
      const certificate = await Certificate.create({
        studentId,
        certificateType: "COURSE_COMPLETION",
        courseId: course._id,
        title: `${course.title} Completion Certificate`,
        pdfUrl: `https://yourdomain.com/certificates/${certCode}.pdf`, // Dynamic PDF URL
        certificateCode: certCode,
      });

      // 3. Update Student Profile: Add Badge, Verified Skill & Reputation Points
      await StudentProfile.findOneAndUpdate(
        { userId: studentId },
        {
          $addToSet: {
            verifiedSkills: course.category,
            skillBadges: {
              badgeName: course.skillBadgeName,
              icon: course.skillBadgeIcon || "",
              awardedAt: new Date(),
            },
          },
          $inc: {
            reputationPoints: 100,
            completedCoursesCount: 1,
          },
        },
        { upsert: true },
      );

      return res.status(200).json({
        success: true,
        message:
          "🎉 Capstone Approved! Badge & Certificate issued successfully.",
        data: { submission, certificate },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Capstone Submission Rejected with feedback.",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 📚 4. COURSE EDIT, DELETE & MANAGEMENT
// ==========================================
export const getAllAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ courseId });

    return res.status(200).json({
      success: true,
      message: "Course and associated lessons deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 👤 5. ADMIN PROFILE MANAGEMENT
// ==========================================
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id);

    if (name) admin.name = name.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Current password is required to change password",
          });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect current password" });
      }

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

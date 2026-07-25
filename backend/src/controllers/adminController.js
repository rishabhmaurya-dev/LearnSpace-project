import CompanyProfile from "../models/CompanyProfile.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import UserProgress from "../models/UserProgress.js";
import CompanyProject from "../models/CompanyProject.js";
import ProjectEnrollment from "../models/ProjectEnrollment.js";

// -----------------------------------------------------------------------------
// 1. GET ALL PENDING COMPANIES FOR VERIFICATION
// -----------------------------------------------------------------------------
export const getPendingCompanies = async (req, res) => {
  try {
    const pendingCompanies = await CompanyProfile.find({
      verificationStatus: "PENDING",
    })
      .populate("user", "name email createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingCompanies.length,
      companies: pendingCompanies,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching pending companies",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// 2. APPROVE OR REJECT A COMPANY PROFILE
// -----------------------------------------------------------------------------
export const verifyCompany = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { status, rejectedReason } = req.body;

    // 1. Input Validation
    if (!status || !["APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      return res.status(400).json({
        message:
          "Invalid status provided. Allowed values are APPROVED or REJECTED.",
      });
    }

    const normalizedStatus = status.toUpperCase();

    // 2. Rejection Reason Check
    if (
      normalizedStatus === "REJECTED" &&
      (!rejectedReason || !rejectedReason.trim())
    ) {
      return res.status(400).json({
        message: "Reason is required when rejecting a company profile.",
      });
    }

    // 3. Find Company Profile
    const companyProfile = await CompanyProfile.findById(profileId).populate(
      "user",
      "name email",
    );

    if (!companyProfile) {
      return res.status(404).json({
        message: "Company profile not found.",
      });
    }

    // 4. Check if already processed
    if (companyProfile.verificationStatus === normalizedStatus) {
      return res.status(400).json({
        message: `Company profile is already in ${normalizedStatus} state.`,
      });
    }

    // 5. Update Status
    companyProfile.verificationStatus = normalizedStatus;
    if (normalizedStatus === "REJECTED") {
      companyProfile.rejectedReason = rejectedReason.trim();
    } else {
      companyProfile.rejectedReason = ""; // Clear any previous rejection reason
    }

    await companyProfile.save();

    return res.status(200).json({
      success: true,
      message: `Company profile has been ${normalizedStatus.toLowerCase()} successfully.`,
      company: companyProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during company verification",
      error: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// 3. ADMIN DASHBOARD STATS & METRICS
// -----------------------------------------------------------------------------
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "STUDENT" });
    const totalCompanies = await User.countDocuments({ role: "COMPANY" });
    const pendingCompanyApprovals = await CompanyProfile.countDocuments({
      verificationStatus: "PENDING",
    });

    const totalCourses = await Course.countDocuments();
    const totalCourseEnrollments = await UserProgress.countDocuments();

    const totalCompanyProjects = await CompanyProject.countDocuments();
    const totalProjectSubmissions = await ProjectEnrollment.countDocuments({
      status: { $ne: "ENROLLED" },
    });

    // Total Certificates Count
    const courseCertificates = await UserProgress.countDocuments({
      isCompleted: true,
    });
    const companyCertificates = await ProjectEnrollment.countDocuments({
      status: "APPROVED",
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCompanies,
        pendingCompanyApprovals,
        totalCourses,
        totalCourseEnrollments,
        totalCompanyProjects,
        totalProjectSubmissions,
        totalCertificatesIssued: courseCertificates + companyCertificates,
        breakdown: {
          courseCertificates,
          companyCertificates,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error fetching admin stats",
      error: error.message,
    });
  }
};

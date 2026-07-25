import CompanyProfile from "../models/CompanyProfile.js";

export const requireVerifiedCompany = async (req, res, next) => {
  try {
    if (req.user.role !== "COMPANY") {
      return res
        .status(403)
        .json({ message: "Access restricted to companies only." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });

    if (!companyProfile) {
      return res.status(400).json({
        message:
          "Company profile is incomplete. Please submit your CIN/GSTIN details first.",
      });
    }

    if (companyProfile.verificationStatus === "PENDING") {
      return res.status(403).json({
        message: "Your company verification is pending admin approval.",
      });
    }

    if (companyProfile.verificationStatus === "REJECTED") {
      return res.status(403).json({
        message: `Company verification rejected. Reason: ${companyProfile.rejectedReason}`,
      });
    }

    // Status is 'APPROVED'
    req.companyProfile = companyProfile;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error while verifying company status",
      error: error.message,
    });
  }
};

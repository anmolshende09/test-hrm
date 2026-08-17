const User = require("../models/User");

// Admins/HR Managers always see every announcement — they're the ones
// managing them, so audience targeting shouldn't hide anything from them.
// Audience restriction only applies when the viewer is a plain Employee.
const getAnnouncementAudienceQuery = async (user) => {
  if (user.role !== "employee") {
    return {};
  }

  const populatedUser = await User.findById(user._id).populate({
    path: "employee",
    select: "department",
    populate: { path: "department", select: "branch" },
  });

  const departmentId = populatedUser?.employee?.department?._id;
  const branchId = populatedUser?.employee?.department?.branch;

  const orConditions = [{ audienceType: "company_wide" }];
  if (branchId) {
    orConditions.push({ audienceType: "branch", audienceBranches: branchId });
  }
  if (departmentId) {
    orConditions.push({ audienceType: "department", audienceDepartments: departmentId });
  }

  return { $or: orConditions };
};

module.exports = { getAnnouncementAudienceQuery };

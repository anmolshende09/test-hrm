const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = async (models, coreData) => {
  const { JobCategory, JobType, Candidate, Interview, Offer } = models;
  const { admin } = coreData;

  // 1. Job Category
  const engCategory = await JobCategory.create({ name: "Engineering", description: "Software Dev Roles" });
  const hrCategory = await JobCategory.create({ name: "HR", description: "Human Resources Roles" });
  console.log("Created JobCategories");

  // 2. Job Type
  const fullTime = await JobType.create({ name: "Full-Time", description: "40 hours a week" });
  const partTime = await JobType.create({ name: "Part-Time", description: "20 hours a week" });
  console.log("Created JobTypes");

  // 3. Candidates
  const cand1 = await Candidate.create({
    name: "John Doe",
    email: "john.doe@example.com",
    job: "Frontend Engineer",
    source: "linkedin",
    experience: 3,
    expectedSalary: 100000,
    status: "interview",
    createdBy: admin._id
  });

  const cand2 = await Candidate.create({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    job: "HR Coordinator",
    source: "referral",
    experience: 5,
    expectedSalary: 90000,
    status: "offer",
    createdBy: admin._id
  });
  console.log("Created Candidates");

  // 4. Interviews
  await Interview.create({
    candidate: cand1._id,
    round: "Technical",
    type: "video",
    scheduledAt: daysAgo(-2), // 2 days from now
    location: "Zoom",
    status: "scheduled",
    createdBy: admin._id
  });

  await Interview.create({
    candidate: cand2._id,
    round: "Final",
    type: "in_person",
    scheduledAt: daysAgo(1),
    location: "HQ Room 1",
    status: "completed",
    feedback: "Great fit for the team.",
    createdBy: admin._id
  });
  console.log("Created Interviews");

  // 5. Offers
  await Offer.create({
    candidate: cand2._id,
    salary: 95000,
    startDate: daysAgo(-30),
    expiryDate: daysAgo(-7),
    status: "pending",
    createdBy: admin._id
  });
  console.log("Created Offers");

  return { engCategory, hrCategory, fullTime, partTime, cand1, cand2 };
};

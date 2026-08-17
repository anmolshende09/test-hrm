const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = async (models, coreData) => {
  const {
    Promotion, Resignation, Termination, Warning, AssetType, Asset,
    DocumentCategory, DocumentType, HRDocument, DocumentTemplate,
    Contracttype, ContractTemplate, EmployeeContract, AwardType, CalendarEvent
  } = models;
  const { admin, employees } = coreData;

  // 1. Promotions, Resignations, Terminations, Warnings
  await Promotion.create({
    employee: employees.SeniorEng._id,
    previousDesignation: coreData.designations["Software Engineer"]._id,
    newDesignation: coreData.designations["Senior Software Engineer"]._id,
    effectiveDate: daysAgo(100),
    status: "approved",
    createdBy: admin._id
  });
  console.log("Created Promotions");

  await Resignation.create({
    employee: employees.FinManager._id,
    lastWorkingDay: daysAgo(-15),
    status: "pending",
    createdBy: admin._id
  });
  console.log("Created Resignations");

  await Warning.create({
    employee: employees.JuniorEng._id,
    subject: "Late Attendance",
    warningType: "verbal",
    severity: "low",
    createdBy: admin._id
  });
  console.log("Created Warnings");

  // 2. Assets
  const laptopType = await AssetType.create({ name: "Laptop", description: "Standard issued laptops" });
  await Asset.create({
    name: "MacBook Pro 16",
    assetCode: "AST-L-001",
    assetType: laptopType._id,
    status: "assigned",
    assignedTo: employees.CEO._id,
    assignedDate: daysAgo(300),
    purchaseCost: 2500,
    createdBy: admin._id
  });
  console.log("Created Assets");

  // 3. Documents
  const hrDocCat = await DocumentCategory.create({ name: "HR Policies" });
  const docType = await DocumentType.create({ name: "PDF Policy", category: hrDocCat._id });
  console.log("Created DocumentTypes");

  // HR Document (skipping creating an actual file, just the db record)
  if (HRDocument) {
    try {
      await HRDocument.create({
        title: "Employee Handbook",
        category: hrDocCat._id,
        type: docType._id,
        fileUrl: "/dummy/handbook.pdf",
        createdBy: admin._id
      });
    } catch (e) {
      // ignore
    }
  }

  // 4. Contracts
  const fullTimeContract = await Contracttype.create({ name: "Full Time Permanent" });
  await EmployeeContract.create({
    contractNumber: "CON-001",
    employee: employees.SeniorEng._id,
    contractType: fullTimeContract._id,
    startDate: daysAgo(365),
    basicSalary: employees.SeniorEng.salary / 12,
    allowances: [{ name: "Internet", amount: 50 }],
    status: "active",
    createdBy: admin._id
  });
  console.log("Created EmployeeContracts");

  // 5. Awards
  const starAward = await AwardType.create({ name: "Employee of the Month", description: "Outstanding performance" });
  console.log("Created AwardTypes");

  // 6. Calendar Events
  await CalendarEvent.create({
    title: "Company Retreat",
    category: "holiday",
    startDate: daysAgo(45), // 45 days ago
    endDate: daysAgo(43),   // 43 days ago
    holidayCategory: "company_specific",
    createdBy: admin._id
  });
  console.log("Created CalendarEvents");

  return {};
};

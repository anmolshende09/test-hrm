const FIRST_NAMES = ["Aarav", "Priya", "Rahul", "Ananya", "Amit", "Diya", "Sanjay", "Saanvi", "Vikram", "Meera"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Mehta", "Kapoor", "Malhotra", "Reddy", "Nair", "Iyer", "Rao"];

let nameCursor = 0;
const nextName = () => {
  const first = FIRST_NAMES[nameCursor % FIRST_NAMES.length];
  const last = LAST_NAMES[(nameCursor * 7) % LAST_NAMES.length];
  nameCursor += 1;
  return `${first} ${last}`;
};

const randomJoiningDate = () => {
  const daysAgo = Math.floor(Math.random() * 900) + 60;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

module.exports = async (models) => {
  const { Branch, Department, Designation, Employee, User } = models;

  // 1. Admin User
  const admin = await User.create({
    name: "System Admin",
    email: "admin@hrms.local",
    password: "Admin@123",
    role: "admin",
  });
  console.log("Created Admin User");

  // 2. Branch
  const mainBranch = await Branch.create({
    name: "HQ - San Francisco",
    address: "123 Market St, San Francisco, CA",
    phone: "+1-555-0192",
    email: "hq@hrms.local",
    status: "active"
  });
  console.log("Created Branch");

  // 3. Departments
  const deptData = [
    { name: "Executive", description: "C-Level Management" },
    { name: "Engineering", description: "Software & IT" },
    { name: "Finance", description: "Accounts & Payroll" },
    { name: "Human Resources", description: "HR & Recruitment" }
  ];
  const departments = {};
  for (const d of deptData) {
    departments[d.name] = await Department.create({ ...d, branch: mainBranch._id });
  }
  console.log("Created Departments");

  // 4. Designations
  const desigData = [
    { name: "CEO", dept: "Executive" },
    { name: "Engineering Manager", dept: "Engineering" },
    { name: "Senior Software Engineer", dept: "Engineering" },
    { name: "Software Engineer", dept: "Engineering" },
    { name: "Finance Manager", dept: "Finance" },
    { name: "Accountant", dept: "Finance" },
    { name: "HR Manager", dept: "Human Resources" },
    { name: "Recruiter", dept: "Human Resources" },
  ];
  const designations = {};
  for (const des of desigData) {
    const deptId = departments[des.dept]._id;
    designations[des.name] = await Designation.create({ name: des.name, department: deptId });
  }
  console.log("Created Designations");

  // 5. Employees (Hierarchy)
  const employees = {};

  // CEO
  const ceo = await Employee.create({
    employeeId: "EXEC-001",
    name: "Alice CEO",
    email: "alice.ceo@hrms.local",
    phone: "555-0001",
    department: departments["Executive"]._id,
    designation: designations["CEO"]._id,
    joiningDate: randomJoiningDate(),
    salary: 250000,
    manager: null
  });
  employees.CEO = ceo;

  // Department Managers
  const engManager = await Employee.create({
    employeeId: "ENG-001", name: "Bob EngMgr", email: "bob.eng@hrms.local", phone: "555-0002",
    department: departments["Engineering"]._id, designation: designations["Engineering Manager"]._id,
    joiningDate: randomJoiningDate(), salary: 150000, manager: ceo._id
  });
  employees.EngManager = engManager;

  const hrManager = await Employee.create({
    employeeId: "HR-001", name: "Carol HRMgr", email: "carol.hr@hrms.local", phone: "555-0003",
    department: departments["Human Resources"]._id, designation: designations["HR Manager"]._id,
    joiningDate: randomJoiningDate(), salary: 120000, manager: ceo._id
  });
  employees.HRManager = hrManager;

  const finManager = await Employee.create({
    employeeId: "FIN-001", name: "Dave FinMgr", email: "dave.fin@hrms.local", phone: "555-0004",
    department: departments["Finance"]._id, designation: designations["Finance Manager"]._id,
    joiningDate: randomJoiningDate(), salary: 130000, manager: ceo._id
  });
  employees.FinManager = finManager;

  // Staff
  const seniorEng = await Employee.create({
    employeeId: "ENG-002", name: nextName(), email: "senior.eng@hrms.local", phone: "555-0005",
    department: departments["Engineering"]._id, designation: designations["Senior Software Engineer"]._id,
    joiningDate: randomJoiningDate(), salary: 120000, manager: engManager._id
  });
  employees.SeniorEng = seniorEng;

  const juniorEng = await Employee.create({
    employeeId: "ENG-003", name: nextName(), email: "junior.eng@hrms.local", phone: "555-0006",
    department: departments["Engineering"]._id, designation: designations["Software Engineer"]._id,
    joiningDate: randomJoiningDate(), salary: 90000, manager: seniorEng._id
  });
  employees.JuniorEng = juniorEng;

  const recruiter = await Employee.create({
    employeeId: "HR-002", name: nextName(), email: "recruiter.hr@hrms.local", phone: "555-0007",
    department: departments["Human Resources"]._id, designation: designations["Recruiter"]._id,
    joiningDate: randomJoiningDate(), salary: 80000, manager: hrManager._id
  });
  employees.Recruiter = recruiter;

  console.log("Created Employees Hierarchy");

  // 6. Demo Users for roles
  await User.create({ name: hrManager.name, email: "hr@hrms.local", password: "HRManager@123", role: "hr_manager", employee: hrManager._id });
  await User.create({ name: juniorEng.name, email: "employee@hrms.local", password: "Employee@123", role: "employee", employee: juniorEng._id });
  console.log("Created Demo Users");

  return { admin, mainBranch, departments, designations, employees };
};

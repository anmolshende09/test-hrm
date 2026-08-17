const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = async (models, coreData) => {
  const { SalaryComponent, EmployeeSalary, PayrollRun, Payslip } = models;
  const { admin, employees } = coreData;

  // 1. Salary Components
  const basic = await SalaryComponent.create({
    name: "Basic", type: "earning", calculationType: "fixed", amount: 50000, description: "Basic Salary"
  });
  const hra = await SalaryComponent.create({
    name: "HRA", type: "earning", calculationType: "percentage", amount: 20, description: "House Rent Allowance"
  });
  const tax = await SalaryComponent.create({
    name: "Income Tax", type: "deduction", calculationType: "percentage", amount: 10, description: "Standard Tax"
  });
  console.log("Created SalaryComponents");

  // 2. Employee Salaries
  for (const empKey of Object.keys(employees)) {
    const emp = employees[empKey];
    await EmployeeSalary.create({
      employee: emp._id,
      basicSalary: emp.salary / 12,
      components: [
        { component: basic._id },
        { component: hra._id },
        { component: tax._id }
      ]
    });
  }
  console.log("Created EmployeeSalaries");

  // 3. Payroll Run
  const periodStart = daysAgo(30);
  const periodEnd = daysAgo(1);
  
  const payroll = await PayrollRun.create({
    title: "July 2026 Payroll",
    frequency: "monthly",
    periodStart: periodStart,
    periodEnd: periodEnd,
    payDate: daysAgo(0),
    status: "completed",
    totalEmployees: Object.keys(employees).length,
    grossPay: 0,
    totalDeductions: 0,
    netPay: 0,
    createdBy: admin._id
  });
  console.log("Created PayrollRun");

  // 4. Payslips
  let totalGross = 0;
  let totalDed = 0;
  let totalNet = 0;

  for (const empKey of Object.keys(employees)) {
    const emp = employees[empKey];
    const base = emp.salary / 12;
    const basicAmt = base;
    const hraAmt = base * 0.2;
    const gross = basicAmt + hraAmt;
    const taxAmt = gross * 0.1;
    const net = gross - taxAmt;

    await Payslip.create({
      employee: emp._id,
      payrollRun: payroll._id,
      payDate: daysAgo(0),
      basicSalary: base,
      grossPay: gross,
      totalDeductions: taxAmt,
      netPay: net,
      breakdown: [
        { name: "Basic", type: "earning", amount: basicAmt },
        { name: "HRA", type: "earning", amount: hraAmt },
        { name: "Income Tax", type: "deduction", amount: taxAmt }
      ]
    });

    totalGross += gross;
    totalDed += taxAmt;
    totalNet += net;
  }

  // Update Payroll totals
  await PayrollRun.updateOne(
    { _id: payroll._id },
    { grossPay: totalGross, totalDeductions: totalDed, netPay: totalNet }
  );

  console.log("Created Payslips");

  return { basic, hra, tax, payroll };
};

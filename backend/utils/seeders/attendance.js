const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = async (models, coreData) => {
  const { Attendance, AttendancePolicy, AttendanceRegularization, Shift, LeaveRequest } = models;
  const { admin, employees } = coreData;

  // 1. Shift
  const generalShift = await Shift.create({
    name: "General Shift",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    gracePeriod: 15,
    description: "Standard 9 to 5",
    status: "active"
  });

  const nightShift = await Shift.create({
    name: "Night Shift",
    startTime: "22:00",
    endTime: "06:00",
    breakDuration: 60,
    gracePeriod: 15,
    description: "Night operations",
    status: "active"
  });
  console.log("Created Shifts");

  // Assign shift to some employees directly since it's a field on Employee
  // We can just update them
  await models.Employee.updateOne({ _id: employees.CEO._id }, { shift: generalShift._id });
  await models.Employee.updateOne({ _id: employees.SeniorEng._id }, { shift: nightShift._id });

  // 2. Attendance Policy
  const standardPolicy = await AttendancePolicy.create({
    name: "Standard Policy",
    type: "standard",
    lateArrivalGrace: 15,
    earlyDepartureGrace: 10,
    overtimeRate: 1.5,
    description: "Standard rules"
  });
  console.log("Created AttendancePolicy");

  // 3. Attendance
  const attendanceDays = [daysAgo(2), daysAgo(1), daysAgo(0)];
  for (const empKey of Object.keys(employees)) {
    const emp = employees[empKey];
    for (const day of attendanceDays) {
      await Attendance.create({
        employee: emp._id,
        date: day,
        status: "present",
        checkIn: "09:00",
        checkOut: "17:00",
        markedBy: admin._id
      });
    }
  }
  // Make JuniorEng absent on day 1
  await Attendance.updateOne(
    { employee: employees.JuniorEng._id, date: attendanceDays[1] },
    { status: "absent", checkIn: null, checkOut: null }
  );
  console.log("Created Attendance");

  // 4. Attendance Regularization
  await AttendanceRegularization.create({
    employee: employees.JuniorEng._id,
    date: attendanceDays[1],
    originalCheckIn: null,
    originalCheckOut: null,
    requestedCheckIn: "09:15",
    requestedCheckOut: "17:00",
    reason: "Forgot to punch in",
    status: "pending"
  });
  console.log("Created AttendanceRegularization");

  // 5. Leave Request
  await LeaveRequest.create({
    employee: employees.Recruiter._id,
    leaveType: "sick",
    startDate: daysAgo(2), // 2 days ago
    endDate: daysAgo(1),   // 1 day ago
    reason: "Doctor appointment",
    status: "approved",
    reviewedBy: admin._id
  });
  console.log("Created LeaveRequests");

  return { generalShift, nightShift, standardPolicy };
};

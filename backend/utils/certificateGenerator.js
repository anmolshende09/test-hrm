const PDFDocument = require("pdfkit");

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—");

// Returns a PDFDocument stream — caller pipes it to `res` and calls .end().
// `employee` must already be populated with department/designation.
const generateEmployeeCertificate = (type, employee) => {
  const doc = new PDFDocument({ margin: 60 });

  const departmentName = employee.department?.name || "—";
  const designationName = employee.designation?.name || "—";
  const today = formatDate(new Date());

  doc.fontSize(11).text(today, { align: "right" });
  doc.moveDown(2);

  if (type === "joining_letter") {
    doc.fontSize(16).text("Letter of Joining", { align: "center" });
    doc.moveDown(2);
    doc
      .fontSize(11)
      .text(
        `This is to certify that ${employee.name} (Employee ID: ${employee.employeeId}) joined the organization as ${designationName} in the ${departmentName} department, effective ${formatDate(employee.joiningDate)}.`,
        { align: "left", lineGap: 6 }
      );
  } else if (type === "experience_certificate") {
    doc.fontSize(16).text("Experience Certificate", { align: "center" });
    doc.moveDown(2);
    const isFormer = employee.status === "terminated" || employee.status === "inactive";
    const periodEnd = isFormer ? formatDate(employee.updatedAt) : "present";
    doc
      .fontSize(11)
      .text(
        `This is to certify that ${employee.name} (Employee ID: ${employee.employeeId}) has worked / is working in this organization as ${designationName} in the ${departmentName} department from ${formatDate(employee.joiningDate)} to ${periodEnd}.`,
        { align: "left", lineGap: 6 }
      );
    doc.moveDown();
    doc.text("During this period, their conduct and performance were found to be satisfactory.");
  } else if (type === "noc") {
    doc.fontSize(16).text("No Objection Certificate", { align: "center" });
    doc.moveDown(2);
    doc
      .fontSize(11)
      .text(
        `This is to certify that this organization has no objection to ${employee.name} (Employee ID: ${employee.employeeId}), currently employed as ${designationName} in the ${departmentName} department, using this certificate for personal, travel, or financial purposes as required.`,
        { align: "left", lineGap: 6 }
      );
  }

  doc.moveDown(4);
  doc.text("_______________________");
  doc.text("Authorized Signatory");

  return doc;
};

module.exports = { generateEmployeeCertificate };

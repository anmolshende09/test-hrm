const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeStatusCounts,
  getOrgChart,
  exportEmployees,
  importEmployees,
  getEmployee,
  updateEmployee,
  changeEmployeePassword,
  toggleEmployeeLoginStatus,
  deleteEmployee,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  verifyEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeCertificate,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/auth");
const { employeeRules, passwordRules, documentRules, validate } = require("../validators/employeeValidator");
const upload = require("../config/upload");
const uploadCSV = require("../config/csvUpload");
const uploadEmployeeDoc = require("../config/employeeDocumentUpload");

router.use(protect);

router
  .route("/")
  .get(getEmployees)
  .post(authorize("admin", "hr_manager"), upload.single("profilePicture"), employeeRules, validate, createEmployee);

// All of these must come before /:id — otherwise Express matches their
// literal path segment ("org-chart", "status-counts", etc.) as an :id param.
router.get("/org-chart", getOrgChart);
router.get("/status-counts", getEmployeeStatusCounts);
router.get("/export", authorize("admin", "hr_manager"), exportEmployees);
router.post("/import", authorize("admin", "hr_manager"), uploadCSV.single("file"), importEmployees);

router
  .route("/:id")
  .get(getEmployee)
  .put(authorize("admin", "hr_manager"), upload.single("profilePicture"), updateEmployee)
  .delete(authorize("admin"), deleteEmployee);

router.put("/:id/password", authorize("admin", "hr_manager"), passwordRules, validate, changeEmployeePassword);
router.put("/:id/login-status", authorize("admin", "hr_manager"), toggleEmployeeLoginStatus);

router.get("/:id/documents", getEmployeeDocuments);
router.post(
  "/:id/documents",
  authorize("admin", "hr_manager"),
  uploadEmployeeDoc.single("file"),
  documentRules,
  validate,
  uploadEmployeeDocument
);
router.put("/:id/documents/:docId/verify", authorize("admin", "hr_manager"), verifyEmployeeDocument);
router.delete("/:id/documents/:docId", authorize("admin", "hr_manager"), deleteEmployeeDocument);

router.get("/:id/certificates/:type", downloadEmployeeCertificate);

module.exports = router;

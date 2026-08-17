const express = require("express");
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect, authorize } = require("../middleware/auth");
const { candidateRules, validate } = require("../validators/candidateValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.get("/all", getAllCandidates);

router.route("/").get(getCandidates).post(candidateRules, validate, createCandidate);

router.route("/:id").put(candidateRules, validate, updateCandidate).delete(deleteCandidate);

module.exports = router;

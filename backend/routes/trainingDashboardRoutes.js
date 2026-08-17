const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getTrainingDashboard } = require("../controllers/trainingDashboardController");

router.get("/", protect, getTrainingDashboard);

module.exports = router;

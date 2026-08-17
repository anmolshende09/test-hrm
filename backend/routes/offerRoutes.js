const express = require("express");
const router = express.Router();
const { createOffer, getOffers, updateOffer, deleteOffer } = require("../controllers/offerController");
const { protect, authorize } = require("../middleware/auth");
const { offerRules, validate } = require("../validators/offerValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/").get(getOffers).post(offerRules, validate, createOffer);

router.route("/:id").put(offerRules, validate, updateOffer).delete(deleteOffer);

module.exports = router;

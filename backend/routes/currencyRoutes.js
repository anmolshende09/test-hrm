const express = require("express");
const router = express.Router();

const {
  createCurrency,
  getCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency,
} = require("../controllers/currencyController");

const { protect, authorize } = require("../middleware/auth");
const { currencyRules, validate } = require("../validators/currencyValidator");

router.use(protect);

router
  .route("/")
  .get(getCurrencies)
  .post(
    authorize("admin", "hr_manager"),
    currencyRules,
    validate,
    createCurrency
  );

router
  .route("/:id")
  .get(getCurrency)
  .put(
    authorize("admin", "hr_manager"),
    currencyRules,
    validate,
    updateCurrency
  )
  .delete(authorize("admin"), deleteCurrency);

module.exports = router;
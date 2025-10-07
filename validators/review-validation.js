const { body, validationResult } = require("express-validator");
const validate = {};
const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

/* **********************************
 * Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
    return [
        body("review_text")
            .trim()
            .notEmpty()
            .withMessage("Review text cannot be empty.")
            .isLength({ min: 10 })
            .withMessage("Review must be at least 10 characters long."),
    ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
    const { inv_id } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are errors, we need to rebuild the detail view with the errors
        let nav = await utilities.getNav();
        const invModel = require("../models/inventory-model");
        const vehicle = await invModel.getVehicleById(inv_id);
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
        const detailHTML = utilities.buildVehicleDetail(vehicle);
        const reviewsHTML = utilities.buildReviewsHTML(reviews);
        const title = `${vehicle.inv_make} ${vehicle.inv_model}`;

        res.render("inventory/detail", {
            title,
            nav,
            detailHTML,
            reviewsHTML,
            inv_id,
            errors: errors.array(),
        });
        return;
    }
    next();
};

module.exports = validate;
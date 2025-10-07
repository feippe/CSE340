const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require("../utilities");
const { classificationRules, checkClassificationData, inventoryRules, checkInventoryData } = require('../validators/inventory-validation')
const reviewValidate = require('../validators/review-validation')

router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
)

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  '/',
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  '/add-classification', 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  '/add-classification',
  utilities.checkAccountType,
  classificationRules(),
  checkClassificationData,
  utilities.handleErrors(invController.createClassification)
)

router.get(
  '/add-inventory', 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  '/add-inventory',
  utilities.checkAccountType,
  inventoryRules(),
  checkInventoryData,
  utilities.handleErrors(invController.createInventory)
)

router.get(
  "/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
)

router.get(
  '/edit/:inv_id', 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventory)
)

router.post(
  "/update/", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/delete/:inv_id", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirmation)
)

router.post(
  "/delete", 
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteVehicle)
)

router.post(
    "/detail/add-review",
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(invController.addReview)
);


module.exports = router;
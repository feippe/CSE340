const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require("../utilities");
const { classificationRules, checkClassificationData, inventoryRules, checkInventoryData } = require('../validators/inventory-validation')

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
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  '/add-classification', 
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  '/add-classification',
  classificationRules(),
  checkClassificationData,
  utilities.handleErrors(invController.createClassification)
)

router.get(
  '/add-inventory', 
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  '/add-inventory',
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
  utilities.handleErrors(invController.buildEditInventory)
)

router.post("/update/", invController.updateInventory)


module.exports = router;
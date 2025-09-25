const { body, validationResult } = require('express-validator')

function classificationRules() {
  return [
    body('classification_name')
      .trim()
      .notEmpty().withMessage('Classification name is required.')
      .matches(/^[A-Za-z0-9_]+$/).withMessage('No spaces or special characters allowed.')
  ]
}

async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  const utilities = require('../utilities/')
  const nav = await utilities.getNav()
  return res.status(400).render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: errors.array(),
    classification_name: req.body.classification_name
  })
}

function inventoryRules() {
  return [
    body('inv_make').trim().notEmpty().withMessage('Make is required.').escape(),
    body('inv_model').trim().notEmpty().withMessage('Model is required.').escape(),
    body('inv_year').isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid number.'),
    body('inv_description').trim().notEmpty().withMessage('Description is required.'),
    body('inv_image').trim().notEmpty().withMessage('Image path is required.'),
    body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail path is required.'),
    body('inv_price').isFloat({ gt: 0 }).withMessage('Price must be > 0.'),
    body('inv_miles').isInt({ min: 0 }).withMessage('Miles must be >= 0.'),
    body('inv_color').trim().notEmpty().withMessage('Color is required.').escape(),
    body('classification_id').isInt().withMessage('Select a classification.')
  ]
}

async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()
  const utilities = require('../utilities/')
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
  return res.status(400).render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    errors: errors.array(),
    classificationSelect,
    ...req.body // sticky para todos los inputs
  })
}

module.exports = { inventoryRules, classificationRules, checkClassificationData, checkInventoryData }

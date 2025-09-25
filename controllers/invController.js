const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require('express-validator');

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (!Number.isInteger(inv_id)) {
      const err = new Error("Invalid inventory id");
      err.status = 400;
      throw err;
    }

    const vehicle = await invModel.getVehicleById(inv_id);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }

    const nav = await utilities.getNav();
    const detailHTML = utilities.buildVehicleDetail(vehicle);

    const title = `${vehicle.inv_make} ${vehicle.inv_model}`;
    res.render("inventory/detail", {
      title,
      nav,
      detailHTML
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav
  })
};

/* ============================
   CLASSIFICATION
   ============================ */

// GET form
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render(
    'inventory/add-classification', 
    { 
      title: 'Add Classification', 
      nav,
      errors: [],
      classification_name: ''
    })
}

// POST
invCont.createClassification = async function (req, res) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = validationResult(req)
  if (!result.isEmpty()) {
    // Re-render con errores y valor ingresado
    return res.status(400).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: result.array(),
      classification_name: classification_name || ''
    })
  }

  const row = await invModel.addClassification(classification_name)
  if (row) {
    req.flash('notice', `Classification "${classification_name}" created.`)
    const nav2 = await utilities.getNav()
    return res.status(201).render('inventory/management', { title: 'Inventory Management', nav: nav2 })
  }
  req.flash('notice', 'Failed to create classification.')
  return res
    .status(500)
    .render(
      'inventory/add-classification', 
      { 
        title: 'Add Classification', 
        nav, 
        errors: [{ msg: 'Database insert failed' }],
        classification_name: classification_name || ''
      }
    )
}

/* ============================
   INVENTORY
   ============================ */

// GET inventario
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render(
    'inventory/add-inventory', 
    { 
      title: 'Add Inventory', 
      nav, 
      classificationSelect,
      errors: [],
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: ''
    })
}

// POST inventario
invCont.createInventory = async function (req, res) {
  const nav = await utilities.getNav()

  const {
    inv_make = '',
    inv_model = '',
    inv_year = '',
    inv_description = '',
    inv_image = '',
    inv_thumbnail = '',
    inv_price = '',
    inv_miles = '',
    inv_color = '',
    classification_id = ''
  } = req.body

  const result = validationResult(req)
  if (!result.isEmpty()) {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    return res.status(400).render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationSelect,
      errors: result.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }

  const row = await invModel.addInventory(req.body)
  if (row) {
    req.flash('notice', `Inventory item "${req.body.inv_make} ${req.body.inv_model}" created.`)
    const nav2 = await utilities.getNav()
    return res.status(201).render('inventory/management', { title: 'Inventory Management', nav: nav2 })
  }

  const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
  req.flash('notice', 'Failed to create inventory item.')
  return res.status(500).render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationSelect,
    errors: [{ msg: 'Database insert failed' }],
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  })
}

module.exports = invCont;
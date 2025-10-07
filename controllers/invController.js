const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require('express-validator');
const reviewModel = require("../models/review-model");

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
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id);

    const nav = await utilities.getNav();
    const detailHTML = utilities.buildVehicleDetail(vehicle);
    const reviewsHTML = utilities.buildReviewsHTML(reviews);

    const title = `${vehicle.inv_make} ${vehicle.inv_model}`;
    res.render("inventory/detail", {
      title,
      nav,
      detailHTML,
      reviewsHTML,
      inv_id,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()

  const classificationSelect = await utilities.buildClassificationList()

  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    classificationSelect
  })
};


/* ***************************
 * Process new review submission
 * ************************** */
invCont.addReview = async function (req, res, next) {
    const { review_text, inv_id, account_id } = req.body;

    const result = await reviewModel.addReview(
        review_text,
        inv_id,
        account_id
    );

    if (result) {
        req.flash("notice", "Thank you for your review!");
    } else {
        req.flash("notice", "Sorry, there was an error submitting your review.");
    }
    // Redirect back to the same detail page
    res.redirect(`/inv/detail/${inv_id}`);
};


/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  if (!data || data.length === 0) {
    res.status(404).render("./errors/error", {
      title: "No Vehicles",
      message: "Sorry, no vehicles match that classification."
    });
    return;
  }
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
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

// GET inventory
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

// POST inventory
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData.length > 0) {
    return res.json(invData)
  } else {
    return res.json([])
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id);
    if (!Number.isInteger(inv_id)) {
      const err = new Error("Invalid inventory id");
      err.status = 400;
      throw err;
    }

    const nav = await utilities.getNav()
    
    const vehicle = await invModel.getVehicleById(inv_id);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }

    const classificationSelect = await utilities.buildClassificationList()
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`

    res.render(
    'inventory/edit-inventory', 
    { 
      title: `Edit ${itemName}`, 
      nav, 
      classificationSelect: classificationSelect,
      errors: [],
      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_description: vehicle.inv_description,
      inv_image: vehicle.inv_image,
      inv_thumbnail: vehicle.inv_thumbnail,
      inv_price: vehicle.inv_price,
      inv_miles: vehicle.inv_miles,
      inv_color: vehicle.inv_color,
      classification_id: vehicle.classification_id
    })
  } catch (error) {
    next(error);
  }
}

// POST edit inventory
invCont.updateInventory = async function (req, res) {
  const nav = await utilities.getNav()

  const {
    inv_id,
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
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
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

}

/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  try {
    const nav = await utilities.getNav();
    const vehicle = await invModel.getVehicleById(inv_id);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`;
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: vehicle.inv_id,
      inv_make: vehicle.inv_make,
      inv_model: vehicle.inv_model,
      inv_year: vehicle.inv_year,
      inv_price: vehicle.inv_price,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Process the delete request
 * ************************** */
invCont.deleteVehicle = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);

  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the deletion failed.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};





module.exports = invCont;
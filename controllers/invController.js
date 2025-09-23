const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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

module.exports = invCont;
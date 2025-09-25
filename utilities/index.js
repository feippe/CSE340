const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

// Formateadores
Util.usd = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(Number(n))

Util.commas = (n) => Number(n).toLocaleString("en-US")

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    // 🔧 fix: inicializar el string directamente (antes grid += sobre undefined)
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the vehicle detail HTML
 * ************************************ */
Util.buildVehicleDetail = function (v) {
  return `
  <article class="vehicle-detail">
    <div class="vehicle-detail__media">
      <img src="${v.inv_image}" alt="${v.inv_year} ${v.inv_make} ${v.inv_model}">
    </div>
    <div class="vehicle-detail__content">
      <h2 class="vehicle-detail__title">${v.inv_year} ${v.inv_make} ${v.inv_model}</h2>
      <p class="vehicle-detail__price"><strong>Price:</strong> ${Util.usd(v.inv_price)}</p>
      <ul class="vehicle-detail__specs">
        <li><strong>Mileage:</strong> ${Util.commas(v.inv_miles)} miles</li>
        <li><strong>Color:</strong> ${v.inv_color}</li>
      </ul>
      <p class="vehicle-detail__desc">${v.inv_description}</p>
    </div>
  </article>
  `
}




Util.buildClassificationList = async function (selected_id = null) {
  const data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach(row => {
    classificationList += `<option value="${row.classification_id}"${selected_id && row.classification_id == selected_id ? ' selected' : ''}>${row.classification_name}</option>`
  })
  classificationList += '</select>'
  return classificationList
}

module.exports = Util

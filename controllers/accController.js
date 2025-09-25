const utilities = require("../utilities/")
const accountModel = require('../models/account-model')

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  const nav = await utilities.getNav()
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const {
    rFirstName,
    rLastName,
    rEmail,
    rPassword
  } = req.body

  const regResult = await accountModel.registerAccount(
    rFirstName,
    rLastName,
    rEmail,
    rPassword
  )

  if (regResult) {
    req.flash('notice', `Congratulations, you're registered ${rFirstName}. Please log in.`)
    return res.status(201).render('account/login', { title: 'Login', nav })
  } else {
    req.flash('notice', 'Sorry, the registration failed.')
    return res.status(501).render('account/register', {
        title: 'Registration',
        nav,
        rFirstName,
        rLastName,
        rEmail
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount }
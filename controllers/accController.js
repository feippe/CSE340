const utilities = require("../utilities/")
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')

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

  let hashedPassword

    try {
        hashedPassword = await bcrypt.hashSync(rPassword, 10)
    } catch (error) {
        req.flash('notice', 'Sorry, there was an error processing the registration.')
        return res.status(500).render('account/register', {
            title: 'Registration',
            nav,
            errors: null
        })
    }

    const result = await accountModel.registerAccount(
        rFirstName, rLastName, rEmail, hashedPassword
    )

  if (regResult) {
    req.flash('notice', `Congratulations, you're registered ${rFirstName}. Please log in.`)
    return res.status(201).render('account/login', { title: 'Login', nav })
  } else {
    req.flash('notice', 'Sorry, the registration failed.')
    return res.status(400).render('account/register', {
        title: 'Registration',
        nav,
        errors: req.errors || [],
        rFirstName,
        rLastName,
        rEmail,
        newsletter,
        role
    })
  }
}


module.exports = { buildLogin, buildRegister, registerAccount }
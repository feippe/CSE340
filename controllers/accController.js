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

    const regResult = await accountModel.registerAccount(
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

/* ****************************************
* Build Account Update View
* *************************************** */
async function buildUpdateView(req, res, next) {
    const account_id = parseInt(req.params.account_id);
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/account-update", {
        title: "Update Account Information",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id,
    });
}

/* ****************************************
* Process Account Update
* *************************************** */
async function updateAccount(req, res) {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);

    if (updateResult) {
        req.flash("notice", `${account_firstname}, your information has been updated.`);
        res.redirect("/account/");
    } else {
        const nav = await utilities.getNav();
        req.flash("notice", "Sorry, the update failed.");
        res.status(501).render("account/account-update", {
            title: "Update Account Information",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        });
    }
}

/* ****************************************
* Process Password Update
* *************************************** */
async function updatePassword(req, res) {
    const { account_password, account_id } = req.body;
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id);

    if (updateResult) {
        req.flash("notice", "Your password has been updated.");
        res.redirect("/account/");
    } else {
        const nav = await utilities.getNav();
        const accountData = await accountModel.getAccountById(account_id);
        req.flash("notice", "Sorry, the password update failed.");
        res.status(501).render("account/account-update", {
            title: "Update Account Information",
            nav,
            errors: null,
            account_firstname: accountData.account_firstname,
            account_lastname: accountData.account_lastname,
            account_email: accountData.account_email,
            account_id,
        });
    }
}

/* ****************************************
* Process Logout
* *************************************** */
function logout(req, res) {
    res.clearCookie("jwt");
    res.redirect("/");
}


module.exports = { buildLogin, buildRegister, registerAccount, buildUpdateView, updateAccount, updatePassword, logout }
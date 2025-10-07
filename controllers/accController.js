const utilities = require("../utilities/")
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render(
    "account/login", 
    {
      title: "Login",
      nav,
      errors: null
    }
  )
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
  console.log("--- 1. Entrando a la función registerAccount ---");
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error("Error obteniendo la navegación:", navError);
    req.flash('notice', 'Error interno del servidor.');
    return res.status(500).render('account/register', { title: 'Registration', nav: '', errors: null });
  }
  
  const {
    rFirstName,
    rLastName,
    rEmail,
    rPassword
  } = req.body;

  console.log("--- 2. Hasheando la contraseña ---");
  const hashedPassword = bcrypt.hashSync(rPassword, 10);
  console.log("--- 3. Contraseña hasheada ---");

  console.log("--- 4. Llamando al modelo para registrar la cuenta ---");
  const regResult = await accountModel.registerAccount(
    rFirstName, rLastName, rEmail, hashedPassword
  );
  console.log("--- 5. El modelo ha respondido. Resultado:", regResult);

  if (regResult) {
    console.log("--- 6. Registro exitoso. Renderizando vista de login. ---");
    req.flash('notice', `Congratulations, you're registered ${rFirstName}. Please log in.`);
    return res.status(201).render('account/login', { 
      title: 'Login', 
      nav,
      errors: null
    });
  } else {
    console.log("--- 7. El registro falló. Renderizando vista de registro de nuevo. ---");
    req.flash('notice', 'Sorry, the registration failed.');
    return res.status(400).render('account/register', {
      title: 'Registration',
      nav,
      errors: req.errors || [],
      rFirstName,
      rLastName,
      rEmail
    });
  }
}

/* ****************************************
 * Process Login Request
 * ************************************ */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // Check if account exists
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  // Compare passwords
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password // Remove password from data before creating token
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/") // Redirect to the account management view
    } else {
      // Handle incorrect password
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
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

/* ****************************************
* Build Account Management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
}



module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  buildUpdateView, 
  updateAccount, 
  updatePassword, 
  logout,
  accountLogin,
  buildAccountManagement
}
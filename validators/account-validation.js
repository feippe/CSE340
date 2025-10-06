const { body, validationResult } = require('express-validator')
const accountModel = require('../models/account-model')

function registrationRules() {
  return [
    body('rFirstName')
      .trim().notEmpty().withMessage('First name is required.')
      .isLength({ min: 1 }).withMessage('First name is required.')
      .escape(),

    body('rLastName')
      .trim().notEmpty().withMessage('Last name is required.')
      .isLength({ min: 1 }).withMessage('Last name is required.')
      .escape(),

    body('rEmail')
      .trim()
      .isEmail().withMessage('A valid email is required.')
      .normalizeEmail()
      .custom(async (email) => {
        const exists = await accountModel.checkExistingEmail(email)
        if (exists) {
          throw new Error('Email is already registered.')
        }
        return true
      }),

    body('rPassword')
      .isLength({ min: 12 }).withMessage('Password must be at least 12 characters.')
      .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter.')
      .matches(/\d/).withMessage('Password must include at least one number.')
      .matches(/[^A-Za-z0-9]/).withMessage('Password must include at least one special character.')
  ]
}

async function checkRegData(req, res, next) {
  console.log("--- A. Entrando a checkRegData ---");
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    console.log("--- B. No hay errores de validación. Llamando a next() ---");
    return next();
  }

  console.log("--- C. Se encontraron errores de validación. ---");
  const utilities = require('../utilities/');
  const nav = await utilities.getNav();
  console.log("--- D. Navegación obtenida. Renderizando vista de error. ---");

  return res.status(400).render('account/register', {
    title: 'Registration',
    nav,
    errors: errors.array(),
    rFirstName: req.body.rFirstName,
    rLastName: req.body.rLastName,
    rEmail: req.body.rEmail
  });
}

/* ******************************
 * Check update data and return errors or continue
 * ***************************** */
async function checkUpdateData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await require('../utilities/').getNav();
        const { 
          account_firstname, 
          account_lastname, 
          account_email, 
          account_id 
        } = req.body;
        res.render("account/account-update", {
            title: "Update Account Information",
            nav,
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        });
        return;
    }
    next();
}



function updateAccountRules () {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("Please provide a first name."),
    body("account_lastname").trim().isLength({ min: 2 }).withMessage("Please provide a last name."),
    body("account_email").trim().isEmail().normalizeEmail().withMessage("A valid email is required."),
  ];
}

function updatePasswordRules() {
    return [
        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
}

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
function loginRules() {
  return [
    // email is required and must be valid
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
async function checkLoginData(req, res, next) {
    const { account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await require('../utilities/').getNav()
        res.render("account/login", {
            title: "Login",
            nav,
            errors: errors.array(),
            account_email,
        })
        return
    }
    next()
}

module.exports = { 
  registrationRules, 
  checkRegData, 
  updateAccountRules, 
  updatePasswordRules,
  loginRules,
  checkLoginData,
  checkUpdateData
}

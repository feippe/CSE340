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
        const exists = await accountModel.getAccountByEmail(email)
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
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const utilities = require('../utilities/')
  const nav = await utilities.getNav()

  return res.status(400).render('account/register', {
    title: 'Registration',
    nav,
    errors: errors.array(),
    rFirstName: req.body.rFirstName,
    rLastName: req.body.rLastName,
    rEmail: req.body.rEmail
  })
}

module.exports = { registrationRules, checkRegData }

const express = require('express');
const router = new express.Router();
const { buildLogin, buildRegister, registerAccount, buildUpdateView, updateAccount, updatePassword, logout } = require('../controllers/accController');
const utilities = require("../utilities");
const { registrationRules, checkRegData, updateAccountRules, updatePasswordRules } = require('../validators/account-validation');


router.get("/login/",utilities.handleErrors(buildLogin))
router.get("/register/",utilities.handleErrors(buildRegister))
router.post(
    '/register', 
    registrationRules,
    checkRegData,
    utilities.handleErrors(registerAccount)
)
router.post('/login', (req, res) => {
  res.status(200).send('login process')
})

router.get("/update/:account_id", utilities.handleErrors(buildUpdateView))

router.post(
    "/update/account",
    updateAccountRules,
    checkRegData,
    utilities.handleErrors(updateAccount)
)

router.post(
    "/update/password",
    updatePasswordRules,
    checkRegData,
    utilities.handleErrors(updatePassword)
)

router.get(
  "/logout", 
  utilities.handleErrors(logout)
)


module.exports = router;
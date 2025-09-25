const express = require('express');
const router = new express.Router();
const { buildLogin, buildRegister, registerAccount } = require('../controllers/accController');
const utilities = require("../utilities");
const { registrationRules, checkRegData } = require('../validators/account-validation');


router.get("/login/",utilities.handleErrors(buildLogin))
router.get("/register/",utilities.handleErrors(buildRegister))
router.post(
    '/register', 
    registrationRules(),
    checkRegData,
    utilities.handleErrors(registerAccount)
)
router.post('/login', (req, res) => {
  res.status(200).send('login process')
})
module.exports = router;
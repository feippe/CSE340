const pool = require('../database')

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

async function getAccountByEmail(email) {
  const sql = 'SELECT 1 FROM account WHERE account_email = $1 LIMIT 1'
  const result = await pool.query(sql, [email])
  return result.rowCount > 0
}

/* **********************
 * Check for existing email
 * ********************* */
async function checkExistingEmail(email) {
  const sql = 'SELECT 1 FROM account WHERE account_email = $1 LIMIT 1'
  const result = await pool.query(sql, [email])
  return result.rowCount > 0 // true si existe
}

/* *****************************
* Get account data by id
* ***************************** */
async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
            [account_id]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching account found");
    }
}

/* *****************************
* Update account data
* ***************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
    try {
        const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
        const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
    }
}

/* *****************************
* Update password
* ***************************** */
async function updatePassword(account_password, account_id) {
    try {
        const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *";
        const data = await pool.query(sql, [account_password, account_id]);
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
    }
}

module.exports = { registerAccount, getAccountByEmail, checkExistingEmail, getAccountById, updateAccount, updatePassword }

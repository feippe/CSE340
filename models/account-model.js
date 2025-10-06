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

/* *****************************
 * Get account data using email address
 * ***************************** */
async function getAccountByEmail (account_email) {
  try {
    // We need to select all necessary fields, including the password
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0] // Return the full account object
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* **********************
 * Check for existing email
 * ********************* */
async function checkExistingEmail(email) {
  console.log("--- 1. Entrando a checkExistingEmail para:", email, "---");
  try {
    const sql = "SELECT 1 FROM account WHERE account_email = $1 LIMIT 1";
    console.log("--- 2. Ejecutando la consulta SQL ---");
    const result = await pool.query(sql, [email]);
    console.log("--- 3. La consulta SQL ha terminado. Filas encontradas:", result.rowCount, "---");
    return result.rowCount > 0;
  } catch (error) {
    console.error("--- ERROR en checkExistingEmail: ", error, "---");
    return false;
  }
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

module.exports = { 
  registerAccount, 
  getAccountByEmail, 
  checkExistingEmail, 
  getAccountById, 
  updateAccount, 
  updatePassword 
}

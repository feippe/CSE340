const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


async function getVehicleById(inv_id) {
  try {
    const sql = `
      SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
             inv_color, inv_description, inv_image, inv_thumbnail,
             classification_id
      FROM inventory
      WHERE inv_id = $1
      LIMIT 1;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}



module.exports = {
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleById
}

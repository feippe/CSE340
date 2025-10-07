// models/review-model.js
const pool = require("../database/");

/* *****************************
* Add a new review
* *************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const sql = "INSERT INTO reviews (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *";
        const result = await pool.query(sql, [review_text, inv_id, account_id]);
        return result.rows[0];
    } catch (error) {
        console.error("addReview error: " + error);
        return null;
    }
}

/* *****************************
* Get all reviews for a specific inventory item
* *************************** */
async function getReviewsByInventoryId(inv_id) {
    try {
        // We join with the account table to get the reviewer's first name
        const sql = `
            SELECT r.review_text, r.review_date, a.account_firstname 
            FROM reviews AS r 
            JOIN account AS a ON r.account_id = a.account_id 
            WHERE r.inv_id = $1 
            ORDER BY r.review_date DESC
        `;
        const result = await pool.query(sql, [inv_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByInventoryId error: " + error);
        return [];
    }
}

module.exports = { addReview, getReviewsByInventoryId };
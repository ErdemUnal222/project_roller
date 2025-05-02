// Define the OrderModel class to handle operations related to the "orders" table
class OrderModel {
  constructor(db) {
    // Store the database connection instance
    this.db = db;
  }

  // Save a new order into the database
  async saveOneOrder(userId, totalAmount, totalProducts) {
    try {
      // Insert a new order record into the "orders" table
      const result = await this.db.query(
        `INSERT INTO orders (users_id, total, total_products, status, created_at) 
         VALUES (?, ?, ?, 'Processing', NOW())`,
        [userId, totalAmount, totalProducts]
      );
      return result; // Return the result (no destructuring)
    } catch (err) {
      console.error("Error in saveOneOrder:", err);
      return { code: 500, message: 'Error saving order' };
    }
  }

  // Update the status of an order (e.g., "Paid", "Shipped", "Cancelled")
  async updateStatus(orderId, status) {
    try {
      // Update the status of the specified order in the database
      const [result] = await this.db.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in updateStatus:", err);
      return { code: 500, message: 'Error updating order status' };
    }
  }

  // Retrieve all orders from the database, ordered by creation date
  async getAllOrders() {
    try {
      // Fetch all orders ordered by "created_at" in descending order
      const [result] = await this.db.query(`SELECT * FROM orders ORDER BY created_at DESC`);
      return result;
    } catch (err) {
      console.error("Error in getAllOrders:", err);
      return { code: 500, message: 'Error retrieving orders' };
    }
  }

  // Retrieve a specific order by its ID
  async getOneOrder(orderId) {
    try {
      // Fetch a single order based on the provided order ID
      const [result] = await this.db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);
      return result;
    } catch (err) {
      console.error("Error in getOneOrder:", err);
      return { code: 500, message: 'Error retrieving order' };
    }
  }
  // Delete an order by its ID
async deleteOneOrder(orderId) {
  try {
    const [result] = await this.db.query(`DELETE FROM orders WHERE id = ?`, [orderId]);
    return result;
  } catch (err) {
    console.error("Error in deleteOneOrder:", err);
    return { code: 500, message: 'Error deleting order' };
  }
}

}

// Export the model using a factory function that injects the database connection
module.exports = (db) => new OrderModel(db);

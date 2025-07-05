// The OrderModel class encapsulates all database operations related to orders
class OrderModel {
  constructor(db) {
    this.db = db; // Database connection instance
  }

  /**
   * CREATE: Save a new order into the `orders` table.
   * - The order is linked to a user.
   * - The status is initially set to "Processing".
   * - The timestamp is automatically set to NOW().
   */
  async saveOneOrder(userId, totalAmount, totalProducts) {
    try {
      const result = await this.db.query(
        `INSERT INTO orders (users_id, total, total_products, status, created_at) 
         VALUES (?, ?, ?, 'Processing', NOW())`,
        [userId, totalAmount, totalProducts]
      );
      return result; // Includes insertId
    } catch (err) {
      console.error("Error in saveOneOrder:", err);
      return { code: 500, message: 'Error saving order' };
    }
  }

  /**
   * UPDATE: Change the status of an order (e.g., 'Paid', 'Shipped', 'Cancelled')
   */
  async updateStatus(orderId, status) {
    try {
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

  /**
   * READ: Retrieve all orders (admin or backoffice use), sorted by creation date
   */
  async getAllOrders() {
    try {
      const [result] = await this.db.query(
        `SELECT * FROM orders ORDER BY created_at DESC`
      );
      return result;
    } catch (err) {
      console.error("Error in getAllOrders:", err);
      return { code: 500, message: 'Error retrieving orders' };
    }
  }

  /**
   * READ: Fetch a specific order by ID
   */
  async getOneOrder(orderId) {
    try {
      const [result] = await this.db.query(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in getOneOrder:", err);
      return { code: 500, message: 'Error retrieving order' };
    }
  }

  /**
   * DELETE: Remove an order by its ID
   */
  async deleteOneOrder(orderId) {
    try {
      const [result] = await this.db.query(
        `DELETE FROM orders WHERE id = ?`,
        [orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in deleteOneOrder:", err);
      return { code: 500, message: 'Error deleting order' };
    }
  }
}

// Export the model using dependency injection for the database
module.exports = (db) => new OrderModel(db);

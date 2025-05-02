// Define the OrderDetailsModel class to handle operations related to order details
class OrderDetailsModel {
  constructor(db) {
    // Save the database connection instance
    this.db = db;
  }

  // Add multiple products to an order (order details)
  async addOrderDetails(orderId, items) {
    try {
      // Map through each item and insert it into the order_details table
      const promises = items.map(item => {
        return this.db.query(
          `INSERT INTO order_details (orders_id, products_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      });

      // Wait for all insert operations to complete
      await Promise.all(promises);
      return { status: 201, message: "Order details saved" };
    } catch (err) {
      console.error("Error in addOrderDetails:", err);
      return { code: 500, message: "Failed to save order details" };
    }
  }

  // Retrieve all items in an order by the order's ID
  async getOrderDetailsByOrderId(orderId) {
    try {
      // Fetch order details along with product titles and pictures using a JOIN query
      const [result] = await this.db.query(
        `SELECT od.*, p.title, p.picture 
         FROM order_details od
         JOIN products p ON od.products_id = p.id
         WHERE od.orders_id = ?`,
        [orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in getOrderDetailsByOrderId:", err);
      return { code: 500, message: "Failed to fetch order details" };
    }
  }
}

// Export the model using a factory function that injects the database connection
module.exports = (db) => new OrderDetailsModel(db);

// OrderDetailsModel manages the link between orders and their individual product items
class OrderDetailsModel {
  constructor(db) {
    this.db = db; // MySQL connection instance
  }

  /**
   * Add product items to an order.
   * - Each item in the `items` array represents a product added to a specific order.
   * - Each item has a productId, quantity, and price.
   */
  async addOrderDetails(orderId, items) {
    try {
      // Prepare and execute INSERT queries for each product in the order
      const promises = items.map(item => {
        return this.db.query(
          `INSERT INTO order_details (orders_id, products_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      });

      // Wait for all product inserts to complete in parallel
      await Promise.all(promises);

      return { status: 201, message: "Order details saved" };
    } catch (err) {
      console.error("Error in addOrderDetails:", err);
      return { code: 500, message: "Failed to save order details" };
    }
  }

  /**
   * Retrieve all product items for a given order ID.
   * - Joins product data (title, image) with the order_details entries.
   */
  async getOrderDetailsByOrderId(orderId) {
    try {
      const [result] = await this.db.query(
        `SELECT 
           od.*,              -- order detail fields (quantity, unit_price)
           p.title,           -- product title
           p.picture          -- product image
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

// Factory function to export the model with DB injection
module.exports = (db) => new OrderDetailsModel(db);

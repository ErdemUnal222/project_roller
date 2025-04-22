module.exports = (_db) => {
    const db = _db;
    return OrderDetailsModel;
};

class OrderDetailsModel {
    // Add multiple products to an order
    static async addOrderDetails(orderId, items) {
        try {
            const promises = items.map(item => {
                return db.query(
                    `INSERT INTO order_details (order_id, product_id, quantity, price)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.price]
                );
            });

            await Promise.all(promises);
            return { status: 201, message: "Order details saved" };
        } catch (err) {
            console.error("Error in addOrderDetails:", err);
            return { code: 500, message: "Failed to save order details" };
        }
    }

    // Get all items in an order
    static async getOrderDetailsByOrderId(orderId) {
        try {
            const result = await db.query(
                `SELECT od.*, p.title, p.picture 
                 FROM order_details od
                 JOIN products p ON od.product_id = p.id
                 WHERE od.order_id = ?`,
                [orderId]
            );
            return result;
        } catch (err) {
            console.error("Error in getOrderDetailsByOrderId:", err);
            return { code: 500, message: "Failed to fetch order details" };
        }
    }
}

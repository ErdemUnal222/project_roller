module.exports = (_db) => {
    const db = _db;
    return OrderModel;
};

class OrderModel {
    // Save a new order
    static async saveOneOrder(userId, totalAmount) {
        try {
            const result = await db.query(
                `INSERT INTO orders (user_id, total_amount, status, created_at) 
                 VALUES (?, ?, 'pending', NOW())`,
                [userId, totalAmount]
            );
            return result;
        } catch (err) {
            console.error("Error in saveOneOrder:", err);
            return { code: 500, message: 'Error saving order' };
        }
    }

    // Update the status of an order (e.g. paid, shipped, cancelled)
    static async updateStatus(orderId, status) {
        try {
            const result = await db.query(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, orderId]
            );
            return result;
        } catch (err) {
            console.error("Error in updateStatus:", err);
            return { code: 500, message: 'Error updating order status' };
        }
    }

    // Get all orders
    static async getAllOrders() {
        try {
            const result = await db.query(`SELECT * FROM orders ORDER BY created_at DESC`);
            return result;
        } catch (err) {
            console.error("Error in getAllOrders:", err);
            return { code: 500, message: 'Error retrieving orders' };
        }
    }

    // Get one specific order by ID
    static async getOneOrder(orderId) {
        try {
            const result = await db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);
            return result;
        } catch (err) {
            console.error("Error in getOneOrder:", err);
            return { code: 500, message: 'Error retrieving order' };
        }
    }
}

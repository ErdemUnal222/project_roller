// Export a function that receives a database connection
module.exports = (db) => {

  // Controller to retrieve an overview of general statistics
  const getOverviewStats = async (req, res) => {
    try {
      // Query total number of users
      const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

      // Query total number of events
      const [[events]] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');

      // Query total number of products
      const [[products]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');

      // Query total number of orders and their total revenue
      const [[orders]] = await db.query('SELECT COUNT(*) AS totalOrders, SUM(total) AS totalRevenue FROM orders');

      // Send the collected statistics back in the response
      res.status(200).json({
        status: 200,
        stats: {
          totalUsers: users.totalUsers,
          totalEvents: events.totalEvents,
          totalProducts: products.totalProducts,
          totalOrders: orders.totalOrders,
          totalRevenue: orders.totalRevenue || 0 // Handle null if no orders exist
        }
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ status: 500, msg: "Error fetching statistics" });
    }
  };

  // Export the controller function
  return { getOverviewStats };
};

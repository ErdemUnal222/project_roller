// Export a function that receives a database connection instance
module.exports = (db) => {

  // GET overview statistics for dashboard use (counts + revenue)
  const getOverviewStats = async (req, res, next) => {
    try {
      // Execute SQL queries to gather various statistics
      const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
      const [[events]] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');
      const [[products]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
      const [[orders]] = await db.query('SELECT COUNT(*) AS totalOrders, SUM(total) AS totalRevenue FROM orders');

      // Return aggregated statistics in a structured JSON response
      res.status(200).json({
        status: 200,
        stats: {
          totalUsers: users.totalUsers,
          totalEvents: events.totalEvents,
          totalProducts: products.totalProducts,
          totalOrders: orders.totalOrders,
          totalRevenue: orders.totalRevenue || 0 // fallback to 0 if null
        }
      });
    } catch (err) {
      // Forward error to centralized error handler
      next({ status: 500, message: "Error fetching statistics" });
    }
  };

  // Return the controller method(s)
  return { getOverviewStats };
};

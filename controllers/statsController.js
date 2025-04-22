module.exports = () => {
    const getOverviewStats = async (req, res) => {
        try {
            const [users] = await req.db.query('SELECT COUNT(*) AS totalUsers FROM users');
            const [events] = await req.db.query('SELECT COUNT(*) AS totalEvents FROM events');
            const [products] = await req.db.query('SELECT COUNT(*) AS totalProducts FROM products');
            const [orders] = await req.db.query('SELECT COUNT(*) AS totalOrders, SUM(total) AS totalRevenue FROM orders');

            res.status(200).json({
                status: 200,
                stats: {
                    totalUsers: users.totalUsers,
                    totalEvents: events.totalEvents,
                    totalProducts: products.totalProducts,
                    totalOrders: orders.totalOrders,
                    totalRevenue: orders.totalRevenue || 0
                }
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
            res.status(500).json({ status: 500, msg: "Error fetching statistics" });
        }
    };

    return {
        getOverviewStats
    };
};

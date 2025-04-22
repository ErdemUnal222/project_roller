const express = require('express');
const router = express.Router();

module.exports = (app, db) => {
    const routeModules = [
        require('./authRoutes'),
        require('./userRoutes'),
        require('./eventRoutes'),
        require('./orderRoutes'),
        require('./messageRoutes'),
        require('./commentControllerRoutes'),
        require('./productRoutes'),
        require('./availabilityRoutes'),
        require('./statsRoutes'),
        require('./webhookRoutes')
    ];

    routeModules.forEach(register => register(router, db));
    app.use('/api/v1', router);
};

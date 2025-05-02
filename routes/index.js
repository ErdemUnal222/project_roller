// routes/index.js
const express = require('express');
const router = express.Router();


module.exports = (app, db) => {
  // Load all route files and give them access to router + db

  require('./authRoutes')(router, db);
  require('./availabilityRoutes')(router, db);
  require('./commentControllerRoutes')(router, db);
  require('./eventRoutes')(router, db);
  require('./messageRoutes')(router, db);
  require('./orderRoutes')(router, db);
  require('./productRoutes')(router, db);
  require('./statsRoutes')(router, db);
  require('./userRoutes')(router, db);
  require('./webhookRoutes')(router, db);

  // Always mount under /api/v1
  app.use('/api/v1', router);
};

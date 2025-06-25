// backend/routes/index.js
module.exports = (router, db) => {
  require('./authRoutes')(router, db);
  require('./productRoutes')(router, db);
  require('./availabilityRoutes')(router, db);
  require('./commentControllerRoutes')(router, db);
  require('./eventRoutes')(router, db);
  require('./messageRoutes')(router, db); // ✅ Correct path: routes/messageRoutes
  require('./orderRoutes')(router, db);
  require('./statsRoutes')(router, db);
  require('./userRoutes')(router, db);
  require('./webhookRoutes')(router, db);
};

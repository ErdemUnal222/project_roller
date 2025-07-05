// Export a function that takes in a router instance and the db connection
module.exports = (router, db) => {
  require('./authRoutes')(router, db);
  require('./productRoutes')(router, db);
  require('./availabilityRoutes')(router, db);
  require('./commentControllerRoutes')(router, db);
  require('./eventRoutes')(router, db);
  require('./messageRoutes')(router, db); 
  require('./orderRoutes')(router, db);
  require('./statsRoutes')(router, db);
  require('./userRoutes')(router, db);
  require('./webhookRoutes')(router, db);
};

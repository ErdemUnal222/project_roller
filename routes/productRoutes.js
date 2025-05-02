const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const productControllerFactory = require('../controllers/productController');
const productModelFactory = require('../models/ProductModel');

// Export a function that receives parentRouter and db
module.exports = (parentRouter, db) => {
  const productModel = productModelFactory(db);
  const productController = productControllerFactory(productModel);

  // All routes below are protected (withAuth middleware ensures the user is authenticated)
  
  // Route to create a new product
  router.post('/products', withAuth, productController.saveProduct); // POST /api/v1/products
  
  // Route to retrieve all products
  router.get('/products', withAuth, productController.getAllProducts); // GET /api/v1/products
  
  // Route to retrieve a specific product by its ID
  router.get('/products/:id', withAuth, productController.getOneProduct); // GET /api/v1/products/:id
  
  // Route to update an existing product by its ID
  router.put('/products/:id', withAuth, productController.updateProduct); // PUT /api/v1/products/:id
  
  // Route to delete a product by its ID
  router.delete('/products/:id', withAuth, productController.deleteProduct); // DELETE /api/v1/products/:id

  // Mount the product routes on the parent router
  parentRouter.use('/', router);
};

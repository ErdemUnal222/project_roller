const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

const productModelFactory = require('../models/ProductModel');
const productControllerFactory = require('../controllers/productController');

module.exports = (parentRouter, db) => {
  const productModel = productModelFactory(db);
  const productController = productControllerFactory(productModel);

  // Public shop routes (used on storefront)
  router.get('/shop', productController.getAllProducts);         // Display all products
  router.get('/shop/:id', productController.getOneProduct);      // Display one product

  // Admin-only product management
  router.get('/products', withAuth, withAuthAdmin, productController.getAllProducts);             // Admin view
  router.get('/products/:id', withAuth, withAuthAdmin, productController.getOneProduct);          // Product detail for editing
  router.post('/products/add', withAuth, withAuthAdmin, productController.saveProduct);           // Create new product
  router.put('/products/edit/:id', withAuth, withAuthAdmin, productController.updateProduct);     // Update product
  router.delete('/products/:id', withAuth, withAuthAdmin, productController.deleteProduct);       // Delete product


  // Register routes
  parentRouter.use('/', router);
};

const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');
const productModelFactory = require('../models/ProductModel');
const productControllerFactory = require('../controllers/productController');

module.exports = (parentRouter, db) => {
  const productModel = productModelFactory(db);
  const productController = productControllerFactory(productModel);

  console.log("Product routes initialized");

  // Debug route to test connectivity
  router.get('/products/debug-route', (req, res) => {
    console.log("HIT: /products/debug-route inside productRoutes.js");
    res.json({ msg: "Debug route works" });
  });

  // Product management routes
  router.get('/products', productController.getAllProducts);
  router.get('/products/:id', productController.getOneProduct);
  router.post('/products/add', withAuth, productController.saveProduct);
  router.put('/products/edit/:id', withAuth, productController.updateProduct);
  router.delete('/products/:id', withAuth, productController.deleteProduct);

  // ✅ Mount this router into the main parent router
  parentRouter.use('/', router);
};

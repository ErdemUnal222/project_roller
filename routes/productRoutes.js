const express = require('express');
const router = express.Router();
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
    const ProductModel = require("../models/ProductModel")(db);
    const productController = require("../controllers/productController")(ProductModel);

    router.get('/products', productController.getAllProducts);
    router.get('/product/:id', productController.getOneProduct);
    router.post('/product', withAuthAdmin, productController.saveProduct); 
    router.put('/product/:id', withAuthAdmin, productController.updateProduct);
    router.delete('/product/:id', withAuthAdmin, productController.deleteProduct);

    parentRouter.use('/', router);
};
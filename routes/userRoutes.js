const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (parentRouter, db) => {
    const UserModel = require("../models/UserModel")(db);
    const userController = require("../controllers/userController")(UserModel); // ✅ make sure to call the controller

    router.get('/users', withAuth, userController.getAllUsers);
    router.get('/user/:id', withAuth, userController.getOneUser);

    parentRouter.use('/', router);
};

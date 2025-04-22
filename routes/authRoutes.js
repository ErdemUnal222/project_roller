const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth');

module.exports = (parentRouter, db) => {
    const UserModel = require("../models/UserModel")(db);
    const authController = require("../controllers/authController")(UserModel);

    router.get('/user/checkToken', withAuth, authController.checkToken);
    router.post('/user/register', authController.saveUser);
    router.post('/user/login', authController.connectUser);
    router.put('/user/update/:id', withAuth, authController.updateUser);
    router.delete('/user/delete/:id', withAuth, authController.deleteUser);

    parentRouter.use('/', router);
};
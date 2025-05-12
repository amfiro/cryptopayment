const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Регистрация (без middleware)
router.post('/register', authController.register);

// Логин
router.post('/login', authController.login);

module.exports = router;
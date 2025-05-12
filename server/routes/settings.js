const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['admin']), settingsController.updateSystemSettings);

module.exports = router;
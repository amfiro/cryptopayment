const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin']), roleController.getRoles);
router.post('/update', authMiddleware, roleMiddleware(['admin']), roleController.updateRole);
router.post('/agent', authMiddleware, roleMiddleware(['admin']), roleController.createAgent);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/me', authMiddleware, userController.getUser);
router.get('/', authMiddleware, roleMiddleware(['admin']), userController.getAllUsers);
router.put('/', authMiddleware, userController.updateUser);
router.post('/agent', authMiddleware, roleMiddleware(['admin']), userController.createAgent);
router.get('/agent/:agentId/clients', authMiddleware, roleMiddleware(['admin', 'agent']), userController.getAgentClients);
router.post('/api-key', authMiddleware, userController.generateApiKey);

module.exports = router;
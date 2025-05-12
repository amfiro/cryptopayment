const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/system', authMiddleware, roleMiddleware(['admin']), analyticsController.getSystemAnalytics);
router.get('/user/:userId', authMiddleware, roleMiddleware(['admin', 'agent', 'support', 'senior_support']), analyticsController.getUserAnalytics);
router.get('/agent/:agentId', authMiddleware, roleMiddleware(['admin', 'agent']), analyticsController.getAgentMetrics);

module.exports = router;
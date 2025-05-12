const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, ticketController.createTicket);
router.get('/', authMiddleware, ticketController.getUserTickets);
router.get('/all', authMiddleware, roleMiddleware(['admin', 'support', 'senior_support']), ticketController.getAllTickets);
router.put('/status', authMiddleware, roleMiddleware(['admin', 'support', 'senior_support']), ticketController.updateTicketStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, paymentController.createPaymentRequest);
router.get('/:id', authMiddleware, paymentController.getPaymentRequest);
router.get('/currencies', authMiddleware, paymentController.getEnabledCurrencies);

module.exports = router;
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, transactionController.getUserTransactions);
router.get('/all', authMiddleware, roleMiddleware(['admin']), transactionController.getAllTransactions);
router.get('/balance', authMiddleware, transactionController.getUserBalance);
router.post('/force-transfer', authMiddleware, roleMiddleware(['admin']), transactionController.forceTransfer);
router.get('/main-balances', authMiddleware, roleMiddleware(['admin']), transactionController.getMainWalletBalances);
router.get('/csv', authMiddleware, transactionController.generateTransactionCSV);

module.exports = router;
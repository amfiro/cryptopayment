const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, walletController.addWallet);
router.post('/main', authMiddleware, walletController.changeMainWallet);
router.post('/client', authMiddleware, walletController.generateClientWallets);
router.put('/label', authMiddleware, walletController.updateWalletLabel);
router.put('/category', authMiddleware, walletController.updateWalletCategory);
router.get('/balances', authMiddleware, walletController.getWalletBalances);

module.exports = router;
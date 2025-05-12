const express = require('express');
const router = express.Router();
const WithdrawalRequest = require('../models/WithdrawalRequest');
const AgentWithdrawalRequest = require('../models/AgentWithdrawalRequest');
const userService = require('../services/userService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

exports.createWithdrawalRequest = async (req, res) => {
  try {
    const { amount, currency, address } = req.body;
    if (!amount || !currency || !address) {
      return res.status(400).json({ error: 'Требуются сумма, валюта и адрес' });
    }
    const withdrawalRequest = await WithdrawalRequest.create({
      userId: req.user.userId,
      amount,
      address,
      currency,
      status: 'pending',
      timestamp: new Date()
    });
    res.status(201).json(withdrawalRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    if (!['admin', 'senior_support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const withdrawals = await WithdrawalRequest.find({ status: 'pending' }).populate('userId');
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!['admin', 'senior_support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Запрос не найден или уже обработан' });
    }
    request.status = 'approved';
    request.txHash = 'mockTransactionHash'; // Заменить на реальную транзакцию
    request.timestamp = new Date();
    await request.save();
    res.json({ message: 'Запрос на вывод подтверждён', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!['admin', 'senior_support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Запрос не найден или уже обработан' });
    }
    request.status = 'rejected';
    request.timestamp = new Date();
    await request.save();
    res.json({ message: 'Запрос на вывод отклонён', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post('/', authMiddleware, exports.createWithdrawalRequest);
router.get('/pending', authMiddleware, roleMiddleware(['admin', 'senior_support']), exports.getPendingWithdrawals);
router.post('/approve/:requestId', authMiddleware, roleMiddleware(['admin', 'senior_support']), exports.approveWithdrawal);
router.post('/reject/:requestId', authMiddleware, roleMiddleware(['admin', 'senior_support']), exports.rejectWithdrawal);

module.exports = router;
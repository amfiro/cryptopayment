const transactionService = require('../services/transactionService');

exports.createPaymentRequest = async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Требуются сумма и валюта' });
    }
    const paymentRequest = await transactionService.createPaymentRequest(req.user.userId, amount, currency, description);
    res.status(201).json(paymentRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentRequest = async (req, res) => {
  try {
    const paymentRequest = await transactionService.getPaymentRequest(req.params.id);
    if (!paymentRequest || paymentRequest.userId.toString() !== req.user.userId.toString()) {
      return res.status(404).json({ error: 'Платежный запрос не найден' });
    }
    res.json(paymentRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnabledCurrencies = async (req, res) => {
  try {
    const currencies = await transactionService.getEnabledCurrencies();
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const mongoose = require('mongoose');
const PaymentRequest = require('../models/PaymentRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const userService = require('./userService');
const fs = require('fs');

const SUPPORTED_CURRENCIES = [
  { symbol: 'USDT', name: 'USDT (TRC20)', chain: 'TRC20', enabled: true },
  { symbol: 'ETH', name: 'ETH', chain: 'ETH', enabled: true },
  { symbol: 'USDT', name: 'USDT (ERC20)', chain: 'ERC20', enabled: true }
];

async function createPaymentRequest(userId, amount, currency, description) {
  const user = await userService.getUserById(userId);
  if (!user) throw new Error('Пользователь не найден');

  const cryptoType = currency;
  const address = cryptoType.includes('TRC20') ? user.tronAddress : user.ethereumAddress;
  const UID = mongoose.Types.ObjectId().toString();

  const paymentRequest = await PaymentRequest.create({
    userId,
    amount,
    address,
    cryptoType,
    description,
    status: 'pending',
    timestamp: new Date()
  });

  return paymentRequest;
}

async function getPaymentRequest(UID) {
  return await PaymentRequest.findById(UID);
}

async function getEnabledCurrencies() {
  return SUPPORTED_CURRENCIES.filter(c => c.enabled);
}

async function calculateBalances(userId) {
  const transactions = await Transaction.find({ userId });
  const balances = {};

  for (const transaction of transactions) {
    const currency = transaction.currency;
    balances[currency] = (balances[currency] || 0) + transaction.amount;
  }

  return balances;
}

async function getUserStats(userId) {
  const stats = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const last7days = new Date(today);
  last7days.setDate(today.getDate() - 7);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const periods = {
    today: { start: today, end: today },
    yesterday: { start: yesterday, end: yesterday },
    last7days: { start: last7days, end: today },
    currentMonth: { start: startOfMonth, end: today }
  };

  for (const [period, { start, end }] of Object.entries(periods)) {
    const transactions = await Transaction.find({
      userId,
      timestamp: { $gte: start, $lte: end }
    });

    let totalReceived = 0;
    let totalNet = 0;

    for (const transaction of transactions) {
      const commission = transaction.amount * (transaction.commissionPercentage / 100);
      totalReceived += transaction.amount;
      totalNet += transaction.amount - commission;

      const user = await userService.getUserById(userId);
      if (user.agentId && user.agentRate) {
        const agentCommission = commission * user.agentRate;
        await userService.updateAgentBalance(user.agentId, agentCommission);
      }
    }

    stats[period] = { totalReceived, totalNet };
  }

  return stats;
}

async function getOverallStats() {
  const stats = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const last7days = new Date(today);
  last7days.setDate(today.getDate() - 7);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const periods = {
    today: { start: today, end: today },
    yesterday: { start: yesterday, end: yesterday },
    last7days: { start: last7days, end: today },
    currentMonth: { start: startOfMonth, end: today }
  };

  for (const [period, { start, end }] of Object.entries(periods)) {
    const transactions = await Transaction.find({
      timestamp: { $gte: start, $lte: end }
    });

    let totalReceived = 0;
    let totalCommission = 0;

    for (const transaction of transactions) {
      const commission = transaction.amount * (transaction.commissionPercentage / 100);
      totalReceived += transaction.amount;
      totalCommission += commission;
    }

    stats[period] = { totalReceived, totalCommission };
  }

  return stats;
}

async function getUserTransactions(userId) {
  return await Transaction.find({ userId });
}

async function getAllTransactions() {
  return await Transaction.find();
}

async function getUserBalance(userId) {
  const transactions = await Transaction.find({ userId });
  const balance = { trc20Usdt: 0 };

  for (const transaction of transactions) {
    if (transaction.currency === 'TRC20_USDT') {
      balance.trc20Usdt += transaction.amount;
    }
  }

  return balance;
}

async function forceTransfer(userId, currency) {
  const balance = await getUserBalance(userId);
  const amount = balance.trc20Usdt;
  if (amount <= 0) return 0;

  await Transaction.create({
    userId,
    amount: -amount,
    currency,
    commissionPercentage: 0,
    timestamp: new Date()
  });

  return amount;
}

async function getMainWalletBalances() {
  const transactions = await Transaction.find();
  const balances = { trc20Usdt: 0, eth: 0, erc20Usdt: 0 };

  for (const transaction of transactions) {
    const commission = transaction.amount * (transaction.commissionPercentage / 100);
    if (transaction.currency === 'TRC20_USDT') {
      balances.trc20Usdt += commission;
    } else if (transaction.currency === 'ETH') {
      balances.eth += commission;
    } else if (transaction.currency === 'ERC20_USDT') {
      balances.erc20Usdt += commission;
    }
  }

  return balances;
}

async function generateTransactionCSV(transactions, filename) {
  const content = ['Timestamp,UserID,Amount,Currency,CommissionPercentage'];
  for (const transaction of transactions) {
    content.push(`${transaction.timestamp},${transaction.userId},${transaction.amount},${transaction.currency},${transaction.commissionPercentage}`);
  }
  fs.writeFileSync(filename, content.join('\n'));
}

module.exports = {
  createPaymentRequest,
  getPaymentRequest,
  getEnabledCurrencies,
  calculateBalances,
  getUserStats,
  getOverallStats,
  getUserTransactions,
  getAllTransactions,
  getUserBalance,
  forceTransfer,
  getMainWalletBalances,
  generateTransactionCSV
};
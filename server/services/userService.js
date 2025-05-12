const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Agent = require('../models/Agent');
const AgentWithdrawalRequest = require('../models/AgentWithdrawalRequest');
const transactionService = require('./transactionService');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function registerUser({ email, username, password, name, role = 'client' }) {
  const existingUser = await User.findOne({ $or: [{ email }, { login: username }] });
  if (existingUser) {
    throw new Error('Пользователь с таким email или username уже существует.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    login: username,
    password: hashedPassword,
    name,
    role,
    tronAddress: generateTronAddress(),
    ethereumAddress: generateEthereumAddress()
  });

  await logAction('User Registered', { userId: user._id, email, username });
  return user;
}

async function loginUser({ login, password }) {
  const user = await User.findOne({ $or: [{ email: login }, { login }] });
  if (!user) {
    throw new Error('Пользователь не найден.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Неверный пароль.');
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  await logAction('User Logged In', { userId: user._id });
  return { token, user };
}

async function getUserById(userId) {
  return await User.findById(userId);
}

async function getUserByUsername(username) {
  return await User.findOne({ login: username });
}

async function getUserByApiKey(apiKey) {
  return await User.findOne({ apiKey });
}

async function getAllUsers() {
  return await User.find();
}

async function updateUser(userId, updates) {
  return await User.findByIdAndUpdate(userId, updates, { new: true });
}

async function updateAutoWithdrawSettings(userId, settings) {
  return await User.findByIdAndUpdate(userId, {
    autoWithdrawEnabled: settings.enabled,
    autoWithdrawThreshold: settings.threshold,
    autoWithdrawAddress: settings.address,
    autoWithdrawCurrency: settings.currency
  }, { new: true });
}

async function generateApiKey(userId) {
  const apiKey = uuidv4();
  await User.findByIdAndUpdate(userId, { apiKey });
  return apiKey;
}

async function logAction(action, details) {
  return await AuditLog.create({ action, details });
}

async function getAuditLogs() {
  return await AuditLog.find().sort({ timestamp: -1 });
}

function generateTronAddress() {
  return 'T' + Math.random().toString(36).substr(2, 33);
}

function generateEthereumAddress() {
  return '0x' + Math.random().toString(16).substr(2, 40);
}

async function createAgent(username, name) {
  const existingAgent = await Agent.findOne({ username });
  if (existingAgent) return existingAgent;
  return await Agent.create({ username, name });
}

async function getAgent(username) {
  return await Agent.findOne({ username });
}

async function getAgentById(agentId) {
  return await Agent.findById(agentId);
}

async function updateAgentBalance(agentId, amount) {
  return await Agent.findByIdAndUpdate(agentId, { $inc: { balance: amount } }, { new: true });
}

async function getClientsByAgent(agentId) {
  return await User.find({ agentId });
}

async function createAgentWithdrawalRequest(agentId, amount, address, currency) {
  return await AgentWithdrawalRequest.create({ agentId, amount, address, currency });
}

async function getPendingAgentWithdrawals() {
  return await AgentWithdrawalRequest.find({ status: 'pending' }).populate('agentId');
}

async function approveAgentWithdrawal(requestId) {
  const request = await AgentWithdrawalRequest.findById(requestId).populate('agentId');
  if (!request || request.status !== 'pending') {
    return { success: false, error: 'Запрос не найден или уже обработан.' };
  }

  request.status = 'approved';
  request.updatedAt = new Date();
  await request.save();

  await Agent.findByIdAndUpdate(request.agentId._id, { $inc: { balance: -request.amount } });

  return {
    success: true,
    userId: request.agentId._id,
    userName: request.agentId.name,
    amount: request.amount,
    currency: request.currency,
    txHash: 'mockTransactionHash'
  };
}

async function rejectAgentWithdrawal(requestId) {
  const request = await AgentWithdrawalRequest.findById(requestId).populate('agentId');
  if (!request || request.status !== 'pending') {
    return { success: false, error: 'Запрос не найден или уже обработан.' };
  }

  request.status = 'rejected';
  request.updatedAt = new Date();
  await request.save();

  return {
    success: true,
    userId: request.agentId._id,
    userName: request.agentId.name,
    amount: request.amount,
    currency: request.currency
  };
}

async function addWallet(userId, network, address, label = '', category = '') {
  const user = await User.findById(userId);
  if (!user) throw new Error('Пользователь не найден');
  if (user.additionalWallets.length >= 50) throw new Error('Достигнут лимит кошельков (50)');

  user.additionalWallets.push({ network, address, label, category });
  await user.save();
  return user;
}

async function changeMainWallet(userId, network, address) {
  const updates = network === 'TRC20' ? { tronAddress: address } : { ethereumAddress: address };
  return await User.findByIdAndUpdate(userId, updates, { new: true });
}

async function generateClientWallets(userId, count, network, label = '', category = '') {
  const user = await User.findById(userId);
  if (!user) throw new Error('Пользователь не найден');
  if (count > 5000) throw new Error('Лимит кошельков для клиентов клиента — 5000');

  const clientIds = Array.from({ length: count }, () => uuidv4());
  const newWallets = clientIds.map(clientId => ({
    clientId,
    network,
    address: network === 'TRC20' ? generateTronAddress() : generateEthereumAddress(),
    label,
    category
  }));

  user.clientWallets.push(...newWallets);
  await user.save();
  return user;
}

async function updateWalletLabel(userId, walletType, index, label) {
  const user = await User.findById(userId);
  if (!user) throw new Error('Пользователь не найден');

  if (walletType === 'main') {
    if (index === 'TRC20') user.tronAddressLabel = label;
    else if (index === 'ERC20') user.ethereumAddressLabel = label;
  } else if (walletType === 'additional') {
    user.additionalWallets[index].label = label;
  } else if (walletType === 'client') {
    user.clientWallets[index].label = label;
  }
  await user.save();
  return user;
}

async function updateWalletCategory(userId, walletType, index, category) {
  const user = await User.findById(userId);
  if (!user) throw new Error('Пользователь не найден');

  if (walletType === 'additional') {
    user.additionalWallets[index].category = category;
  } else if (walletType === 'client') {
    user.clientWallets[index].category = category;
  }
  await user.save();
  return user;
}

async function getAgentMetrics(agentId) {
  const clients = await User.find({ agentId });
  let totalTurnover = 0;
  let totalCommission = 0;
  for (const client of clients) {
    const stats = await transactionService.getUserStats(client._id);
    totalTurnover += stats.currentMonth.totalReceived || 0;
    totalCommission += (stats.currentMonth.totalReceived || 0) * (client.agentRate || 0);
  }
  return { totalClients: clients.length, totalTurnover, totalCommission };
}

async function getSupportMetrics(userId) {
  const tickets = await Ticket.find({ assignedTo: userId });
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;
  return { totalTickets: tickets.length, resolvedTickets };
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUserByUsername,
  getUserByApiKey,
  getAllUsers,
  updateUser,
  updateAutoWithdrawSettings,
  generateApiKey,
  logAction,
  getAuditLogs,
  createAgent,
  getAgent,
  getAgentById,
  updateAgentBalance,
  getClientsByAgent,
  createAgentWithdrawalRequest,
  getPendingAgentWithdrawals,
  approveAgentWithdrawal,
  rejectAgentWithdrawal,
  addWallet,
  changeMainWallet,
  generateClientWallets,
  updateWalletLabel,
  updateWalletCategory,
  getAgentMetrics,
  getSupportMetrics
};
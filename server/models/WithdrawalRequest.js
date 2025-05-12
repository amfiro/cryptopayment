const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  address: String,
  currency: { type: String, required: true },
  status: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
  timestamp: { type: Date, default: Date.now },
  txHash: String
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
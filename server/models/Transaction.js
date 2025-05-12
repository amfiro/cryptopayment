const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  commissionPercentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

transactionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
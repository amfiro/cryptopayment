const mongoose = require('mongoose');

const agentWithdrawalRequestSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('AgentWithdrawalRequest', agentWithdrawalRequestSchema);
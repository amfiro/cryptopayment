const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  cryptoType: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
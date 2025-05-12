const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  commissionPercentage: { type: Number, required: true },
  note: { type: String },
  tronAddress: { type: String, required: true },
  ethereumAddress: { type: String, required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null },
  agentRate: { type: Number, min: 0.1, max: 0.25, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema);
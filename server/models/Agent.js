const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  username: { type: String },
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);
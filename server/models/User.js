const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'agent', 'support', 'senior_support', 'admin'], default: 'client' },
  commissionPercentage: { type: Number, default: 0 },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  tronAddress: { type: String },
  ethereumAddress: { type: String },
  additionalWallets: [{
    network: { type: String },
    address: { type: String },
    label: { type: String },
    category: { type: String }
  }],
  clientWallets: [{
    clientId: { type: String },
    network: { type: String },
    address: { type: String },
    label: { type: String },
    category: { type: String }
  }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  apiKey: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
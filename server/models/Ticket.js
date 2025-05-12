const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
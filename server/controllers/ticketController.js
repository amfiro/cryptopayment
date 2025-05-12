const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');

exports.createTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.create({
      ticketId: uuidv4(),
      userId: req.user.userId,
      message,
      status: 'open'
    });
    res.status(201).json({ message: 'Тикет создан', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.userId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    if (!['admin', 'support', 'senior_support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    if (!['admin', 'support', 'senior_support'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    res.json({ message: 'Статус тикета обновлён', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
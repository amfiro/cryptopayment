const User = require('../models/User');
const Agent = require('../models/Agent');
const userService = require('../services/userService');

exports.getRoles = async (req, res) => {
  try {
    const users = await User.find().select('name role');
    const agents = await Agent.find().select('name');
    res.json({ users, agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!['client', 'support', 'senior_support', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Роль обновлена', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { username, name } = req.body;
    const agent = await userService.createAgent(username, name);
    res.status(201).json({ message: 'Агент создан', agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
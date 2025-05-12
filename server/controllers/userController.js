const userService = require('../services/userService');

exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await userService.updateUser(req.user.userId, { name, email });
    res.json({ message: 'Пользователь обновлён', user });
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

exports.getAgentClients = async (req, res) => {
  try {
    const { agentId } = req.params;
    const clients = await userService.getClientsByAgent(agentId);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateApiKey = async (req, res) => {
  try {
    const apiKey = await userService.generateApiKey(req.user.userId);
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
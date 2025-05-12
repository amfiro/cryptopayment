const transactionService = require('../services/transactionService');
const userService = require('../services/userService');

exports.getSystemAnalytics = async (req, res) => {
  try {
    const stats = await transactionService.getOverallStats();
    const users = await userService.getAllUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    res.json({ stats, totalUsers, activeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await transactionService.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgentMetrics = async (req, res) => {
  try {
    const { agentId } = req.params;
    const metrics = await userService.getAgentMetrics(agentId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
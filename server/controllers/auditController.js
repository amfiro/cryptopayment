const userService = require('../services/userService');

exports.getAuditLogs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const logs = await userService.getAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
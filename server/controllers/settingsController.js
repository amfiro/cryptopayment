exports.updateSystemSettings = async (req, res) => {
  try {
    const { commissionRate, transactionLimit, blockchainApiToken, emailNotifications } = req.body;
    // Здесь можно сохранить настройки в базе или файле
    res.json({ message: 'Настройки обновлены', settings: { commissionRate, transactionLimit, blockchainApiToken, emailNotifications } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
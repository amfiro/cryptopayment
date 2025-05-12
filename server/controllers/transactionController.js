const transactionService = require('../services/transactionService');

exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.user.userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserBalance = async (req, res) => {
  try {
    const balance = await transactionService.getUserBalance(req.user.userId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forceTransfer = async (req, res) => {
  try {
    const { userId, currency } = req.body;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const amount = await transactionService.forceTransfer(userId, currency);
    res.json({ message: `Переведено ${amount} ${currency}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMainWalletBalances = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const balances = await transactionService.getMainWalletBalances();
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateTransactionCSV = async (req, res) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.user.userId);
    const filename = `transactions_${req.user.userId}.csv`;
    await transactionService.generateTransactionCSV(transactions, filename);
    res.download(filename, () => fs.unlinkSync(filename));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
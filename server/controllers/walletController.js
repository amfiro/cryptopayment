const userService = require('../services/userService');
const blockchainService = require('../services/blockchainService');

exports.addWallet = async (req, res) => {
  try {
    const { network, address, label, category } = req.body;
    const user = await userService.addWallet(req.user.userId, network, address, label, category);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeMainWallet = async (req, res) => {
  try {
    const { network, address } = req.body;
    const user = await userService.changeMainWallet(req.user.userId, network, address);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateClientWallets = async (req, res) => {
  try {
    const { count, network, label, category } = req.body;
    const user = await userService.generateClientWallets(req.user.userId, count, network, label, category);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateWalletLabel = async (req, res) => {
  try {
    const { walletType, index, label } = req.body;
    const user = await userService.updateWalletLabel(req.user.userId, walletType, index, label);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateWalletCategory = async (req, res) => {
  try {
    const { walletType, index, category } = req.body;
    const user = await userService.updateWalletCategory(req.user.userId, walletType, index, category);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWalletBalances = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    const balances = {
      tron: await blockchainService.getTronBalance(user.tronAddress),
      ethereum: await blockchainService.getEthereumBalance(user.ethereumAddress),
      usdt: await blockchainService.getUsdtBalance(user.ethereumAddress)
    };
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
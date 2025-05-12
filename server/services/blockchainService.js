const TronWeb = require('tronweb');
const ethers = require('ethers');
require('dotenv').config();

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE,
  privateKey: process.env.MAIN_TRON_PRIVATE_KEY
});

const ethProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER_URL);
const ethWallet = new ethers.Wallet(process.env.MAIN_ETHEREUM_PRIVATE_KEY, ethProvider);
const usdtContractAddress = process.env.ERC20_USDT_CONTRACT_ADDRESS;
const usdtABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];
const usdtContract = new ethers.Contract(usdtContractAddress, usdtABI, ethWallet);

async function validateTronAddress(address) {
  try {
    return tronWeb.isAddress(address);
  } catch (err) {
    console.error('Ошибка проверки TRON адреса:', err.message);
    return false;
  }
}

async function validateEthereumAddress(address) {
  try {
    return ethers.utils.isAddress(address);
  } catch (err) {
    console.error('Ошибка проверки Ethereum адреса:', err.message);
    return false;
  }
}

async function getTronBalance(address) {
  try {
    const balance = await tronWeb.trx.getBalance(address);
    return tronWeb.fromSun(balance);
  } catch (err) {
    console.error('Ошибка получения TRON баланса:', err.message);
    return 0;
  }
}

async function getEthereumBalance(address) {
  try {
    const balance = await ethProvider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (err) {
    console.error('Ошибка получения Ethereum баланса:', err.message);
    return 0;
  }
}

async function getUsdtBalance(address) {
  try {
    const balance = await usdtContract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 6);
  } catch (err) {
    console.error('Ошибка получения USDT баланса:', err.message);
    return 0;
  }
}

async function sendTronTransaction(toAddress, amount) {
  try {
    const tx = await tronWeb.trx.sendTransaction(toAddress, tronWeb.toSun(amount), process.env.MAIN_TRON_PRIVATE_KEY);
    return tx.txid;
  } catch (err) {
    console.error('Ошибка отправки TRON транзакции:', err.message);
    throw err;
  }
}

async function sendEthereumTransaction(toAddress, amount) {
  try {
    const tx = await ethWallet.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amount.toString())
    });
    return tx.hash;
  } catch (err) {
    console.error('Ошибка отправки Ethereum транзакции:', err.message);
    throw err;
  }
}

async function sendUsdtTransaction(toAddress, amount) {
  try {
    const tx = await usdtContract.transfer(toAddress, ethers.utils.parseUnits(amount.toString(), 6));
    return tx.hash;
  } catch (err) {
    console.error('Ошибка отправки USDT транзакции:', err.message);
    throw err;
  }
}

module.exports = {
  validateTronAddress,
  validateEthereumAddress,
  getTronBalance,
  getEthereumBalance,
  getUsdtBalance,
  sendTronTransaction,
  sendEthereumTransaction,
  sendUsdtTransaction
};
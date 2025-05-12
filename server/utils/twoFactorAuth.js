const speakeasy = require('speakeasy');

const generate2FASecret = (userName) => {
  return speakeasy.generateSecret({ name: `CryptoBot:${userName}` });
};

const verify2FACode = (secret, code) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code
  });
};

module.exports = { generate2FASecret, verify2FACode };
const userService = require('../services/userService');
const speakeasy = require('speakeasy');

const register = async (req, res) => {
  try {
    const { email, username, password, name, role } = req.body;
    if (!email || !username || !password || !name) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    const user = await userService.createUser({ email, username, password, name, role });
    res.status(201).json({ message: 'Пользователь зарегистрирован', userId: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email или username уже занят' });
    }
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await userService.findUserByEmailOrUsername(login);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    const token = userService.generateToken(user);
    res.json({ token, user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login };
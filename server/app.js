const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB подключён через Mongoose'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Сервис пользователя
const userService = {
  async createUser(data) {
    const { email, username, password, name, role } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashedPassword,
      name,
      role,
    });
    return await user.save();
  }
};

// Маршрут регистрации
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'Пользователь создан', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Маршрут логина
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API сервер запущен на порту ${PORT}`));

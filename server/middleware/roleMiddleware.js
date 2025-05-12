const jwt = require('jsonwebtoken');

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Проверяем наличие заголовков
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Проверяем, входит ли роль пользователя в разрешённые роли
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Недостаточно прав' });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: 'Недействительный токен' });
    }
  };
};

module.exports = roleMiddleware;
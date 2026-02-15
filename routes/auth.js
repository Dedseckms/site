const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const config = require('../config');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  body('name').trim().notEmpty().withMessage('Укажите имя')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = String(req.body.email || '').trim().toLowerCase();
    const { password, name } = req.body;
    if (db.users.getByEmail(email)) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = db.users.create({ email, password_hash, name, role: 'user' });
    const { password_hash: _, ...safeUser } = user;

    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', [
  body('email').trim().notEmpty().withMessage('Укажите email'),
  body('password').notEmpty().withMessage('Укажите пароль')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const user = db.users.getByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
    const { password_hash, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/me', auth, (req, res) => {
  const user = db.users.getById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const { password_hash, ...safe } = user;
  res.json(safe);
});

module.exports = router;

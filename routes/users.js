const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, adminOnly, (req, res) => {
  const users = db.users.getAll().map(({ password_hash, ...u }) => u);
  res.json(users);
});

router.post('/admin', async (req, res) => {
  const admins = db.users.getAll().filter(u => u.role === 'admin');
  if (admins.length > 0) return res.status(403).json({ error: 'Администратор уже существует' });

  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Укажите email, пароль и имя' });

  const hash = await bcrypt.hash(password, 10);
  db.users.create({ email, password_hash: hash, name, role: 'admin' });
  res.status(201).json({ message: 'Администратор создан' });
});

module.exports = router;

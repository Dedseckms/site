const express = require('express');
const db = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.settings.getAll());
});

router.put('/', auth, adminOnly, (req, res) => {
  try {
    const updates = req.body;
    if (typeof updates !== 'object') return res.status(400).json({ error: 'Неверный формат' });
    const settings = db.settings.update(updates);
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

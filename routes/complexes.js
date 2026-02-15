const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const list = db.complexes.getAll().map(c => ({
    ...c,
    images: Array.isArray(c.images) ? c.images : JSON.parse(c.images || '[]')
  }));
  res.json(list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.get('/:slug', (req, res) => {
  const c = db.complexes.getBySlug(req.params.slug);
  if (!c) return res.status(404).json({ error: 'Комплекс не найден' });
  const images = Array.isArray(c.images) ? c.images : JSON.parse(c.images || '[]');
  res.json({ ...c, images });
});

router.post('/', auth, adminOnly, [
  body('name').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price_from').trim().notEmpty(),
  body('rooms').trim().notEmpty(),
  body('status').trim().notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, location, description, price_from, rooms, status, images = [] } = req.body;
    const complex = db.complexes.create({ name, location, description, price_from, rooms, status, images });
    res.status(201).json(complex);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', auth, adminOnly, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.complexes.getById(id);
  if (!existing) return res.status(404).json({ error: 'Комплекс не найден' });

  const updates = { ...req.body };
  delete updates.id;
  delete updates.created_at;
  if (updates.images && !Array.isArray(updates.images)) updates.images = [];

  const updated = db.complexes.update(id, updates);
  res.json(updated);
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ok = db.complexes.delete(id);
  if (!ok) return res.status(404).json({ error: 'Комплекс не найден' });
  res.json({ success: true });
});

module.exports = router;

const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');

// Инициализация БД (создаёт таблицы при первом запуске)
require('./db/database');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complexes', require('./routes/complexes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));

// Статические файлы (корень проекта)
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
  const file = path.join(__dirname, req.path === '/' ? 'index.html' : req.path);
  const fs = require('fs');
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return res.sendFile(file);
  }
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = config.PORT;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Админка: http://localhost:${PORT}/admin.html`);
});

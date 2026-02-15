const path = require('path');
const fs = require('fs');

// Создать папку data
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Создана папка data/');
}

// Инициализация БД
require('../db/database');
console.log('База данных инициализирована.');

const bcrypt = require('bcryptjs');
const db = require('../db/database');

// Создать первого админа если нет
const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
if (adminCount.c === 0) {
  const email = process.env.ADMIN_EMAIL || 'admin@luxestate.ru';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
    .run(email, hash, 'Администратор', 'admin');
  console.log('');
  console.log('Создан администратор:');
  console.log('  Email:', email);
  console.log('  Пароль:', password);
  console.log('');
}

process.exit(0);

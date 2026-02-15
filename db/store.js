const fs = require('fs');
const path = require('path');
const config = require('../config');

const DATA_DIR = path.resolve(__dirname, '..', config.DB_PATH.replace(/\/$/, ''));
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPLEXES_FILE = path.join(DATA_DIR, 'complexes.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, defaultVal) {
  ensureDir();
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch {
    if (Array.isArray(defaultVal)) return defaultVal;
    if (typeof defaultVal === 'object' && defaultVal !== null) return { ...defaultVal };
    return [];
  }
}

function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const defaultSettings = {
  color_accent: '#c9a962',
  color_bg: '#0a0e17',
  hero_title: 'Дома мечты в лучших локациях',
  hero_subtitle: 'Премиальные жилые комплексы',
  company_phone: '+7 (800) 123-45-67',
  company_email: 'info@luxestate.ru'
};

const db = {
  users: {
    getAll() {
      return readJson(USERS_FILE, []);
    },
    getById(id) {
      return db.users.getAll().find(u => u.id === id);
    },
    getByEmail(email) {
      const normalized = String(email || '').toLowerCase().trim();
      return db.users.getAll().find(u => String(u.email || '').toLowerCase() === normalized);
    },
    create(user) {
      const users = db.users.getAll();
      const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = { ...user, id, created_at: new Date().toISOString() };
      users.push(newUser);
      writeJson(USERS_FILE, users);
      return newUser;
    },
    update(id, updates) {
      const users = db.users.getAll();
      const i = users.findIndex(u => u.id === id);
      if (i === -1) return null;
      users[i] = { ...users[i], ...updates };
      writeJson(USERS_FILE, users);
      return users[i];
    }
  },
  complexes: {
    getAll() {
      return readJson(COMPLEXES_FILE, []);
    },
    getById(id) {
      return db.complexes.getAll().find(c => c.id === id);
    },
    getBySlug(slug) {
      return db.complexes.getAll().find(c => c.slug === slug);
    },
    create(complex) {
      const list = db.complexes.getAll();
      const id = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
      const slug = (complex.name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zа-яё0-9-]/gi, '');
      const newC = {
        ...complex,
        id,
        slug: slug || 'complex-' + id,
        images: complex.images || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      list.push(newC);
      writeJson(COMPLEXES_FILE, list);
      return newC;
    },
    update(id, updates) {
      const list = db.complexes.getAll();
      const i = list.findIndex(c => c.id === id);
      if (i === -1) return null;
      if (updates.name) {
        updates.slug = updates.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-zа-яё0-9-]/gi, '') || list[i].slug;
      }
      list[i] = { ...list[i], ...updates, updated_at: new Date().toISOString() };
      writeJson(COMPLEXES_FILE, list);
      return list[i];
    },
    delete(id) {
      const list = db.complexes.getAll();
      const i = list.findIndex(c => c.id === id);
      if (i === -1) return false;
      list.splice(i, 1);
      writeJson(COMPLEXES_FILE, list);
      return true;
    }
  },
  settings: {
    getAll() {
      const s = readJson(SETTINGS_FILE, defaultSettings);
      return { ...defaultSettings, ...s };
    },
    update(updates) {
      const current = db.settings.getAll();
      const merged = { ...current, ...updates };
      writeJson(SETTINGS_FILE, merged);
      return merged;
    }
  }
};

module.exports = db;

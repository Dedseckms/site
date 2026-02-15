const API = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null')
  ? window.location.origin + '/api'
  : '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearToken();
    showLogin();
    throw new Error('Сессия истекла');
  }

  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Ошибка запроса');
  }

  return data;
}

// ===== Login =====
function showLogin() {
  document.getElementById('admin-login').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
}

function showPanel(user) {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  document.getElementById('admin-user').textContent = user?.name || user?.email || '';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  try {
    const form = e.target;
    const email = (form.querySelector('[name=email]') || form.elements?.email)?.value;
    const password = (form.querySelector('[name=password]') || form.elements?.password)?.value;
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email: (email || '').trim(), password: password || '' })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Ошибка входа';
      errEl.style.display = 'block';
      return;
    }

    setToken(data.token);
    showPanel(data.user);

    if (data.user.role !== 'admin') {
      alert('У вас нет прав администратора');
      clearToken();
      showLogin();
      return;
    }

    loadComplexes();
    loadSettings();
    loadUsers();
  } catch (err) {
    errEl.textContent = err.message || 'Ошибка сети. Убедитесь, что сайт открыт через http://localhost:3000';
    errEl.style.display = 'block';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  showLogin();
});

// ===== Nav sections =====
document.querySelectorAll('.admin-nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('section-' + btn.dataset.section).classList.add('active');
  });
});

// ===== Complexes =====
async function loadComplexes() {
  try {
    const list = await api('/complexes');
    const tbody = document.getElementById('complexes-list');
    tbody.innerHTML = list.map(c => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.location)}</td>
        <td>${escapeHtml(c.price_from)}</td>
        <td>${escapeHtml(c.status)}</td>
        <td>
          <div class="admin-actions">
            <button class="btn-edit" data-id="${c.id}">Редактировать</button>
            <button class="btn-delete" data-id="${c.id}">Удалить</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit').forEach(b => {
      b.addEventListener('click', () => openComplexModal(parseInt(b.dataset.id)));
    });
    tbody.querySelectorAll('.btn-delete').forEach(b => {
      b.addEventListener('click', () => deleteComplex(parseInt(b.dataset.id)));
    });
  } catch (err) {
    console.error(err);
  }
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.getElementById('add-complex-btn').addEventListener('click', () => openComplexModal(null));

function openComplexModal(id) {
  document.getElementById('complex-modal-title').textContent = id ? 'Редактировать комплекс' : 'Добавить комплекс';
  document.getElementById('complex-id').value = id || '';
  document.getElementById('complex-form').reset();

  if (id) {
    api('/complexes').then(list => {
      const c = list.find(x => x.id === parseInt(id, 10));
      if (c) {
        document.getElementById('complex-name').value = c.name;
        document.getElementById('complex-location').value = c.location;
        document.getElementById('complex-description').value = c.description;
        document.getElementById('complex-price').value = c.price_from;
        document.getElementById('complex-rooms').value = c.rooms;
        document.getElementById('complex-status').value = c.status;
        document.getElementById('complex-images').value = (c.images || []).join('\n');
      }
    });
  }

  document.getElementById('complex-modal').classList.add('active');
}

document.getElementById('close-complex-modal').addEventListener('click', () => {
  document.getElementById('complex-modal').classList.remove('active');
});

document.getElementById('complex-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('complex-id').value;
  const images = document.getElementById('complex-images').value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const data = {
    name: document.getElementById('complex-name').value,
    location: document.getElementById('complex-location').value,
    description: document.getElementById('complex-description').value,
    price_from: document.getElementById('complex-price').value,
    rooms: document.getElementById('complex-rooms').value,
    status: document.getElementById('complex-status').value,
    images
  };

  try {
    if (id) {
      await api('/complexes/' + id, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await api('/complexes', { method: 'POST', body: JSON.stringify(data) });
    }
    document.getElementById('close-complex-modal').click();
    loadComplexes();
  } catch (err) {
    alert(err.message);
  }
});

async function deleteComplex(id) {
  if (!confirm('Удалить этот комплекс?')) return;
  try {
    await api('/complexes/' + id, { method: 'DELETE' });
    loadComplexes();
  } catch (err) {
    alert(err.message);
  }
}

// ===== Settings =====
const SETTING_KEYS = [
  ['color_accent', 'Цвет акцента', 'color'],
  ['color_bg', 'Фон страницы', 'color'],
  ['hero_title', 'Заголовок главной', 'text'],
  ['hero_subtitle', 'Подзаголовок', 'text'],
  ['company_phone', 'Телефон', 'text'],
  ['company_email', 'Email', 'email']
];

async function loadSettings() {
  try {
    const s = await api('/settings');
    const grid = document.getElementById('settings-grid');
    grid.innerHTML = SETTING_KEYS.map(([key, label, type]) => `
      <div class="settings-item">
        <label>${escapeHtml(label)}</label>
        <input type="${type}" id="setting-${key}" value="${escapeHtml(s[key] || '')}">
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('save-settings-btn').addEventListener('click', async () => {
  const updates = {};
  SETTING_KEYS.forEach(([key]) => {
    const el = document.getElementById('setting-' + key);
    if (el) updates[key] = el.value;
  });
  try {
    await api('/settings', { method: 'PUT', body: JSON.stringify(updates) });
    alert('Настройки сохранены');
  } catch (err) {
    alert(err.message);
  }
});

// ===== Users =====
async function loadUsers() {
  try {
    const users = await api('/users');
    const tbody = document.getElementById('users-list');
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${u.role}</td>
        <td>${new Date(u.created_at).toLocaleDateString('ru')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// ===== Init =====
(async () => {
  if (!getToken()) {
    showLogin();
    return;
  }
  try {
    const user = await api('/auth/me');
    if (user.role !== 'admin') {
      clearToken();
      showLogin();
      return;
    }
    showPanel(user);
    loadComplexes();
    loadSettings();
    loadUsers();
  } catch {
    showLogin();
  }
})();
